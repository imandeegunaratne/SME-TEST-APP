import logo from "../../assets/logo.png";

export default function EvaluatorHeader(props) {
  const {
    theme, styles, activeTab, setActiveTab, notifyRef, showNotifications, setShowNotifications,
    unreadCount, notifications, markNotificationsAsRead, profileRef, setShowProfileMenu,
    showProfileMenu, openPasswordModal, handleLogout, username, navigate,
  } = props;

  return (
    <header style={{ ...styles.navbar, background: theme.navBg, borderBottom: `1px solid ${theme.border}` }}>
      <div style={styles.brand} onClick={() => navigate("/evaluator-home")}>
        <img src={logo} alt="SME logo" style={styles.logoImg} />
        <div style={styles.brandTextWrap}>
          <div style={{ ...styles.brandTitle, color: theme.text }}>SME Scoring</div>
          <div style={{ ...styles.brandSub, color: theme.subText }}>Evaluator Workspace</div>
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
              border: activeTab === tab ? `1px solid ${theme.tabActiveBorder}` : "1px solid transparent",
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
              if (next && unreadCount > 0) markNotificationsAsRead();
            }}
            style={{ ...styles.iconBtn, background: theme.card, border: `1px solid ${theme.border}`, color: theme.text }}
          >
            {"\u{1F514}"}
            {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
          </button>
          {showNotifications && (
            <div style={{ ...styles.dropdown, background: theme.card, border: `1px solid ${theme.border}` }}>
              <div style={styles.dropdownHead}>Notifications</div>
              {notifications.length === 0 ? (
                <div style={{ ...styles.dropdownText, color: theme.subText }}>No notifications yet.</div>
              ) : (
                notifications.map((item, i) => (
                  <div
                    key={item.id || i}
                    style={{
                      ...styles.notificationItem,
                      borderBottom: i !== notifications.length - 1 ? `1px solid ${theme.border}` : "none",
                      background: item.is_read ? "transparent" : theme.unreadBg,
                    }}
                  >
                    <div style={styles.notificationTitle}>{item.title || "Notification"}</div>
                    <div style={{ ...styles.notificationText, color: theme.subText }}>{item.message}</div>
                    <div style={{ ...styles.notificationTime, color: theme.subText }}>{item.created_at}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <div style={styles.popupWrap} ref={profileRef}>
          <button onClick={() => setShowProfileMenu((v) => !v)} style={{ ...styles.profileBtn, background: theme.button, color: "#fff" }}>
            {username[0]?.toUpperCase() || "U"}
          </button>
          {showProfileMenu && (
            <div style={{ ...styles.dropdown, background: theme.card, border: `1px solid ${theme.border}`, minWidth: 220 }}>
              <div style={{ ...styles.profileHeader, borderBottom: `1px solid ${theme.border}` }}>
                <div style={styles.profileName}>{username}</div>
                <div style={{ ...styles.profileRole, color: theme.subText }}>Evaluator</div>
              </div>
              <button style={{ ...styles.dropdownItem, color: theme.text }} onClick={openPasswordModal}>Change Password</button>
              <button style={{ ...styles.dropdownItem, color: "#dc2626" }} onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
