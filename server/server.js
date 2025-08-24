// server.js
import express from "express";
import 'dotenv/config';
import cors from "cors";
import crypto from "crypto";

// ─────────── ENV ───────────
// .env:
// PORT=3000
// ALLOWED_ORIGIN=http://localhost:5173
// MYPOS_PRIVATE_KEY_PEM="-----BEGIN PRIVATE KEY-----\n..."
// (προαιρετικά) MYPOS_PUBLIC_CERT_PEM="-----BEGIN CERTIFICATE-----\n..."  // για verify notify
const {
  PORT = 3000,
  ALLOWED_ORIGIN = "http://localhost:5173",
  MYPOS_PRIVATE_KEY_PEM,
  MYPOS_PUBLIC_CERT_PEM, // sandbox public cert (μόνο για επαλήθευση)
} = process.env;

if (!MYPOS_PRIVATE_KEY_PEM) {
  console.error("❌ Missing MYPOS_PRIVATE_KEY_PEM in env");
  process.exit(1);
}

const app = express();
app.set("trust proxy", true);

// H myPOS στέλνει notify ως application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// Το δικό σου frontend στέλνει JSON στο /sign
app.use(express.json());
app.use(cors({ origin: ALLOWED_ORIGIN, credentials: false }));

// Βοηθητικό: φτιάχνει το canonical string που θα υπογράψουμε
function buildCanonical(params) {
  // 1) πετάμε το 'signature'
  const entries = Object.entries(params).filter(([k]) => k.toLowerCase() !== "signature");

  // 2) ταξινόμηση αλφαβητικά με βάση το key
  entries.sort(([a], [b]) => a.localeCompare(b));

  // 3) join ως key=value με & (χωρίς επιπλέον spaces)
  // (αν κάποια τιμή έχει & ή = άφησέ τη raw, το myPOS SDK περιμένει raw values)
  return entries.map(([k, v]) => `${k}=${v}`).join("&");
}

// ─────────────────────────────────────────────────────────
// 1) Υπογραφή για Embedded Checkout
// Frontend: POST /mypos/sign με το αντικείμενο παραμέτρων ΧΩΡΙΣ signature
// Επιστρέφουμε { signature }
app.post("/mypos/sign", (req, res) => {
  try {
    const params = req.body || {};
    const canonical = buildCanonical(params);

    const signer = crypto.createSign("RSA-SHA256");
    signer.update(Buffer.from(canonical, "utf8"));
    const signature = signer.sign(MYPOS_PRIVATE_KEY_PEM, "base64");

    return res.json({ signature });
  } catch (err) {
    console.error("sign error:", err);
    return res.status(500).json({ error: "sign_failed" });
  }
});

// ─────────────────────────────────────────────────────────
// 2) Notify URL από myPOS (ΠΡΕΠΕΙ να είναι https/public στο sandbox/live)
// myPOS απαιτεί: απάντηση 200 με body ακριβώς "OK"
app.post("/mypos/notify", (req, res) => {
  try {
    // Τα πεδία έρχονται form-url-encoded στο req.body
    console.log("🔔 myPOS notify payload:", req.body);

    // (Προαιρετικά) verify signature του notify:
    // Αν το payload περιέχει 'signature', φτιάχνεις canonical και επαληθεύεις:
    if (MYPOS_PUBLIC_CERT_PEM && req.body && req.body.signature) {
      const { signature, ...rest } = req.body;
      const canonical = buildCanonical(rest);
      const verifier = crypto.createVerify("RSA-SHA256");
      verifier.update(Buffer.from(canonical, "utf8"));
      const isValid = verifier.verify(MYPOS_PUBLIC_CERT_PEM, signature, "base64");
      if (!isValid) {
        console.warn("⚠️ notify signature INVALID");
        // Δεν απαντάμε με error για να μη ξανα-χτυπάει αέναα, απλά log
      } else {
        console.log("✅ notify signature OK");
      }
    }

    // TODO: εδώ κάνε update την παραγγελία σου (mark paid/failed κ.λπ.)

    // Απάντηση που απαιτείται από myPOS:
    return res.status(200).send("OK");
  } catch (err) {
    console.error("notify error:", err);
    // Παρόλα αυτά προτείνεται να απαντήσεις "OK" για να μη γίνει retry storm
    return res.status(200).send("OK");
  }
});

// health check
app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`✅ Server listening on ${PORT}`);
});
