import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createAppTheme } from "../../styles/appTheme";
import AnalysisTab from "./AnalysisTab";
import ApprovalTab from "./ApprovalTab";
import Header from "./Header";
import PasswordModal from "./PasswordModal";
import { styles } from "./styles";
import { darkTheme, lightTheme } from "./theme";
import { useBankAdminDashboard } from "./useBankAdminDashboard";

export default function BankAdminDashboardPage() {
  const navigate = useNavigate();
  const admin = useBankAdminDashboard(navigate);
  const theme = useMemo(() => createAppTheme(admin.dark, admin.dark ? darkTheme : lightTheme), [admin.dark]);

  return (
    <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>
      <Header {...admin} theme={theme} styles={styles} navigate={navigate} />
      {admin.showPasswordModal && <PasswordModal {...admin} theme={theme} styles={styles} />}
      <main style={styles.main}>
        {admin.error && <div style={{ ...styles.messageBox, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", color: "#ef4444" }}>{admin.error}</div>}
        {admin.successMsg && <div style={{ ...styles.messageBox, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)", color: "#22c55e" }}>{admin.successMsg}</div>}
        {admin.activeTab === "approval" ? (
          <ApprovalTab {...admin} theme={theme} styles={styles} />
        ) : (
          <AnalysisTab {...admin} theme={theme} styles={styles} />
        )}
      </main>
    </div>
  );
}
