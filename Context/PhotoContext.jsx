import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  (typeof process !== "undefined" && process.env?.REACT_APP_API_BASE_URL) ||
  "https://image-buy-app-backend.onrender.com";

const api = axios.create({ baseURL: `${API_BASE}/api`, withCredentials: false });

const PhotoContext = createContext();
export const usePhotos = () => {
  const ctx = useContext(PhotoContext);
  if (!ctx) throw new Error("usePhotos must be used within a PhotoProvider");
  return ctx;
};

// Normalize -> absolute watermarked URL:
// accepts e.g. "watermarked\\a.jpg" or "uploads/watermarked/a.jpg" -> "https://.../uploads/watermarked/a.jpg"
const toWatermarkedUrl = (pathFromApi) => {
  if (!pathFromApi) return undefined;
  let p = String(pathFromApi).replace(/\\/g, "/").trim();
  if (/^https?:\/\//i.test(p)) return p;
  if (p.startsWith("/")) p = p.slice(1);
  if (!p.startsWith("uploads/")) p = `uploads/${p}`;
  return `${API_BASE}/${p}`;
};

export const PhotoProvider = ({ children }) => {
  const [photos, setPhotos] = useState([]);
  const [wmPhotos, setWmPhotos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ---------- FETCHERS ----------
  const fetchCategories = async () => {
    const { data } = await api.get("/categories");
    const arr = Array.isArray(data) ? data : [];
    const norm = [...new Set(arr.map((c) => String(c || "").trim()).filter(Boolean))];
    setCategories(norm);
    return norm;
  };

  const fetchPhotos = async () => {
    const { data } = await api.get("/photos");
    const list = Array.isArray(data) ? data : [];
    const normalized = list.map((p) => {
      const url = toWatermarkedUrl(p.path_to_watermark || p.watermarkedPath || p.path);
      return {
        ...p,
        id: p.id || p._id || p.filename || url,
        url,
        watermarkedUrl: url,
        watermarkedPath: url,
        uploadedAt: p.updated ? new Date(p.updated) : new Date(),
        category: (p.category || "").trim(),
        price: typeof p.price === "number" ? p.price : (p.price ?? 0),
        filename: p.filename || p.title || "Photo",
      };
    });
    setPhotos(normalized);
    setWmPhotos(normalized);
    return normalized;
  };

  const uploadPhotos = async ({ files, categories = [], prices = [] }) => {
    const fd = new FormData();
    const list = Array.from(files);

    list.forEach((file) => fd.append("photos", file));

    // 🔁 ΣΗΜΑΝΤΙΚΟ: χρησιμοποίησε [] για arrays
    list.forEach((_, i) => fd.append("prices[]", String(prices[i] ?? "")));
    list.forEach((_, i) => fd.append("categories[]", categories[i] ?? ""));

    const res = await fetch(`${API_BASE}/api/photos/upload-multiple`, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    const data = await res.json();
    await fetchPhotos();
    return data;
  };

  // Update photo (price/category). Tries PUT then falls back to PATCH if needed.
  const updatePhoto = async (photoId, payload) => {
    try {
      await api.put(`/photos/${photoId}`, payload);
    } catch {
      await api.patch(`/photos/${photoId}`, payload);
    }
    await fetchPhotos();
  };

  // Delete one or many
  const deletePhotos = async (ids) => {
    const arr = Array.isArray(ids) ? ids : [ids];
    if (arr.length === 1) {
      await api.delete(`/photos/${arr[0]}`);
    } else if (arr.length > 1) {
      // Preferred bulk form (matches your HTML tester)
      await api.delete(`/photos/bulk`, { data: { photo_ids: arr } });
    }
    await fetchPhotos();
  };

  // Categories CRUD
  const createCategory = async (name) => {
    await api.post(`/categories`, { name });
    await fetchCategories();
  };
  const removeCategory = async (name) => {
    await api.delete(`/categories/${encodeURIComponent(name)}`);
    await fetchCategories();
    await fetchPhotos();
  };

  // ---------- INIT ----------
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([fetchCategories(), fetchPhotos()]);
      } catch (e) {
        setError(e?.response?.data?.error || e.message || "Load failed");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // (Optional) derived helpers για admin analytics, αν τα χρειαστείς μελλοντικά
  const photosByCategory = useMemo(() => {
    const map = new Map();
    photos.forEach((p) => {
      const c = (p.category || "").trim();
      map.set(c, (map.get(c) || 0) + 1);
    });
    return map;
  }, [photos]);

  return (
    <PhotoContext.Provider
      value={{
        // data
        photos,
        wmPhotos,
        categories,
        loading,
        error,

        // fetchers
        fetchPhotos,
        fetchCategories,

        // admin actions
        uploadPhotos,
        updatePhoto,
        deletePhotos,
        createCategory,
        removeCategory,

        // misc
        apiBase: API_BASE,
        photosByCategory,
      }}
    >
      {children}
    </PhotoContext.Provider>
  );
};
