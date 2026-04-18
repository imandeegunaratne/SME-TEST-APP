import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  appNavbarStyles,
  appShellStyles,
  createAppTheme,
} from "../styles/appTheme";

export default function EvaluatorHome() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [themeMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light" ? "light" : "dark";
  });

  const theme = useMemo(
    () =>
      createAppTheme(themeMode, themeMode === "dark" ? darkTheme : lightTheme),
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

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileRef = useRef(null);
  const notifyRef = useRef(null);

  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");

  const username = localStorage.getItem("username") || "Evaluator";

  function authHeaders(extra = {}) {
    const tokenNow = localStorage.getItem("token");
    return {
      Authorization: `Token ${tokenNow}`,
      ...extra,
    };
  }

  async function loadNotifications() {
    try {
      const res = await fetch("/api/evaluator/notifications/", {
        headers: authHeaders(),
      });

      if (res.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      const data = await res.json().catch(() => []);
      const items = Array.isArray(data) ? data : [];

      setNotifications(items);
      setUnreadCount(items.filter((n) => !n.is_read).length);
    } catch (e) {
      console.error("Failed to load notifications:", e);
    }
  }

  async function markNotificationsAsRead() {
    try {
      await fetch("/api/evaluator/notifications/mark-read/", {
        method: "POST",
        headers: authHeaders({
          "Content-Type": "application/json",
        }),
      });

      setNotifications((prev) =>
        prev.map((item) => ({ ...item, is_read: true }))
      );
      setUnreadCount(0);
    } catch (e) {
      console.error("Failed to mark notifications as read:", e);
    }
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
      if (!s1.ok) {
        throw new Error(sum.detail || "Failed to load summary.");
      }

      setSummary({
        total_smes: sum.total_smes || 0,
        scored_smes: sum.scored_smes || 0,
        pending_smes: sum.pending_smes || 0,
      });

      await loadNotifications();
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
    navigate("/");
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
      const res = await fetch("/api/change-password/", {
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
                background:
                  activeTab === tab ? theme.tabActiveBg : "transparent",
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
              onClick={() => {
                const next = !showNotifications;
                setShowNotifications(next);
                if (next && unreadCount > 0) {
                  markNotificationsAsRead();
                }
              }}
              style={{
                ...styles.iconBtn,
                background: theme.card,
                border: `1px solid ${theme.border}`,
                color: theme.text,
              }}
            >
              🔔
              {unreadCount > 0 && (
                <span style={styles.badge}>{unreadCount}</span>
              )}
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

                {notifications.length === 0 ? (
                  <div style={{ ...styles.dropdownText, color: theme.subText }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((item, i) => (
                    <div
                      key={item.id || i}
                      style={{
                        ...styles.notificationItem,
                        borderBottom:
                          i !== notifications.length - 1
                            ? `1px solid ${theme.border}`
                            : "none",
                        background: item.is_read
                          ? "transparent"
                          : theme.unreadBg,
                      }}
                    >
                      <div style={styles.notificationTitle}>
                        {item.title || "Notification"}
                      </div>
                      <div
                        style={{
                          ...styles.notificationText,
                          color: theme.subText,
                        }}
                      >
                        {item.message}
                      </div>
                      <div
                        style={{
                          ...styles.notificationTime,
                          color: theme.subText,
                        }}
                      >
                        {item.created_at}
                      </div>
                    </div>
                  ))
                )}
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
                  minWidth: 220,
                }}
              >
                <div
                  style={{
                    ...styles.profileHeader,
                    borderBottom: `1px solid ${theme.border}`,
                  }}
                >
                  <div style={styles.profileName}>{username}</div>
                  <div style={{ ...styles.profileRole, color: theme.subText }}>
                    Evaluator
                  </div>
                </div>

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
            <section style={styles.heroSection}>
              <div>
                <h1 style={styles.heroTitle}>Welcome back, {username}</h1>
              </div>
            </section>

            <section style={styles.sectionBlock}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Overview</h2>
                <p style={{ ...styles.sectionSub, color: theme.subText }}>
                  Quick insight into your SME evaluation activity
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
                        ...styles.statTopBar,
                        background: theme.accent1,
                      }}
                    />
                    <div style={styles.statMetaRow}>
                      <span
                        style={{
                          ...styles.statBadge,
                          background: theme.softAccent1,
                          color: theme.accent1,
                        }}
                      >
                        Overview
                      </span>
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
                        ...styles.statTopBar,
                        background: theme.accent2,
                      }}
                    />
                    <div style={styles.statMetaRow}>
                      <span
                        style={{
                          ...styles.statBadge,
                          background: theme.softAccent2,
                          color: theme.accent2,
                        }}
                      >
                        Completed
                      </span>
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
                        ...styles.statTopBar,
                        background: theme.accent3,
                      }}
                    />
                    <div style={styles.statMetaRow}>
                      <span
                        style={{
                          ...styles.statBadge,
                          background: theme.softAccent3,
                          color: theme.accent3,
                        }}
                      >
                        Pending
                      </span>
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
                  Search an SME using the BR number and view the completed report
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
                    <div style={styles.resultTopRow}>
                      <div style={styles.resultTitle}>{homeFound.name}</div>
                      <span
                        style={{
                          ...styles.resultPill,
                          background: theme.softAccent1,
                          color: theme.accent1,
                        }}
                      >
                        Report Ready
                      </span>
                    </div>
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
              <div style={styles.panelHeaderLine}>
                <div>
                  <h2 style={styles.sectionTitle}>Register SME</h2>
                  <p style={{ ...styles.sectionSub, color: theme.subText }}>
                    Add a new SME before starting the scoring process
                  </p>
                </div>
              </div>

              <button
                style={{ ...styles.primaryBtn, background: theme.button }}
                onClick={() => navigate("/sme-register")}
              >
                Register New SME
              </button>
            </section>

            <section
              style={{
                ...styles.panelCard,
                background: theme.card,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div style={styles.panelHeaderLine}>
                <div>
                  <h2 style={styles.sectionTitle}>Search & Start Scoring</h2>
                  <p style={{ ...styles.sectionSub, color: theme.subText }}>
                    Search an SME by BR number and continue scoring
                  </p>
                </div>
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
                    ...styles.scoreResultCard,
                    background: theme.resultBg,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <div style={styles.scoreResultMain}>
                    <div style={styles.scoreResultTop}>
                      <div style={styles.resultTitle}>{scoreFound.name}</div>
                      <span
                        style={{
                          ...styles.resultPill,
                          background: theme.softAccent2,
                          color: theme.accent2,
                        }}
                      >
                        Ready for Scoring
                      </span>
                    </div>

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
  errorBg: "rgba(220,38,38,0.10)",
  errorText: "#fecaca",
  errorBorder: "rgba(220,38,38,0.30)",
  tabActiveBg: "rgba(47,150,180,0.12)",
  tabActiveBorder: "rgba(47,150,180,0.24)",
  accent1: "#3B82F6",
  accent2: "#10B981",
  accent3: "#F59E0B",
  softAccent1: "rgba(59,130,246,0.14)",
  softAccent2: "rgba(16,185,129,0.14)",
  softAccent3: "rgba(245,158,11,0.16)",
  unreadBg: "rgba(47,150,180,0.10)",
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
  errorBg: "#FEF2F2",
  errorText: "#B91C1C",
  errorBorder: "#FECACA",
  tabActiveBg: "rgba(47,150,180,0.08)",
  tabActiveBorder: "rgba(47,150,180,0.18)",
  accent1: "#2563EB",
  accent2: "#059669",
  accent3: "#D97706",
  softAccent1: "rgba(37,99,235,0.10)",
  softAccent2: "rgba(5,150,105,0.10)",
  softAccent3: "rgba(217,119,6,0.12)",
  unreadBg: "rgba(47,150,180,0.08)",
};

const styles = {
  page: appShellStyles.page,

  navbar: {
    ...appNavbarStyles.shell,
    ...appNavbarStyles.gridShell,
  },

  brand: {
    ...appNavbarStyles.brand,
    minWidth: 260,
  },

  brandTextWrap: appNavbarStyles.brandTextWrap,

  brandTitle: appNavbarStyles.brandTitle,

  brandSub: appNavbarStyles.brandSub,

  logoImg: appNavbarStyles.logoImg,

  tabWrap: appNavbarStyles.tabWrap,

  tabBtn: appNavbarStyles.tabBtn,

  rightWrap: appNavbarStyles.rightWrap,

  iconBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    cursor: "pointer",
    fontSize: 18,
    border: "none",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  badge: {
    position: "absolute",
    top: -6,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 5px",
    background: "#ef4444",
    color: "#fff",
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
    minWidth: 320,
    maxHeight: 360,
    overflowY: "auto",
    borderRadius: 18,
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    overflowX: "hidden",
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

  notificationItem: {
    padding: "14px 16px",
  },

  notificationTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 4,
  },

  notificationText: {
    fontSize: 13,
    lineHeight: 1.5,
    marginBottom: 6,
  },

  notificationTime: {
    fontSize: 12,
  },

  profileHeader: {
    padding: "14px 16px",
  },

  profileName: {
    fontSize: 15,
    fontWeight: 800,
  },

  profileRole: {
    marginTop: 4,
    fontSize: 13,
  },

  main: {
    width: "min(1180px, 92%)",
    margin: "32px auto",
    paddingBottom: 40,
  },

  heroSection: {
    marginBottom: 12,
  },

  heroTitle: {
    margin: 0,
    fontSize: 30,
    fontWeight: 800,
    letterSpacing: "-0.4px",
  },

  alert: {
    padding: "14px 16px",
    borderRadius: 14,
    marginBottom: 20,
    fontWeight: 600,
  },

  sectionBlock: {
    marginTop: 26,
  },

  sectionHeader: {
    marginBottom: 16,
  },

  sectionTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: "-0.3px",
    lineHeight: 1.2,
  },

  sectionSub: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 1.6,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 18,
  },

  statCard: {
    borderRadius: 22,
    padding: 22,
    boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
    position: "relative",
    overflow: "hidden",
  },

  statTopBar: {
    height: 5,
    borderRadius: 999,
    marginBottom: 18,
  },

  statMetaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  statBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
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
    borderRadius: 22,
    padding: 28,
    boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
  },

  scoringGrid: {
    marginTop: 30,
    display: "grid",
    gridTemplateColumns: "1fr 1.2fr",
    gap: 20,
  },

  panelCard: {
    borderRadius: 22,
    padding: 28,
    boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
  },

  panelHeaderLine: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 20,
    flexWrap: "wrap",
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
    gap: 6,
  },

  resultTopRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  resultTitle: {
    fontSize: 18,
    fontWeight: 800,
  },

  resultSub: {
    fontSize: 14,
  },

  resultPill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
  },

  scoreResultCard: {
    marginTop: 18,
    padding: 18,
    borderRadius: 18,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18,
    flexWrap: "wrap",
  },

  scoreResultMain: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  scoreResultTop: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
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
