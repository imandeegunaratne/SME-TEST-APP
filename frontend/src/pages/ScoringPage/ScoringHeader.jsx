import logo from "../../assets/logo.png";

export default function ScoringHeader({ theme, styles, navigate }) {
  return (
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
          <div style={{ ...styles.brandTitle, color: theme.text }}>SME Scoring</div>
          <div style={{ ...styles.brandSub, color: theme.subText }}>Evaluator Workspace</div>
        </div>
      </div>

      <div style={styles.rightWrap}>
        <button
          style={{
            ...styles.profileBtn,
            background: theme.button,
            color: "#fff",
            borderRadius: 14,
            width: "auto",
            padding: "0 16px",
          }}
          onClick={() => navigate("/evaluator-home")}
        >
          Back
        </button>
      </div>
    </header>
  );
}
