import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BankAdminDashboard() {
  const navigate = useNavigate();

  // Theme persistence
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  const theme = dark ? darkTheme : lightTheme;

  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    fetchPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPending() {
    try {
      setError("");
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch("/api/bank-admin/pending-evaluators/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to fetch pending evaluators.");

      setPending(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function approve(profileId) {
    try {
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch(`/api/bank-admin/approve-evaluator/${profileId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Approval failed.");

      // Refresh pending list after approve
      fetchPending();
    } catch (err) {
      setError(err.message || "Approval error.");
    }
  }

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>
      <div style={styles.header}>
        <h2>Bank Admin Dashboard</h2>
        <div>
          <button
            onClick={() => setDark(!dark)}
            style={{ ...styles.smallBtn, marginRight: 10 }}
          >
            {dark ? "Light Mode" : "Dark Mode"}
          </button>

          <button onClick={logout} style={styles.smallBtn}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ marginTop: 30 }}>
        <h3>Pending Evaluator Accounts</h3>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && pending.length === 0 && (
          <p style={{ opacity: 0.7 }}>No pending approvals.</p>
        )}

        <div style={styles.cardGrid}>
          {pending.map((p) => (
            <div
              key={p.profile_id}
              style={{
                ...styles.card,
                background: theme.card,
                border: `1px solid ${theme.border}`,
              }}
            >
              <h4 style={{ margin: 0 }}>{p.username}</h4>
              

              <button
                onClick={() => approve(p.profile_id)}
                style={styles.approveBtn}
              >
                Approve
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const lightTheme = {
  bg: "#f4f9ff",
  text: "#0b1220",
  card: "#ffffff",
  border: "rgba(11,18,32,0.12)",
};

const darkTheme = {
  bg: "#071423",
  text: "#ffffff",
  card: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.15)",
};

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px 6%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  smallBtn: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 20,
    marginTop: 20,
  },
  card: {
    padding: 20,
    borderRadius: 14,
  },
  approveBtn: {
    marginTop: 10,
    padding: "8px 14px",
    borderRadius: 8,
    border: "none",
    background: "#22c55e",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
};