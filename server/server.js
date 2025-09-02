// server/server.js
import express from "express";
import "dotenv/config";
import cors from "cors";
import crypto from "crypto";

/* ========= ENV ========= */
const {
  PORT = 3000,
  ALLOWED_ORIGIN = "http://localhost:5173",
  MYPOS_PRIVATE_KEY_PEM,
  MYPOS_PUBLIC_CERT_PEM,
} = process.env;

if (!MYPOS_PRIVATE_KEY_PEM) {
  console.error("❌ Missing MYPOS_PRIVATE_KEY_PEM in .env");
  process.exit(1);
}

/* ========= APP ========= */
const app = express();
app.set("trust proxy", true);

// myPOS notify έρχεται ως application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors({ origin: ALLOWED_ORIGIN, credentials: false }));

/* ========= HELPERS ========= */

// Γυρίζει "\\n" σε πραγματικά newlines και καθαρίζει CR/LF
function normalizePem(raw) {
  return (raw || "")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
}

// Επαλήθευση ότι το env περιέχει ΟΝΤΩΣ PRIVATE KEY (και όχι CERT)
function validatePrivateKeyPem(pem) {
  const hasPrivate = /^-----BEGIN (RSA )?PRIVATE KEY-----$/m.test(pem);
  const hasCert = /^-----BEGIN CERTIFICATE-----$/m.test(pem);
  if (!hasPrivate) {
    throw new Error(
      "MYPOS_PRIVATE_KEY_PEM: missing PRIVATE KEY block (check .env value)"
    );
  }
  if (hasCert) {
    throw new Error(
      "MYPOS_PRIVATE_KEY_PEM contains a CERTIFICATE block — put only the PRIVATE KEY here"
    );
  }
}

// Δημιουργεί KeyObject με σωστό type (pkcs1 vs pkcs8) από το .env
function makeKeyObjectFromEnv() {
  const pem = normalizePem(MYPOS_PRIVATE_KEY_PEM);
  validatePrivateKeyPem(pem);
  const isPkcs1 = /^-----BEGIN RSA PRIVATE KEY-----$/m.test(pem);
  return crypto.createPrivateKey({
    key: pem,
    format: "pem",
    type: isPkcs1 ? "pkcs1" : "pkcs8",
  });
}

// Σταθερή μετατροπή αντικειμένων/arrays σε string για υπογραφή
function stableStringify(v) {
  if (v === null || typeof v !== "object") return String(v);
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(",")}]`;
  // object: sort keys for determinism
  return `{${Object.keys(v)
    .sort()
    .map((k) => `${k}:${stableStringify(v[k])}`)
    .join(",")}}`;
}

// Χτίζει canonical string: ταξινόμηση keys αλφαβητικά, χωρίς το "signature"
function buildCanonical(params) {
  return Object.entries(params || {})
    .filter(([k]) => k.toLowerCase() !== "signature")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${stableStringify(v)}`)
    .join("&");
}

/* ========= ROUTES ========= */

// Υπογραφή παραμέτρων πληρωμής (frontend → POST εδώ με paymentParams)
app.post("/mypos/sign", (req, res) => {
  try {
    const canonical = buildCanonical(req.body || {});
    const keyObj = makeKeyObjectFromEnv();

    const signature = crypto.sign(
      "RSA-SHA256",
      Buffer.from(canonical, "utf8"),
      keyObj
    );

    return res.json({ signature: signature.toString("base64") });
  } catch (err) {
    console.error("sign error:", err);
    return res.status(500).json({ error: "sign_failed" });
  }
});

// myPOS notify (προαιρετικό verify της υπογραφής του notify)
app.post("/mypos/notify", (req, res) => {
  try {
    console.log("🔔 myPOS notify payload:", req.body);

    const certPem = normalizePem(MYPOS_PUBLIC_CERT_PEM);

    if (certPem && req.body && req.body.signature) {
      const { signature, ...rest } = req.body;
      const canonical = buildCanonical(rest);

      const verifier = crypto.createVerify("RSA-SHA256");
      verifier.update(Buffer.from(canonical, "utf8"));
      const isValid = verifier.verify(certPem, signature, "base64");

      if (!isValid) {
        console.warn("⚠️ notify signature INVALID");
      } else {
        console.log("✅ notify signature OK");
      }
    }

    // Η myPOS περιμένει 200/OK
    return res.status(200).send("OK");
  } catch (err) {
    console.error("notify error:", err);
    // Επιστρέφουμε 200 ώστε να μη γίνεται retry αέναα
    return res.status(200).send("OK");
  }
});

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

/* ========= START ========= */
app.listen(PORT, () => {
  console.log(`✅ Server listening on ${PORT}`);
});
