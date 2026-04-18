export default function ApprovalTab(props) {
  const { theme, styles, loading, pending, actionLoadingId, approve, disapprove, searchEvaluator, setSearchEvaluator, handleSearchEvaluator, searchLoading, searchResults, blockEvaluator, unblockEvaluator } = props;

  return (
    <section>
      <div style={styles.sectionHeader}>
        <div>
          <h1 style={{ margin: 0, fontWeight: 700 }}>Evaluator Approval & Access Control</h1>
          <p style={{ marginTop: 8, color: theme.subText }}>Approve, disapprove, search, and block evaluators from system access.</p>
        </div>
      </div>
      <div style={{ ...styles.panel, background: theme.card, border: `1px solid ${theme.border}`, marginBottom: 24 }}>
        <div style={styles.panelHead}>
          <div>
            <h3 style={{ margin: 0 }}>Pending Evaluator Accounts</h3>
            <p style={{ ...styles.panelSub, color: theme.subText }}>Approve new evaluator registrations or disapprove them to block access.</p>
          </div>
        </div>
        {loading && <p>Loading...</p>}
        {!loading && pending.length === 0 && <div style={{ ...styles.emptyCard, background: theme.bg, border: `1px solid ${theme.border}`, color: theme.subText }}>No pending approvals.</div>}
        <div style={styles.cardGrid}>
          {pending.map((p) => {
            const profileId = p.id || p.profile_id;
            return (
              <div key={profileId} style={{ ...styles.card, background: theme.bg, border: `1px solid ${theme.border}` }}>
                <div style={styles.cardTop}>
                  <div>
                    <h3 style={{ margin: 0, color: theme.text }}>{p.username}</h3>
                    <p style={{ margin: "8px 0 6px", color: theme.subText }}>Evaluator account waiting for approval</p>
                    {p.bank_name && <p style={{ margin: 0, color: theme.subText, fontSize: 13 }}>Bank: {p.bank_name}</p>}
                  </div>
                </div>
                <div style={styles.actionRow}>
                  <button onClick={() => approve(profileId)} disabled={actionLoadingId === profileId} style={styles.approveBtn}>
                    {actionLoadingId === profileId ? "Please wait..." : "Approve"}
                  </button>
                  <button onClick={() => disapprove(profileId)} disabled={actionLoadingId === profileId} style={styles.disapproveBtn}>
                    {actionLoadingId === profileId ? "Please wait..." : "Disapprove"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ ...styles.panel, background: theme.card, border: `1px solid ${theme.border}` }}>
        <div style={styles.panelHead}>
          <div>
            <h3 style={{ margin: 0 }}>Search and Manage Evaluators</h3>
            <p style={{ ...styles.panelSub, color: theme.subText }}>Search for any evaluator and block or unblock access to the system.</p>
          </div>
        </div>
        <div style={styles.searchRow}>
          <input
            type="text"
            value={searchEvaluator}
            onChange={(e) => setSearchEvaluator(e.target.value)}
            placeholder="Search by evaluator username"
            style={{ ...styles.searchInput, background: theme.bg, border: `1px solid ${theme.border}`, color: theme.text }}
          />
          <button onClick={handleSearchEvaluator} style={styles.searchBtn}>Search</button>
        </div>
        {searchLoading && <p style={{ color: theme.subText, marginTop: 16 }}>Searching evaluators...</p>}
        {!searchLoading && searchEvaluator.trim() && searchResults.length === 0 && (
          <div style={{ ...styles.emptyCard, marginTop: 16, background: theme.bg, border: `1px solid ${theme.border}`, color: theme.subText }}>
            No evaluators found.
          </div>
        )}
        {searchResults.length > 0 && (
          <div style={styles.cardGrid}>
            {searchResults.map((ev) => (
              <div key={ev.profile_id} style={{ ...styles.card, background: theme.bg, border: `1px solid ${theme.border}` }}>
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>{ev.username}</h3>
                <div style={{ color: theme.subText, marginBottom: 6 }}>Role: Evaluator</div>
                <div style={{ color: theme.subText, marginBottom: 6 }}>Approval: {ev.is_approved ? "Approved" : "Not Approved"}</div>
                <div style={{ color: theme.subText, marginBottom: 14 }}>Status: {ev.is_active ? "Active" : "Blocked"}</div>
                <div style={styles.actionRow}>
                  {ev.is_active ? (
                    <button onClick={() => blockEvaluator(ev.profile_id)} disabled={actionLoadingId === ev.profile_id} style={styles.blockBtn}>
                      {actionLoadingId === ev.profile_id ? "Please wait..." : "Block"}
                    </button>
                  ) : (
                    <button onClick={() => unblockEvaluator(ev.profile_id)} disabled={actionLoadingId === ev.profile_id} style={styles.unblockBtn}>
                      {actionLoadingId === ev.profile_id ? "Please wait..." : "Unblock"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
