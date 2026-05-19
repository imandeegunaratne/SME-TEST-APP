import logo from "../../assets/logo.png";

export default function Header({ theme, styles, dark, setDark, activeTab, setActiveTab, logout, openPasswordModal, navigate }) {
  return (
    <header style={{ ...styles.navbar, background: theme.navBg, borderBottom: `1px solid ${theme.border}` }}>
      <div style={styles.brand} onClick={() => navigate("/bank-admin-dashboard")}>
        <img src={logo} alt="SME logo" style={styles.logoImg} />
        <div style={styles.brandTextWrap}>
          <div style={{ ...styles.brandTitle, color: theme.text }}>SME Scoring</div>
          <div style={{ ...styles.brandSub, color: theme.subText }}>Bank Admin Workspace</div>
        </div>
      </div>
      <div style={styles.tabWrap}>
        {["approval", "analysis"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tabBtn,
              background: activeTab === tab ? theme.tabActiveBg : "transparent",
              color: activeTab === tab ? theme.button : theme.text,
              border: activeTab === tab ? `1px solid ${theme.tabActiveBorder}` : "1px solid transparent",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div style={styles.rightWrap}>
        <button
          onClick={openPasswordModal}
          title="Change password"
          aria-label="Change password"
          style={{ ...styles.iconBtn, background: theme.card, border: `1px solid ${theme.border}`, color: theme.text }}
        >
          Password
        </button>
        <button onClick={() => setDark(!dark)} style={{ ...styles.iconBtn, background: theme.card, border: `1px solid ${theme.border}`, color: theme.text }}>
          {dark ? "Light" : "Dark"}
        </button>
        <button onClick={logout} style={{ ...styles.iconBtn, background: theme.card, border: `1px solid ${theme.border}`, color: theme.text }}>
          Logout
        </button>
      </div>
    </header>
  );
}
