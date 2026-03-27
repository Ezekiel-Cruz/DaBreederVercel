import { useEffect } from "react";
import DogForm from "./DogForm";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import "./AddDogForm.css";

function AddDogSkeleton() {
  return (
    <div className="find-match-container" aria-label="Loading add dog form" aria-busy="true">
      <div className="header-section">
        <div className="add-dog-skeleton-title add-dog-skeleton-shimmer" />
        <div className="add-dog-skeleton-subtitle add-dog-skeleton-shimmer" />
      </div>
      <div className="content-section add-dog-skeleton-shell">
        <div className="add-dog-skeleton-progress add-dog-skeleton-shimmer" />
        <div className="add-dog-skeleton-block add-dog-skeleton-shimmer" />
        <div className="add-dog-skeleton-block add-dog-skeleton-shimmer" />
        <div className="add-dog-skeleton-actions">
          <div className="add-dog-skeleton-btn add-dog-skeleton-shimmer" />
          <div className="add-dog-skeleton-btn add-dog-skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

export default function AddDogPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Add New Dog 🐾 | DaBreeder";
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/", { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return <AddDogSkeleton />;
  }

  if (!user) {
    return null;
  }

  const handleSubmitted = () => {
    console.log("🐕 Dog submitted, going to my dogs...");
    navigate("/my-dog");
  };

  return (
    <div className="find-match-container">
      {/* Header Section */}
      <div className="header-section">
        <h1 className="page-title">Add New Dog</h1>
        <p className="page-description">
          Register your dog's profile to connect with other breeders
        </p>
      </div>

      {/* Main Content */}
      <div className="content-section">
        <DogForm onSubmitted={handleSubmitted} />
      </div>
    </div>
  );
}
