export default function HomeTab({ theme, styles, username, loading, summary, homeSearch, setHomeSearch, homeSearchMsg, homeFound, searchHomeByBR, navigate }) {
  const cards = [
    ["Overview", "Total SMEs", summary.total_smes, theme.accent1, theme.softAccent1],
    ["Completed", "Scored SMEs", summary.scored_smes, theme.accent2, theme.softAccent2],
    ["Pending", "Pending SMEs", summary.pending_smes, theme.accent3, theme.softAccent3],
  ];

  return (
    <>
      <section style={styles.heroSection}>
        <div><h1 style={styles.heroTitle}>Welcome back, {username}</h1></div>
      </section>
      <section style={styles.sectionBlock}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Overview</h2>
          <p style={{ ...styles.sectionSub, color: theme.subText }}>Quick insight into your SME evaluation activity</p>
        </div>
        {loading ? (
          <div style={{ color: theme.subText }}>Loading summary...</div>
        ) : (
          <div style={styles.statsGrid}>
            {cards.map(([badge, label, value, accent, soft]) => (
              <div key={label} style={{ ...styles.statCard, background: theme.card, border: `1px solid ${theme.border}` }}>
                <div style={{ ...styles.statTopBar, background: accent }} />
                <div style={styles.statMetaRow}>
                  <span style={{ ...styles.statBadge, background: soft, color: accent }}>{badge}</span>
                </div>
                <div style={styles.statLabel}>{label}</div>
                <div style={styles.statValue}>{value}</div>
              </div>
            ))}
          </div>
        )}
      </section>
      <section style={{ ...styles.searchCard, background: theme.card, border: `1px solid ${theme.border}` }}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Search SME Report</h2>
          <p style={{ ...styles.sectionSub, color: theme.subText }}>Search an SME using the BR number and view the completed report</p>
        </div>
        <div style={styles.searchRow}>
          <input
            value={homeSearch}
            onChange={(e) => setHomeSearch(e.target.value)}
            placeholder="Enter BR number"
            style={{ ...styles.search, background: theme.inputBg, color: theme.text, border: `1px solid ${theme.border}` }}
          />
          <button style={{ ...styles.searchBtn, background: theme.button }} onClick={searchHomeByBR}>Search</button>
        </div>
        {homeSearchMsg && <div style={{ ...styles.inlineMessage, color: theme.subText }}>{homeSearchMsg}</div>}
        {homeFound && (
          <div style={{ ...styles.resultCard, background: theme.resultBg, border: `1px solid ${theme.border}` }}>
            <div style={styles.resultLeft}>
              <div style={styles.resultTopRow}>
                <div style={styles.resultTitle}>{homeFound.name}</div>
                <span style={{ ...styles.resultPill, background: theme.softAccent1, color: theme.accent1 }}>Report Ready</span>
              </div>
              <div style={{ ...styles.resultSub, color: theme.subText }}>BR Number: {homeFound.br_number}</div>
            </div>
            <div style={styles.actionWrap}>
              <button style={{ ...styles.smallPrimaryBtn, background: theme.button }} onClick={() => navigate(`/smes/${homeFound.id}/report`)}>View Report</button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
