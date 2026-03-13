import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import MyMatches from "../components/MyMatches";
import LoadingState from "../components/LoadingState";

export default function MyMatchesPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "My Matches 🐾 | DaBreeder";
  }, []);

  if (loading) {
    return <LoadingState message="Loading your matches..." minHeight={240} />;
  }
  if (!user) return <Navigate to="/" replace />;
  if (user.role === "admin") {
    navigate("/admin/dashboard", { replace: true });
    return null;
  }

  return (
    <div className="flex-1">
      <MyMatches userId={user.id} />
    </div>
  );
}
