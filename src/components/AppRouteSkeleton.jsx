import React from "react";

export default function AppRouteSkeleton() {
  const shimmer = {
    background: "linear-gradient(90deg, #f3e5d4 0%, #f9efe3 45%, #f3e5d4 100%)",
    backgroundSize: "220% 100%",
    animation: "routeSkeletonWave 1.2s ease-in-out infinite",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "1rem",
        background: "linear-gradient(to bottom, #fff7ed 0%, #ffedd7 100%)",
      }}
    >
      <style>{`@keyframes routeSkeletonWave { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }`}</style>
      <div
        style={{
          width: "min(720px, 100%)",
          border: "2px solid #f3dfc4",
          borderRadius: "22px",
          background: "linear-gradient(145deg, #ffffff, #fff4e8)",
          padding: "1rem",
          boxShadow: "0 12px 28px rgba(181, 94, 46, 0.12)",
        }}
      >
        <div style={{ ...shimmer, borderRadius: "999px", height: "16px", width: "35%" }} />
        <div style={{ marginTop: "0.9rem", display: "grid", gap: "0.55rem" }}>
          <div style={{ ...shimmer, borderRadius: "10px", height: "12px", width: "96%" }} />
          <div style={{ ...shimmer, borderRadius: "10px", height: "12px", width: "84%" }} />
        </div>
        <div
          style={{
            marginTop: "1rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "0.75rem",
          }}
        >
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                border: "1px solid rgba(194, 138, 111, 0.2)",
                borderRadius: "14px",
                background: "#fff8ef",
                padding: "0.65rem",
              }}
            >
              <div style={{ ...shimmer, borderRadius: "8px", height: "10px", width: "70%" }} />
              <div
                style={{
                  ...shimmer,
                  borderRadius: "8px",
                  height: "10px",
                  width: "92%",
                  marginTop: "0.5rem",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
