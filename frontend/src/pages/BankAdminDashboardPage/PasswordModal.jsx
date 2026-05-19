export default function PasswordModal({
  theme,
  styles,
  passwordForm,
  handlePasswordInput,
  passwordMsg,
  setShowPasswordModal,
  handleChangePassword,
  passwordSaving,
}) {
  const fields = [
    ["old_password", "Current Password"],
    ["new_password", "New Password"],
    ["confirm_password", "Confirm New Password"],
  ];

  return (
    <div style={styles.modalOverlay}>
      <div style={{ ...styles.modalCard, background: theme.card, color: theme.text, border: `1px solid ${theme.border}` }}>
        <div style={styles.modalTop}>
          <h3 style={styles.modalTitle}>Change Password</h3>
          <button
            type="button"
            style={{ ...styles.closeBtn, color: theme.text }}
            onClick={() => setShowPasswordModal(false)}
            aria-label="Close change password form"
          >
            X
          </button>
        </div>
        <form onSubmit={handleChangePassword} style={styles.modalForm}>
          {fields.map(([name, label]) => (
            <label key={name} style={styles.modalField}>
              <span style={styles.modalLabel}>{label}</span>
              <input
                type="password"
                name={name}
                value={passwordForm[name]}
                onChange={handlePasswordInput}
                autoComplete={name === "old_password" ? "current-password" : "new-password"}
                style={{ ...styles.modalInput, background: theme.inputBg, color: theme.text, border: `1px solid ${theme.border}` }}
              />
            </label>
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
            <button type="submit" style={{ ...styles.saveBtn, background: theme.button }} disabled={passwordSaving}>
              {passwordSaving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
