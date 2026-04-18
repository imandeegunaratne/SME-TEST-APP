import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { appNavbarStyles, appShellStyles, createAppTheme } from "../styles/appTheme";

export default function EvaluatorProfile() {
  const navigate = useNavigate();

  const [dark] = useState(() => localStorage.getItem("theme") === "dark");
  const theme = createAppTheme(dark, dark ? darkTheme : lightTheme);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const token = localStorage.getItem("token") || "";
  const username = localStorage.getItem("username") || "Evaluator";
  const bankName = localStorage.getItem("bank_name") || "—";
  const role = localStorage.getItem("role") || "EVALUATOR";

  useEffect(() => {
    if (!token) { navigate("/login", { replace: true }); return; }

    // Fetch summary to show live stats alongside static profile data
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/evaluator/summary/", {
          headers: { Authorization: `Token ${token}` },
        });
        if (res.status === 401) {
          localStorage.clear();
          navigate("/login", { replace: true });
          return;
        }
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.detail || "Failed to load profile.");
        setProfile(data);
      } catch (e) {
        setErr(e.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, navigate]);

  function onPasswordInput(e) {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordMsg("");

    if (!passwordForm.old_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      setPasswordMsg("Please fill all fields.");
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordMsg("New passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch("/api/change-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          old_password: passwordForm.old_password,
          new_password: passwordForm.new_password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Failed to change password.");

      setPasswordMsg("Password changed. You will be logged out in 2 seconds.");
      setTimeout(() => {
        localStorage.clear();
        navigate("/login");
      }, 2000);
    } catch (e) {
      setPasswordMsg(e.message || "Failed to change password.");
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>
      <header
        style={{
          ...styles.navbar,
          background: theme.navBg,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <button
          onClick={() => navigate("/evaluator-home")}
          style={{ ...styles.backBtn, background: "#2F96B4", color: "#fff" }}
        >
          ← Back
        </button>
        <span style={{ fontWeight: 800, fontSize: 18 }}>My Profile</span>
        <div />
      </header>

      <main style={styles.main}>
        {err && <div style={{ ...styles.alert, background: theme.errorBg, color: theme.errorText }}>{err}</div>}

        {/* Profile card */}
        <div style={{ ...styles.card, background: theme.card, border: `1px solid ${theme.border}` }}>
          <h2 style={{ margin: "0 0 18px", fontSize: 22, fontWeight: 800 }}>Account Information</h2>

          <div style={styles.infoGrid}>
            {[
              ["Username", username],
              ["Role", role],
              ["Bank", bankName],
            ].map(([label, value]) => (
              <div key={label} style={{ ...styles.infoRow, borderBottom: `1px solid ${theme.border}` }}>
                <div style={{ ...styles.infoLabel, color: theme.muted }}>{label}</div>
                <div style={styles.infoValue}>{value}</div>
              </div>
            ))}

            {!loading && profile && (
              <>
                {[
                  ["Total SMEs", profile.total_smes ?? "—"],
                  ["Scored SMEs", profile.scored_smes ?? "—"],
                  ["Pending SMEs", profile.pending_smes ?? "—"],
                  ["Average Score", profile.avg_score ?? "—"],
                ].map(([label, value]) => (
                  <div key={label} style={{ ...styles.infoRow, borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ ...styles.infoLabel, color: theme.muted }}>{label}</div>
                    <div style={styles.infoValue}>{value}</div>
                  </div>
                ))}
              </>
            )}

            {loading && (
              <div style={{ padding: "12px 0", color: theme.muted, fontSize: 14 }}>
                Loading activity data...
              </div>
            )}
          </div>
        </div>

        {/* Change password card */}
        <div style={{ ...styles.card, background: theme.card, border: `1px solid ${theme.border}`, marginTop: 20 }}>
          <h2 style={{ margin: "0 0 18px", fontSize: 22, fontWeight: 800 }}>Change Password</h2>

          <form onSubmit={handleChangePassword} style={styles.form}>
            {[
              { name: "old_password", label: "Current Password" },
              { name: "new_password", label: "New Password" },
              { name: "confirm_password", label: "Confirm New Password" },
            ].map(({ name, label }) => (
              <div key={name}>
                <label style={{ ...styles.label, color: theme.muted }}>{label}</label>
                <input
                  type="password"
                  name={name}
                  value={passwordForm[name]}
                  onChange={onPasswordInput}
                  autoComplete={name === "old_password" ? "current-password" : "new-password"}
                  style={{
                    ...styles.input,
                    background: theme.inputBg,
                    color: theme.text,
                    border: `1px solid ${theme.border}`,
                  }}
                />
              </div>
            ))}

            {passwordMsg && (
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: passwordMsg.includes("changed") ? "#16a34a" : "#dc2626",
                }}
              >
                {passwordMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={passwordSaving}
              style={{ ...styles.btn, background: "#2F96B4", color: "#fff" }}
            >
              {passwordSaving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

const lightTheme = {
  bg: "#F4F8FB", navBg: "rgba(255,255,255,0.95)", card: "#FFFFFF",
  text: "#0F172A", muted: "#64748B", border: "#E2E8F0", inputBg: "#FFFFFF",
  errorBg: "#FEF2F2", errorText: "#B91C1C",
};
const darkTheme = {
  bg: "#0B1220", navBg: "rgba(16,24,38,0.95)", card: "#172033",
  text: "#FFFFFF", muted: "rgba(255,255,255,0.65)", border: "rgba(255,255,255,0.10)",
  inputBg: "#0f172a", errorBg: "rgba(220,38,38,0.10)", errorText: "#fecaca",
};

const styles = {
  page: appShellStyles.page,
  navbar: {
    ...appNavbarStyles.shell,
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    alignItems: "center",
    gap: 16,
  },
  backBtn: appNavbarStyles.backBtn,
  main: { width: "min(680px, 92%)", margin: "32px auto", paddingBottom: 40 },
  alert: { padding: "14px 16px", borderRadius: 12, marginBottom: 16, fontWeight: 600 },
  card: { borderRadius: 20, padding: 24, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" },
  infoGrid: { display: "flex", flexDirection: "column" },
  infoRow: { display: "grid", gridTemplateColumns: "200px 1fr", padding: "14px 0" },
  infoLabel: { fontSize: 14, fontWeight: 600 },
  infoValue: { fontSize: 15, fontWeight: 500 },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  label: { display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600 },
  input: { width: "100%", padding: 12, borderRadius: 10, outline: "none", fontSize: 14, boxSizing: "border-box" },
  btn: { padding: 12, borderRadius: 10, border: "none", fontWeight: 700, cursor: "pointer", fontSize: 14, marginTop: 4 },
};
