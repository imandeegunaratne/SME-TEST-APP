// src/pages/EvaluatorProfile.jsx
import { useNavigate } from "react-router-dom";

export default function EvaluatorProfile() {
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "Evaluator";
  const role = localStorage.getItem("role") || "EVALUATOR";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F6F8FB",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <button
        onClick={() => navigate("/evaluator-home")}
        style={{
          marginBottom: 20,
          border: "none",
          background: "#2F96B4",
          color: "#fff",
          padding: "10px 16px",
          borderRadius: 10,
          cursor: "pointer",
        }}
      >
        Back
      </button>

      <div
        style={{
          maxWidth: 700,
          margin: "0 auto",
          background: "#fff",
          padding: 30,
          borderRadius: 20,
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        }}
      >
        <h2>Evaluator Profile</h2>
        <p><b>Username:</b> {username}</p>
        <p><b>Role:</b> {role}</p>
      </div>
    </div>
  );
}