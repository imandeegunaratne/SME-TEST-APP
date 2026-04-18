export default function PasswordModal({
  theme, styles, passwordForm, handlePasswordInput, passwordMsg, setShowPasswordModal, handleChangePassword, passwordSaving,
}) {
  const fields = [
    ["old_password", "Old Password"],
    ["new_password", "New Password"],
    ["confirm_password", "Confirm New Password"],
  ];

  return (
    <div style={styles.modalOverlay}>
      <div style={{ ...styles.modalCard, background: theme.card, color: theme.text, border: `1px solid ${theme.border}` }}>
        <div style={styles.modalTop}>
          <h3 style={{ margin: 0, fontSize: 22 }}>Change Password</h3>
          <button style={{ ...styles.closeBtn, color: theme.text }} onClick={() => setShowPasswordModal(false)}>Ã—</button>
        </div>
        <form onSubmit={handleChangePassword}>
          {fields.map(([name, label]) => (
            <div key={name}>
              <label style={styles.label}>{label}</label>
              <input
                type="password"
                name={name}
                value={passwordForm[name]}
                onChange={handlePasswordInput}
                style={{ ...styles.input, background: theme.inputBg, color: theme.text, border: `1px solid ${theme.border}` }}
              />
            </div>
          ))}
          {passwordMsg && (
            <div style={{ ...styles.passwordMsg, color: passwordMsg === "Password changed successfully." ? "#16a34a" : "#dc2626" }}>
              {passwordMsg}
            </div>
          )}
          <div style={styles.modalActions}>
            <button
              type="button"
              style={{ ...styles.cancelBtn, background: theme.inputBg, color: theme.text, border: `1px solid ${theme.border}` }}
              onClick={() => setShowPasswordModal(false)}
            >
              Cancel
            </button>
            <button type="submit" style={{ ...styles.primaryBtn, background: theme.button }} disabled={passwordSaving}>
              {passwordSaving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
