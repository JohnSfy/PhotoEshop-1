import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import photo1 from "../src/assets/photo1.jpg";
import photo2 from "../src/assets/photo2.jpg";
import photo3 from "../src/assets/photo3.jpg";
import photo4 from "../src/assets/photo4.jpg";

const PhotoContext = createContext();
export const usePhotos = () => {
  const ctx = useContext(PhotoContext);
  if (!ctx) throw new Error("usePhotos must be used within a PhotoProvider");
  return ctx;
};

export const PhotoProvider = ({ children }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  // 1) Seed with local images
  useEffect(() => {
    const dummy = [
      { id: 1, url: photo1, title: "Photo 1", price: 5, uploadedAt: new Date() },
      { id: 2, url: photo2, title: "Photo 2", price: 8, uploadedAt: new Date() },
      { id: 3, url: photo3, title: "Photo 3", price: 10, uploadedAt: new Date() },
      { id: 4, url: photo4, title: "Photo 4", price: 12, uploadedAt: new Date() },
    ];
    setPhotos(dummy);
    setLoading(false);
  }, []);

  // 2) Optional: try API, but keep existing photos on failure
  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/photos");
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.photos)
        ? res.data.photos
        : [];
      if (data.length) setPhotos(data);
      setError(null);
    } catch (e) {
      console.warn("fetchPhotos failed; keeping local photos");
      // keep current photos; don’t show blocking error
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // Call this only when you actually have the API ready
  // useEffect(() => { fetchPhotos(); }, []);

  const uploadPhotos = async (formData) => {
    try {
      const res = await axios.post("/api/photos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchPhotos();
      return res.data;
    } catch (e) {
      throw new Error(e.response?.data?.error || "Failed to upload photos");
    }
  };

  const filteredPhotos = Array.isArray(photos)
    ? photos.filter((p) => {
        if (filter === "all") return true;
        if (filter === "recent") {
          const photoDate = new Date(p.uploadedAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return photoDate > weekAgo;
        }
        return true;
      })
    : [];

  return (
    <PhotoContext.Provider
      value={{
        photos: filteredPhotos,
        allPhotos: photos,
        loading,
        error,
        filter,
        setFilter,
        fetchPhotos,
        uploadPhotos,
      }}
    >
      {children}
    </PhotoContext.Provider>
  );
};
