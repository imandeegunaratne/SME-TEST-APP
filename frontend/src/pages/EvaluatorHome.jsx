import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function EvaluatorHome() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [themeMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light" ? "light" : "dark";
  });

  const theme = useMemo(
    () => (themeMode === "dark" ? darkTheme : lightTheme),
    [themeMode]
  );

  const [summary, setSummary] = useState({
    total_smes: 0,
    scored_smes: 0,
    pending_smes: 0,
  });

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [brSearch, setBrSearch] = useState("");
  const [found, setFound] = useState(null);
  const [searchMsg, setSearchMsg] = useState("");

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const menuRef = useRef(null);

  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");

  function authHeaders(extra = {}) {
    const tokenNow = localStorage.getItem("token");
    return {
      Authorization: `Token ${tokenNow}`,
      ...extra,
    };
  }

  async function loadData() {
    setLoading(true);
    setErr("");

    const tokenNow = localStorage.getItem("token");

    if (!tokenNow) {
      setErr("You are not logged in.");
      setLoading(false);
      navigate("/login");
      return;
    }

    if (role === "BANK_ADMIN") {
      navigate("/bank-admin-dashboard");
      return;
    }

    try {
      const s1 = await fetch("/api/evaluator/summary/", {
        headers: authHeaders(),
      });

      const sum = await s1.json().catch(() => ({}));

      if (!s1.ok) throw new Error(sum.detail || "Failed to load summary.");

      setSummary({
        total_smes: sum.total_smes || 0,
        scored_smes: sum.scored_smes || 0,
        pending_smes: sum.pending_smes || 0,
      });
    } catch (e) {
      setErr(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function searchByBR() {
    setSearchMsg("");
    setFound(null);

    const tokenNow = localStorage.getItem("token");
    if (!tokenNow) {
      setSearchMsg("You are not logged in.");
      navigate("/login");
      return;
    }

    if (!brSearch.trim()) {
      setSearchMsg("Please enter a BR number.");
      return;
    }

    try {
      const res = await fetch(
        `/api/smes/by-br/?br=${encodeURIComponent(brSearch)}`,
        { headers: authHeaders() }
      );

      if (res.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "SME not found.");

      setFound(data);
    } catch (e) {
      setSearchMsg(e.message || "Search failed.");
    }
  }

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  function openPasswordModal() {
    setShowProfileMenu(false);
    setShowPasswordModal(true);
    setPasswordMsg("");
    setPasswordForm({
      old_password: "",
      new_password: "",
      confirm_password: "",
    });
  }

  function handlePasswordInput(e) {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordMsg("");

    if (
      !passwordForm.old_password ||
      !passwordForm.new_password ||
      !passwordForm.confirm_password
    ) {
      setPasswordMsg("Please fill all password fields.");
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordMsg("New password and confirm password do not match.");
      return;
    }

    setPasswordSaving(true);

    try {
      const res = await fetch("/api/evaluator/change-password/", {
        method: "POST",
        headers: authHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          old_password: passwordForm.old_password,
          new_password: passwordForm.new_password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.detail || "Failed to change password.");
      }

      setPasswordMsg("Password changed successfully.");

      setTimeout(() => {
        setShowPasswordModal(false);
        localStorage.clear();
        navigate("/login");
      }, 1200);
    } catch (e) {
      setPasswordMsg(e.message || "Failed to change password.");
    } finally {
      setPasswordSaving(false);
    }
  }

  const username = localStorage.getItem("username") || "E";

  return (
    <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>
      <header
        style={{
          ...styles.navbar,
          background: theme.navBg,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div style={styles.brand} onClick={() => navigate("/evaluator-home")}>
          <img src={logo} alt="SME logo" style={styles.logoImg} />
          <div style={styles.brandTextWrap}>
            <div style={{ ...styles.brandTitle, color: theme.text }}>
              SME Scoring
            </div>
            <div style={{ ...styles.brandSub, color: theme.subText }}>
              Decision Support Platform
            </div>
          </div>
        </div>

        <div style={styles.headerCenterText}>Evaluator Workspace</div>

        <div style={styles.rightWrap}>
          <div style={{ position: "relative" }} ref={menuRef}>
            <button
              style={{
                ...styles.profileBtn,
                background: theme.profileBg,
                color: theme.text,
                border: `1px solid ${theme.border}`,
              }}
              onClick={() => setShowProfileMenu((prev) => !prev)}
              title="Profile"
            >
              {username.charAt(0).toUpperCase()}
            </button>

            {showProfileMenu && (
              <div
                style={{
                  ...styles.dropdown,
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <button style={styles.dropdownItem} onClick={openPasswordModal}>
                  Change Password
                </button>
                <button style={styles.dropdownItem} onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {err && (
          <div
            style={{
              ...styles.alert,
              background: theme.errorBg,
              color: theme.errorText,
              border: `1px solid ${theme.errorBorder}`,
            }}
          >
            {err}
          </div>
        )}

        <section
          style={{
            ...styles.heroCard,
            background: theme.heroBg,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div style={styles.heroContent}>
            <div
              style={{
                ...styles.heroBadge,
                background: theme.badgeBg,
                color: theme.button,
              }}
            >
              Evaluator Panel
            </div>

            <h1 style={{ ...styles.heroTitle, color: theme.text }}>
              Manage SME scoring from one place
            </h1>

            <p style={{ ...styles.heroText, color: theme.subText }}>
              Register new SMEs, search by BR number, continue scoring, and
              track progress through a simple and professional workspace.
            </p>

            <div style={styles.heroButtonRow}>
              <button
                style={{ ...styles.primaryBtn, background: theme.button }}
                onClick={() => navigate("/sme-register")}
              >
                + Register New SME
              </button>
            </div>
          </div>
        </section>

        <section style={styles.sectionBlock}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Overview</h2>
            <p style={{ ...styles.sectionSub, color: theme.subText }}>
              Quick insight into SME activity
            </p>
          </div>

          {loading ? (
            <div style={{ color: theme.subText }}>Loading summary...</div>
          ) : (
            <div style={styles.statsGrid}>
              <div
                style={{
                  ...styles.statCard,
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <div
                  style={{
                    ...styles.statIconWrap,
                    background: theme.iconBg1,
                  }}
                >
                  📁
                </div>
                <div style={styles.statLabel}>Total SMEs</div>
                <div style={styles.statValue}>{summary.total_smes}</div>
              </div>

              <div
                style={{
                  ...styles.statCard,
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <div
                  style={{
                    ...styles.statIconWrap,
                    background: theme.iconBg2,
                  }}
                >
                  ✅
                </div>
                <div style={styles.statLabel}>Scored SMEs</div>
                <div style={styles.statValue}>{summary.scored_smes}</div>
              </div>

              <div
                style={{
                  ...styles.statCard,
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <div
                  style={{
                    ...styles.statIconWrap,
                    background: theme.iconBg3,
                  }}
                >
                  ⏳
                </div>
                <div style={styles.statLabel}>Pending SMEs</div>
                <div style={styles.statValue}>{summary.pending_smes}</div>
              </div>
            </div>
          )}
        </section>

        <section
          style={{
            ...styles.searchCard,
            background: theme.card,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Search & Score SME</h2>
            <p style={{ ...styles.sectionSub, color: theme.subText }}>
              Search an SME using the BR number
            </p>
          </div>

          <div style={styles.searchRow}>
            <input
              value={brSearch}
              onChange={(e) => setBrSearch(e.target.value)}
              placeholder="Enter BR number"
              style={{
                ...styles.search,
                background: theme.inputBg,
                color: theme.text,
                border: `1px solid ${theme.border}`,
              }}
            />

            <button
              style={{
                ...styles.searchBtn,
                background: theme.button,
              }}
              onClick={searchByBR}
            >
              Search
            </button>
          </div>

          {searchMsg && (
            <div
              style={{
                ...styles.inlineMessage,
                color: theme.subText,
              }}
            >
              {searchMsg}
            </div>
          )}

          {found && (
            <div
              style={{
                ...styles.resultCard,
                background: theme.resultBg,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div style={styles.resultLeft}>
                <div style={styles.resultTitle}>{found.name}</div>
                <div style={{ ...styles.resultSub, color: theme.subText }}>
                  BR Number: {found.br_number}
                </div>
              </div>

              <div style={styles.actionWrap}>
                {!found.is_scored && (
                  <button
                    style={{
                      ...styles.smallPrimaryBtn,
                      background: theme.button,
                    }}
                    onClick={() => navigate(`/smes/${found.id}/score`)}
                  >
                    Start Scoring
                  </button>
                )}

                {found.is_scored && (
                  <button
                    style={{
                      ...styles.smallOutlineBtn,
                      color: theme.text,
                      border: `1px solid ${theme.border}`,
                      background: "transparent",
                    }}
                    onClick={() => navigate(`/smes/${found.id}/report`)}
                  >
                    View Report
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {showPasswordModal && (
        <div style={styles.modalOverlay}>
          <div
            style={{
              ...styles.modalCard,
              background: theme.card,
              color: theme.text,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div style={styles.modalTop}>
              <h3 style={{ margin: 0, fontSize: 22 }}>Change Password</h3>
              <button
                style={{ ...styles.closeBtn, color: theme.text }}
                onClick={() => setShowPasswordModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleChangePassword}>
              <label style={styles.label}>Old Password</label>
              <input
                type="password"
                name="old_password"
                value={passwordForm.old_password}
                onChange={handlePasswordInput}
                style={{
                  ...styles.input,
                  background: theme.inputBg,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                }}
              />

              <label style={styles.label}>New Password</label>
              <input
                type="password"
                name="new_password"
                value={passwordForm.new_password}
                onChange={handlePasswordInput}
                style={{
                  ...styles.input,
                  background: theme.inputBg,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                }}
              />

              <label style={styles.label}>Confirm New Password</label>
              <input
                type="password"
                name="confirm_password"
                value={passwordForm.confirm_password}
                onChange={handlePasswordInput}
                style={{
                  ...styles.input,
                  background: theme.inputBg,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                }}
              />

              {passwordMsg && (
                <div
                  style={{
                    ...styles.passwordMsg,
                    color:
                      passwordMsg === "Password changed successfully."
                        ? "#16a34a"
                        : "#dc2626",
                  }}
                >
                  {passwordMsg}
                </div>
              )}

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={{
                    ...styles.cancelBtn,
                    background: theme.inputBg,
                    color: theme.text,
                    border: `1px solid ${theme.border}`,
                  }}
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ ...styles.primaryBtn, background: theme.button }}
                  disabled={passwordSaving}
                >
                  {passwordSaving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const BRAND = "#2F96B4";

const darkTheme = {
  bg: "#0B1220",
  navBg: "rgba(16,24,38,0.92)",
  card: "#172033",
  resultBg: "#111827",
  inputBg: "#0f172a",
  heroBg: "linear-gradient(135deg, #172033 0%, #101826 55%, #0f172a 100%)",
  text: "#ffffff",
  subText: "rgba(255,255,255,0.72)",
  button: BRAND,
  border: "rgba(255,255,255,0.10)",
  profileBg: "#172033",
  badgeBg: "rgba(47,150,180,0.16)",
  iconBg1: "rgba(59,130,246,0.16)",
  iconBg2: "rgba(16,185,129,0.16)",
  iconBg3: "rgba(245,158,11,0.16)",
  errorBg: "rgba(220,38,38,0.10)",
  errorText: "#fecaca",
  errorBorder: "rgba(220,38,38,0.30)",
};

const lightTheme = {
  bg: "#F4F7FB",
  navBg: "rgba(255,255,255,0.92)",
  card: "#ffffff",
  resultBg: "#F8FAFC",
  inputBg: "#ffffff",
  heroBg: "linear-gradient(135deg, #ffffff 0%, #eef7fb 60%, #f8fbff 100%)",
  text: "#0F172A",
  subText: "#475569",
  button: BRAND,
  border: "rgba(15,23,42,0.10)",
  profileBg: "#F1F5F9",
  badgeBg: "rgba(47,150,180,0.12)",
  iconBg1: "rgba(59,130,246,0.12)",
  iconBg2: "rgba(16,185,129,0.12)",
  iconBg3: "rgba(245,158,11,0.14)",
  errorBg: "#FEF2F2",
  errorText: "#B91C1C",
  errorBorder: "#FECACA",
};

const styles = {
  page: {
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  },

  navbar: {
    height: 96,
    padding: "0 28px",
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 50,
    backdropFilter: "blur(10px)",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    cursor: "pointer",
    minWidth: 260,
  },

  brandTextWrap: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    lineHeight: 1.1,
  },

  brandTitle: {
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: "-0.3px",
    marginBottom: 3,
  },

  brandSub: {
    fontSize: 13,
    fontWeight: 500,
  },

  logoImg: {
    width: 108,
    height: 58,
    objectFit: "contain",
    display: "block",
  },

  headerCenterText: {
    fontSize: 15,
    fontWeight: 700,
    opacity: 0.9,
  },

  rightWrap: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  profileBtn: {
    width: 46,
    height: 46,
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },

  dropdown: {
    position: "absolute",
    top: 56,
    right: 0,
    minWidth: 190,
    borderRadius: 16,
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    overflow: "hidden",
    zIndex: 100,
  },

  dropdownItem: {
    width: "100%",
    padding: "13px 15px",
    border: "none",
    background: "transparent",
    textAlign: "left",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },

  main: {
    width: "min(1180px, 92%)",
    margin: "32px auto",
    paddingBottom: 40,
  },

  alert: {
    padding: "14px 16px",
    borderRadius: 14,
    marginBottom: 20,
    fontWeight: 600,
  },

  heroCard: {
    borderRadius: 28,
    padding: "34px 32px",
    boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
  },

  heroContent: {
    maxWidth: 760,
  },

  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 14px",
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 13,
    marginBottom: 18,
  },

  heroTitle: {
    margin: "0 0 14px 0",
    fontSize: 38,
    lineHeight: 1.15,
    fontWeight: 800,
    letterSpacing: "-0.6px",
  },

  heroText: {
    margin: 0,
    fontSize: 16,
    lineHeight: 1.7,
    maxWidth: 700,
  },

  heroButtonRow: {
    display: "flex",
    gap: 12,
    marginTop: 24,
    flexWrap: "wrap",
  },

  sectionBlock: {
    marginTop: 30,
  },

  sectionHeader: {
    marginBottom: 16,
  },

  sectionTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
  },

  sectionSub: {
    marginTop: 6,
    fontSize: 14,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 18,
  },

  statCard: {
    borderRadius: 22,
    padding: 22,
    boxShadow: "0 12px 28px rgba(15,23,42,0.05)",
  },

  statIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    marginBottom: 18,
  },

  statLabel: {
    fontSize: 14,
    opacity: 0.78,
    marginBottom: 8,
    fontWeight: 600,
  },

  statValue: {
    fontSize: 34,
    fontWeight: 800,
    lineHeight: 1,
  },

  searchCard: {
    marginTop: 30,
    borderRadius: 26,
    padding: 26,
    boxShadow: "0 14px 34px rgba(15,23,42,0.05)",
  },

  searchRow: {
    display: "grid",
    gridTemplateColumns: "1fr 150px",
    gap: 12,
    alignItems: "center",
  },

  search: {
    width: "100%",
    padding: "15px 16px",
    borderRadius: 16,
    outline: "none",
    fontSize: 15,
    boxSizing: "border-box",
  },

  searchBtn: {
    border: "none",
    color: "#fff",
    padding: "15px 18px",
    borderRadius: 16,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 15,
    boxShadow: "0 10px 22px rgba(47,150,180,0.25)",
  },

  inlineMessage: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: 500,
  },

  resultCard: {
    marginTop: 18,
    padding: 18,
    borderRadius: 18,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },

  resultLeft: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },

  resultTitle: {
    fontSize: 18,
    fontWeight: 800,
  },

  resultSub: {
    fontSize: 14,
  },

  actionWrap: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },

  primaryBtn: {
    border: "none",
    color: "#fff",
    padding: "13px 18px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 15,
    boxShadow: "0 10px 22px rgba(47,150,180,0.25)",
  },

  smallPrimaryBtn: {
    border: "none",
    color: "#fff",
    padding: "11px 15px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
  },

  smallOutlineBtn: {
    padding: "11px 15px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
  },

  modalCard: {
    width: "100%",
    maxWidth: 470,
    borderRadius: 24,
    padding: 24,
    boxShadow: "0 24px 50px rgba(0,0,0,0.22)",
  },

  modalTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  closeBtn: {
    border: "none",
    background: "transparent",
    fontSize: 30,
    cursor: "pointer",
    lineHeight: 1,
  },

  label: {
    display: "block",
    marginBottom: 8,
    marginTop: 14,
    fontWeight: 700,
    fontSize: 14,
  },

  input: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: 14,
    outline: "none",
    fontSize: 15,
    boxSizing: "border-box",
  },

  passwordMsg: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: 600,
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 22,
  },

  cancelBtn: {
    padding: "12px 18px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
  },
};