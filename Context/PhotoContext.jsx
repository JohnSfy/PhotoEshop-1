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
    try {
      console.log("🔄 Fetching photos from API...");
      const response = await api.get("/photos");
      console.log("📡 Fetch response status:", response.status);
      console.log("📥 Raw API response:", response.data);
      
      const list = Array.isArray(response.data) ? response.data : [];
      console.log("📋 Photos list length:", list.length);
      console.log("📋 Photos list:", list);
      
      if (list.length === 0) {
        console.warn("⚠️ No photos returned from API!");
      }
      
      const normalized = list.map((p) => {
        const url = toWatermarkedUrl(p.path_to_watermark || p.watermarkedPath || p.path);
        const normalizedPhoto = {
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
        console.log("🖼️ Normalized photo:", normalizedPhoto);
        return normalizedPhoto;
      });
      
      console.log("✨ Total normalized photos:", normalized.length);
      console.log("✨ Normalized photos:", normalized);
      
      setPhotos(normalized);
      setWmPhotos(normalized);
      return normalized;
    } catch (error) {
      console.error("❌ Error fetching photos:", error);
      console.error("❌ Error response:", error.response?.data);
      throw error;
    }
  };

  const uploadPhotos = async ({ files, categories = [], prices = [] }) => {
    const fd = new FormData();
    const list = Array.from(files);

    list.forEach((file) => fd.append("photos", file));

    // Backend expects single values: req.body.price and req.body.category
    // Since all photos get the same category and price, use the first values
    if (categories.length > 0 && categories[0]) {
      fd.append("category", categories[0]);
    }
    if (prices.length > 0 && prices[0]) {
      fd.append("price", String(prices[0]));
    }

    // Debug logging
    console.log("🚀 PhotoContext Upload Debug:");
    console.log("Categories received:", categories);
    console.log("Prices received:", prices);
    console.log("Sending to backend:");
    console.log("  category:", categories[0] || "undefined");
    console.log("  price:", prices[0] || "undefined");
    console.log("FormData entries:");
    for (let [key, value] of fd.entries()) {
      console.log(`  ${key}:`, value);
    }

    const res = await fetch(`${API_BASE}/api/photos/upload-multiple`, {
      method: "POST",
      body: fd,
    });
    
    console.log("📡 Upload response status:", res.status);
    console.log("📡 Upload response headers:", Object.fromEntries(res.headers.entries()));
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Upload failed:", res.status, errorText);
      throw new Error(`Upload failed: ${res.status} - ${errorText}`);
    }
    
    const data = await res.json();
    console.log("📥 Server response:", data);
    console.log("📥 Upload results:", data.results);
    console.log("📥 Summary:", data.summary);
    
    // Check if upload was actually successful
    if (data.summary && data.summary.successful === 0) {
      console.error("❌ No photos were successfully uploaded!");
      throw new Error("No photos were successfully uploaded");
    }
    
    // Force refresh photos multiple times to ensure we get the latest data
    console.log("🔄 Refreshing photos after upload...");
    await fetchPhotos();
    
    // Wait a bit and refresh again (in case of server processing delay)
    setTimeout(async () => {
      console.log("🔄 Second refresh after upload...");
      await fetchPhotos();
    }, 2000);
    
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
    console.log("🗑️ PhotoContext deletePhotos called with:", ids);
    const arr = Array.isArray(ids) ? ids : [ids];
    console.log("📋 Processing array:", arr);
    
    try {
      if (arr.length === 1) {
        console.log("🔸 Single delete - calling:", `/photos/${arr[0]}`);
        await api.delete(`/photos/${arr[0]}`);
        console.log("✅ Single delete successful");
      } else if (arr.length > 1) {
        console.log("🔸 Bulk delete - deleting photos one by one (bulk endpoint not available)");
        console.log("📋 Photos to delete:", arr);
        
        // Delete photos one by one since bulk endpoint doesn't exist
        const deletePromises = arr.map(async (id, index) => {
          console.log(`🔸 Deleting photo ${index + 1}/${arr.length}:`, id);
          try {
            await api.delete(`/photos/${id}`);
            console.log(`✅ Photo ${id} deleted successfully`);
            return { id, success: true };
          } catch (error) {
            console.error(`❌ Failed to delete photo ${id}:`, error);
            return { id, success: false, error };
          }
        });
        
        const results = await Promise.all(deletePromises);
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        console.log(`📊 Delete results: ${successful} successful, ${failed} failed`);
        
        if (failed > 0) {
          const failedIds = results.filter(r => !r.success).map(r => r.id);
          console.warn("⚠️ Some photos failed to delete:", failedIds);
          // Don't throw error, just log it - some photos might have been deleted
        }
      }
      
      console.log("🔄 Refreshing photos after delete...");
      await fetchPhotos();
      console.log("✅ Photos refreshed after delete");
    } catch (error) {
      console.error("❌ Delete operation failed:", error);
      console.error("❌ Error response:", error.response?.data);
      throw error;
    }
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
