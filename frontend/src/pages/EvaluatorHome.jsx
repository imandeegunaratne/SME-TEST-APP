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

  const [activeTab, setActiveTab] = useState("home");

  const [summary, setSummary] = useState({
    total_smes: 0,
    scored_smes: 0,
    pending_smes: 0,
  });

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [homeSearch, setHomeSearch] = useState("");
  const [homeFound, setHomeFound] = useState(null);
  const [homeSearchMsg, setHomeSearchMsg] = useState("");

  const [scoreSearch, setScoreSearch] = useState("");
  const [scoreFound, setScoreFound] = useState(null);
  const [scoreSearchMsg, setScoreSearchMsg] = useState("");

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const profileRef = useRef(null);
  const notifyRef = useRef(null);

  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");

  const [allSMEs, setAllSMEs] = useState([]);
  const [comparisonList, setComparisonList] = useState([]);

  const notifications = [];

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

      const s2 = await fetch("/api/smes/", {
        headers: authHeaders(),
      });

      const smes = await s2.json().catch(() => []);
      if (s2.ok) setAllSMEs(Array.isArray(smes) ? smes : []);
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
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notifyRef.current && !notifyRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function searchHomeByBR() {
    setHomeSearchMsg("");
    setHomeFound(null);

    const tokenNow = localStorage.getItem("token");
    if (!tokenNow) {
      setHomeSearchMsg("You are not logged in.");
      navigate("/login");
      return;
    }

    if (!homeSearch.trim()) {
      setHomeSearchMsg("Please enter a BR number.");
      return;
    }

    try {
      const res = await fetch(
        `/api/smes/report-by-br/?br=${encodeURIComponent(homeSearch.trim())}`,
        { headers: authHeaders() }
      );

      if (res.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setHomeSearchMsg(
          data.detail ||
            "Scoring has not been done. Please go to the Scoring part and start scoring."
        );
        return;
      }

      setHomeFound(data);
      setHomeSearchMsg("Completed SME report found.");
    } catch (e) {
      setHomeSearchMsg(e.message || "Search failed.");
    }
  }

  async function searchScoreByBR() {
    setScoreSearchMsg("");
    setScoreFound(null);

    const tokenNow = localStorage.getItem("token");
    if (!tokenNow) {
      setScoreSearchMsg("You are not logged in.");
      navigate("/login");
      return;
    }

    if (!scoreSearch.trim()) {
      setScoreSearchMsg("Please enter a BR number.");
      return;
    }

    try {
      const res = await fetch(
        `/api/smes/scoring-by-br/?br=${encodeURIComponent(scoreSearch.trim())}`,
        { headers: authHeaders() }
      );

      if (res.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setScoreSearchMsg(data.detail || "Search failed.");
        return;
      }

      setScoreFound(data);
      setScoreSearchMsg("SME found. You can continue scoring.");
    } catch (e) {
      setScoreSearchMsg(e.message || "Search failed.");
    }
  }

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  function openPasswordModal() {
    setShowProfileMenu(false);
    setPasswordMsg("");
    setShowPasswordModal(true);
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

  function toggleCompare(sme) {
    const exists = comparisonList.find((x) => x.id === sme.id);
    if (exists) {
      setComparisonList((prev) => prev.filter((x) => x.id !== sme.id));
    } else {
      setComparisonList((prev) => [...prev, sme]);
    }
  }

  function openComparison() {
    if (comparisonList.length < 2) {
      setErr("Select at least 2 SMEs for comparison.");
      return;
    }

    const ids = comparisonList.map((x) => x.id).join(",");
    navigate(`/sme-comparison?ids=${ids}`);
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
              Evaluator Workspace
            </div>
          </div>
        </div>

        <div style={styles.tabWrap}>
          {["home", "scoring"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tabBtn,
                background: activeTab === tab ? theme.tabActiveBg : "transparent",
                color: activeTab === tab ? theme.button : theme.text,
                border:
                  activeTab === tab
                    ? `1px solid ${theme.tabActiveBorder}`
                    : `1px solid transparent`,
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div style={styles.rightWrap}>
          <div style={styles.popupWrap} ref={notifyRef}>
            <button
              onClick={() => setShowNotifications((v) => !v)}
              style={{
                ...styles.iconBtn,
                background: theme.card,
                border: `1px solid ${theme.border}`,
                color: theme.text,
              }}
            >
              N
            </button>

            {showNotifications && (
              <div
                style={{
                  ...styles.dropdown,
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <div style={styles.dropdownHead}>Notifications</div>
                {notifications.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.dropdownText,
                      borderBottom:
                        i !== notifications.length - 1
                          ? `1px solid ${theme.border}`
                          : "none",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.popupWrap} ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu((v) => !v)}
              style={{
                ...styles.profileBtn,
                background: theme.button,
                color: "#fff",
              }}
            >
              {username[0]?.toUpperCase() || "U"}
            </button>

            {showProfileMenu && (
              <div
                style={{
                  ...styles.dropdown,
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <button
                  style={{ ...styles.dropdownItem, color: theme.text }}
                  onClick={openPasswordModal}
                >
                  Change Password
                </button>
                <button
                  style={{ ...styles.dropdownItem, color: "#dc2626" }}
                  onClick={handleLogout}
                >
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

        {activeTab === "home" && (
          <>
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
    <img
      src={logo}
      alt="SME"
      style={{
        width: "24px",
        height: "24px",
        objectFit: "contain",
      }}
    />
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
                <h2 style={styles.sectionTitle}>Search SME Report</h2>
                <p style={{ ...styles.sectionSub, color: theme.subText }}>
                  Search an SME using the BR number and view the report only
                </p>
              </div>

              <div style={styles.searchRow}>
                <input
                  value={homeSearch}
                  onChange={(e) => setHomeSearch(e.target.value)}
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
                  onClick={searchHomeByBR}
                >
                  Search
                </button>
              </div>

              {homeSearchMsg && (
                <div style={{ ...styles.inlineMessage, color: theme.subText }}>
                  {homeSearchMsg}
                </div>
              )}

              {homeFound && (
                <div
                  style={{
                    ...styles.resultCard,
                    background: theme.resultBg,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <div style={styles.resultLeft}>
                    <div style={styles.resultTitle}>{homeFound.name}</div>
                    <div style={{ ...styles.resultSub, color: theme.subText }}>
                      BR Number: {homeFound.br_number}
                    </div>
                  </div>

                  <div style={styles.actionWrap}>
                    <button
                      style={{
                        ...styles.smallPrimaryBtn,
                        background: theme.button,
                      }}
                      onClick={() => navigate(`/smes/${homeFound.id}/report`)}
                    >
                      View Report
                    </button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === "scoring" && (
          <div style={styles.scoringGrid}>
            <section
              style={{
                ...styles.panelCard,
                background: theme.card,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Register SME</h2>
                <p style={{ ...styles.sectionSub, color: theme.subText }}>
                  Add a new SME before starting the scoring process
                </p>
              </div>

              <div style={styles.featureBox}>
                <div style={styles.featureIcon}></div>
                <div>
                  <div style={styles.featureTitle}>New SME Registration</div>
                  <div style={{ ...styles.featureText, color: theme.subText }}>
                    Create a new SME record and continue the evaluation workflow.
                  </div>
                </div>
              </div>

              <button
                style={{ ...styles.primaryBtn, background: theme.button }}
                onClick={() => navigate("/sme-register")}
              >
                + Register New SME
              </button>
            </section>

            <section
              style={{
                ...styles.panelCard,
                background: theme.card,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Search & Start Scoring</h2>
                <p style={{ ...styles.sectionSub, color: theme.subText }}>
                  Search an SME by BR number and start scoring
                </p>
              </div>

              <div style={styles.searchRow}>
                <input
                  value={scoreSearch}
                  onChange={(e) => setScoreSearch(e.target.value)}
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
                  onClick={searchScoreByBR}
                >
                  Search
                </button>
              </div>

              {scoreSearchMsg && (
                <div style={{ ...styles.inlineMessage, color: theme.subText }}>
                  {scoreSearchMsg}
                </div>
              )}

              {scoreFound && (
                <div
                  style={{
                    ...styles.resultCard,
                    background: theme.resultBg,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <div style={styles.resultLeft}>
                    <div style={styles.resultTitle}>{scoreFound.name}</div>
                    <div style={{ ...styles.resultSub, color: theme.subText }}>
                      BR Number: {scoreFound.br_number}
                    </div>
                  </div>

                  <div style={styles.actionWrap}>
                    <button
                      style={{
                        ...styles.smallPrimaryBtn,
                        background: theme.button,
                      }}
                      onClick={() => navigate(`/smes/${scoreFound.id}/score`)}
                    >
                      Start Scoring
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

       
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
  text: "#ffffff",
  subText: "rgba(255,255,255,0.72)",
  button: BRAND,
  border: "rgba(255,255,255,0.10)",
  iconBg1: "rgba(59,130,246,0.16)",
  iconBg2: "rgba(16,185,129,0.16)",
  iconBg3: "rgba(245,158,11,0.16)",
  errorBg: "rgba(220,38,38,0.10)",
  errorText: "#fecaca",
  errorBorder: "rgba(220,38,38,0.30)",
  tabActiveBg: "rgba(47,150,180,0.12)",
  tabActiveBorder: "rgba(47,150,180,0.24)",
};

const lightTheme = {
  bg: "#F4F7FB",
  navBg: "rgba(255,255,255,0.92)",
  card: "#ffffff",
  resultBg: "#F8FAFC",
  inputBg: "#ffffff",
  text: "#0F172A",
  subText: "#475569",
  button: BRAND,
  border: "rgba(15,23,42,0.10)",
  iconBg1: "rgba(59,130,246,0.12)",
  iconBg2: "rgba(16,185,129,0.12)",
  iconBg3: "rgba(245,158,11,0.14)",
  errorBg: "#FEF2F2",
  errorText: "#B91C1C",
  errorBorder: "#FECACA",
  tabActiveBg: "rgba(47,150,180,0.08)",
  tabActiveBorder: "rgba(47,150,180,0.18)",
};

const styles = {
  page: {
    minHeight: "100vh",
    fontFamily: "Inter, Arial, sans-serif",
  },

  navbar: {
    minHeight: 76,
    padding: "14px 28px",
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 50,
    backdropFilter: "blur(10px)",
    gap: 16,
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
    fontSize: 12,
    fontWeight: 500,
    marginTop: 4,
  },

  logoImg: {
    width: 108,
    height: 58,
    objectFit: "contain",
    display: "block",
  },

  tabWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  tabBtn: {
    padding: "10px 18px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
    transition: "all 0.2s ease",
  },

  rightWrap: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
  },

  iconBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    cursor: "pointer",
    fontSize: 16,
    border: "none",
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
    border: "none",
  },

  popupWrap: {
    position: "relative",
  },

  dropdown: {
    position: "absolute",
    top: 56,
    right: 0,
    minWidth: 210,
    borderRadius: 16,
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    overflow: "hidden",
    zIndex: 100,
  },

  dropdownHead: {
    padding: "14px 16px",
    fontSize: 14,
    fontWeight: 800,
  },

  dropdownText: {
    padding: "12px 16px",
    fontSize: 14,
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

  scoringGrid: {
    marginTop: 30,
    display: "grid",
    gridTemplateColumns: "1fr 1.2fr",
    gap: 20,
  },

  panelCard: {
    borderRadius: 26,
    padding: 26,
    boxShadow: "0 14px 34px rgba(15,23,42,0.05)",
  },

  featureBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    padding: 16,
    borderRadius: 18,
    background: "rgba(47,150,180,0.06)",
    marginBottom: 20,
  },

  featureIcon: {
    fontSize: 26,
    lineHeight: 1,
  },

  featureTitle: {
    fontSize: 16,
    fontWeight: 800,
    marginBottom: 6,
  },

  featureText: {
    fontSize: 14,
    lineHeight: 1.6,
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

  evalList: {
    display: "grid",
    gap: 14,
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