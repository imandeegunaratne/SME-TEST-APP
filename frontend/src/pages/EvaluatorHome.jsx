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

  const [active, setActive] = useState("scoring");

  const [summary, setSummary] = useState({
    total_smes: 0,
    scored_smes: 0,
    pending_smes: 0,
    avg_score: 0,
  });

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [brSearch, setBrSearch] = useState("");
  const [found, setFound] = useState(null);
  const [searchMsg, setSearchMsg] = useState("");

  // profile dropdown
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

      setSummary(sum);
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

    if (!passwordForm.old_password || !passwordForm.new_password || !passwordForm.confirm_password) {
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
        
       <div
  style={styles.brand}
  onClick={() => navigate("/evaluator-home")}
>
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
       

        <div style={styles.centerTabs}>
          <button
            style={{
              ...styles.navBtn,
              color: theme.text,
              borderBottom:
                active === "scoring"
                  ? `3px solid ${theme.button}`
                  : "3px solid transparent",
            }}
            onClick={() => setActive("scoring")}
          >
            SME Scoring
          </button>

          <button
            style={{
              ...styles.navBtn,
              color: theme.text,
              borderBottom:
                active === "dashboard"
                  ? `3px solid ${theme.button}`
                  : "3px solid transparent",
            }}
            onClick={() => setActive("dashboard")}
          >
            Dashboard
          </button>
        </div>

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
        {err && <div style={styles.errorText}>{err}</div>}

        {active === "scoring" && (
          <>
            <section
              style={{
                ...styles.card,
                background: theme.card,
                border: `1px solid ${theme.border}`,
              }}
            >
              <h3 style={styles.cardTitle}>Register SME</h3>
              <button
                style={{ ...styles.primaryBtn, background: theme.button }}
                onClick={() => navigate("/sme-register")}
              >
                + Register New SME
              </button>
            </section>

            <section
              style={{
                ...styles.card,
                background: theme.card,
                border: `1px solid ${theme.border}`,
                marginTop: 20,
              }}
            >
              <h3 style={styles.cardTitle}>Search & Score SME</h3>

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

              {searchMsg && <div style={styles.msgText}>{searchMsg}</div>}

              {found && (
                <div
                  style={{
                    ...styles.resultRow,
                    border: `1px solid ${theme.border}`,
                    background: theme.resultBg,
                  }}
                >
                  <div>
                    <div style={styles.smeName}>{found.name}</div>
                    <div style={styles.smeSub}>BR: {found.br_number}</div>
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
          </>
        )}

        {active === "dashboard" && (
          <section
            style={{
              ...styles.card,
              background: theme.card,
              border: `1px solid ${theme.border}`,
            }}
          >
            <h3 style={styles.cardTitle}>Dashboard</h3>

            {loading ? (
              <div>Loading...</div>
            ) : (
              <div style={styles.statsGrid}>
                <div style={{ ...styles.statCard, background: theme.statCard }}>
                  <div style={styles.statLabel}>Total SMEs</div>
                  <div style={styles.statValue}>{summary.total_smes}</div>
                </div>

                <div style={{ ...styles.statCard, background: theme.statCard }}>
                  <div style={styles.statLabel}>Scored SMEs</div>
                  <div style={styles.statValue}>{summary.scored_smes}</div>
                </div>

                <div style={{ ...styles.statCard, background: theme.statCard }}>
                  <div style={styles.statLabel}>Pending SMEs</div>
                  <div style={styles.statValue}>{summary.pending_smes}</div>
                </div>

                <div style={{ ...styles.statCard, background: theme.statCard }}>
                  <div style={styles.statLabel}>Average Score</div>
                  <div style={styles.statValue}>{summary.avg_score}</div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {showPasswordModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, background: theme.card, color: theme.text }}>
            <div style={styles.modalTop}>
              <h3 style={{ margin: 0 }}>Change Password</h3>
              <button
                style={styles.closeBtn}
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

              {passwordMsg && <div style={styles.passwordMsg}>{passwordMsg}</div>}

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelBtn}
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
  navBg: "#101826",
  card: "#172033",
  statCard: "#0f172a",
  resultBg: "#111827",
  inputBg: "#0f172a",
  text: "#ffffff",
  button: BRAND,
  border: "rgba(255,255,255,0.10)",
  profileBg: "#172033",
};

const lightTheme = {
  bg: "#F6F8FB",
  navBg: "#ffffff",
  card: "#ffffff",
  statCard: "#F8FAFC",
  resultBg: "#F8FAFC",
  inputBg: "#ffffff",
  text: "#0F172A",
  button: BRAND,
  border: "rgba(15,23,42,0.10)",
  profileBg: "#F1F5F9",
};

const styles = {
  page: {
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  navbar: {
    height: 92,
    padding: "0 40px",
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  leftWrap: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  centerTabs: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 34,
  },
  rightWrap: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  logoButton: {
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  logoImg: {
    width: 88,
    height: 70,
    objectFit: "contain",
  },
  navBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 700,
    padding: "10px 2px",
  },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dropdown: {
    position: "absolute",
    top: 58,
    right: 0,
    minWidth: 180,
    borderRadius: 14,
    boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
    overflow: "hidden",
  },
  dropdownItem: {
    width: "100%",
    padding: "12px 14px",
    border: "none",
    background: "transparent",
    textAlign: "left",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  main: {
    width: "min(1100px, 92%)",
    margin: "28px auto",
  },
  card: {
    padding: 24,
    borderRadius: 20,
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: 18,
    fontSize: 22,
  },
  searchRow: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  search: {
    flex: 1,
    padding: "14px 16px",
    borderRadius: 14,
    outline: "none",
    fontSize: 15,
  },
  searchBtn: {
    border: "none",
    color: "#fff",
    padding: "14px 18px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 700,
  },
  resultRow: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  smeName: {
    fontSize: 18,
    fontWeight: 700,
  },
  smeSub: {
    fontSize: 13,
    marginTop: 4,
    opacity: 0.8,
  },
  actionWrap: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  primaryBtn: {
    border: "none",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 15,
  },
  smallPrimaryBtn: {
    border: "none",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
  },
  smallOutlineBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 18,
    marginTop: 18,
  },
  statCard: {
    padding: 20,
    borderRadius: 18,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 800,
  },
  msgText: {
    marginTop: 12,
  },
  errorText: {
    color: "red",
    marginBottom: 16,
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
    maxWidth: 460,
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 16px 40px rgba(0,0,0,0.2)",
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
    fontSize: 28,
    cursor: "pointer",
    lineHeight: 1,
  },
  label: {
    display: "block",
    marginBottom: 8,
    marginTop: 14,
    fontWeight: 600,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    outline: "none",
    fontSize: 15,
    boxSizing: "border-box",
  },
  passwordMsg: {
    marginTop: 14,
    fontSize: 14,
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
    border: "1px solid #cbd5e1",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 700,
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
  lineHeight: 1.05,
},

brandTitle: {
  fontSize: 24,
  fontWeight: 800,
  letterSpacing: "-0.4px",
  marginBottom: 4,
},

brandSub: {
  fontSize: 14,
  fontWeight: 500,
},

logoImg: {
  width: 120,
  height: 62,
  objectFit: "contain",
  display: "block",
},

navbar: {
  height: 100,
  padding: "0 22px",
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  alignItems: "center",
  position: "sticky",
  top: 0,
  zIndex: 10,
},
};