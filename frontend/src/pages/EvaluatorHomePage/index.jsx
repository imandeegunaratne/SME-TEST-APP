import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createAppTheme } from "../../styles/appTheme";
import EvaluatorHeader from "./EvaluatorHeader";
import HomeTab from "./HomeTab";
import PasswordModal from "./PasswordModal";
import ScoringTab from "./ScoringTab";
import { styles } from "./styles";
import { darkTheme, lightTheme } from "./theme";
import { useEvaluatorHome } from "./useEvaluatorHome";

export default function EvaluatorHomePage() {
  const navigate = useNavigate();
  const home = useEvaluatorHome(navigate);
  const theme = useMemo(
    () => createAppTheme(home.themeMode, home.themeMode === "dark" ? darkTheme : lightTheme),
    [home.themeMode]
  );

  return (
    <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>
      <EvaluatorHeader {...home} theme={theme} styles={styles} navigate={navigate} />
      <main style={styles.main}>
        {home.err && (
          <div style={{ ...styles.alert, background: theme.errorBg, color: theme.errorText, border: `1px solid ${theme.errorBorder}` }}>
            {home.err}
          </div>
        )}
        {home.activeTab === "home" ? (
          <HomeTab {...home} theme={theme} styles={styles} navigate={navigate} />
        ) : (
          <ScoringTab {...home} theme={theme} styles={styles} navigate={navigate} />
        )}
      </main>
      {home.showPasswordModal && <PasswordModal {...home} theme={theme} styles={styles} />}
    </div>
  );
}
