export default function ScoringTab({ theme, styles, scoreSearch, setScoreSearch, scoreSearchMsg, scoreFound, searchScoreByBR, navigate }) {
  return (
    <div style={styles.scoringGrid}>
      <section style={{ ...styles.panelCard, background: theme.card, border: `1px solid ${theme.border}` }}>
        <div style={styles.panelHeaderLine}>
          <div>
            <h2 style={styles.sectionTitle}>Register SME</h2>
            <p style={{ ...styles.sectionSub, color: theme.subText }}>Add a new SME before starting the scoring process</p>
          </div>
        </div>
        <button style={{ ...styles.primaryBtn, background: theme.button }} onClick={() => navigate("/sme-register")}>Register New SME</button>
      </section>
      <section style={{ ...styles.panelCard, background: theme.card, border: `1px solid ${theme.border}` }}>
        <div style={styles.panelHeaderLine}>
          <div>
            <h2 style={styles.sectionTitle}>Search & Start Scoring</h2>
            <p style={{ ...styles.sectionSub, color: theme.subText }}>Search an SME by BR number and continue scoring</p>
          </div>
        </div>
        <div style={styles.searchRow}>
          <input
            value={scoreSearch}
            onChange={(e) => setScoreSearch(e.target.value)}
            placeholder="Enter BR number"
            style={{ ...styles.search, background: theme.inputBg, color: theme.text, border: `1px solid ${theme.border}` }}
          />
          <button style={{ ...styles.searchBtn, background: theme.button }} onClick={searchScoreByBR}>Search</button>
        </div>
        {scoreSearchMsg && <div style={{ ...styles.inlineMessage, color: theme.subText }}>{scoreSearchMsg}</div>}
        {scoreFound && (
          <div style={{ ...styles.scoreResultCard, background: theme.resultBg, border: `1px solid ${theme.border}` }}>
            <div style={styles.scoreResultMain}>
              <div style={styles.scoreResultTop}>
                <div style={styles.resultTitle}>{scoreFound.name}</div>
                <span style={{ ...styles.resultPill, background: theme.softAccent2, color: theme.accent2 }}>Ready for Scoring</span>
              </div>
              <div style={{ ...styles.resultSub, color: theme.subText }}>BR Number: {scoreFound.br_number}</div>
            </div>
            <div style={styles.actionWrap}>
              <button style={{ ...styles.smallPrimaryBtn, background: theme.button }} onClick={() => navigate(`/smes/${scoreFound.id}/score`)}>Start Scoring</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
