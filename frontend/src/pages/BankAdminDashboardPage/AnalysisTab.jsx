import { CRITERIA_NAMES } from "./constants";

function EvaluatorAnalysis({ theme, styles, evaluatorData, selectedEvaluatorId, setSelectedEvaluatorId, selectedEvaluatorLoading, selectedEvaluatorData, dark, getBarHeight }) {
  return (
    <div style={{ ...styles.panel, background: theme.card, border: `1px solid ${theme.border}`, marginBottom: 24 }}>
      <div style={styles.panelHead}>
        <div>
          <h3 style={{ margin: 0 }}>Evaluator Analysis</h3>
          <p style={{ ...styles.panelSub, color: theme.subText }}>Evaluator counts, selected evaluator distribution, and total evaluations</p>
        </div>
      </div>
      {!evaluatorData ? <p style={{ color: theme.subText }}>No evaluator analysis available.</p> : (
        <>
          <div style={styles.innerStatsGrid}>
            {[["Approved", evaluatorData.approved_evaluators || 0], ["Pending", evaluatorData.pending_evaluators || 0], ["Total", evaluatorData.total_evaluators || 0]].map(([label, value]) => (
              <div key={label} style={{ ...styles.innerStatCard, background: theme.bg, border: `1px solid ${theme.border}` }}>
                <div style={styles.innerStatLabel}>{label}</div><div style={styles.innerStatValue}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ ...styles.subPanel, background: theme.bg, border: `1px solid ${theme.border}`, marginTop: 20 }}>
            <h4 style={{ marginTop: 0, marginBottom: 14 }}>Select Evaluator</h4>
            <select value={selectedEvaluatorId} onChange={(e) => setSelectedEvaluatorId(e.target.value)} style={{ ...styles.selectInput, background: theme.card, border: `1px solid ${theme.border}`, color: theme.text }}>
              <option value="">Choose evaluator</option>
              {(evaluatorData.evaluators || []).map((ev) => <option key={ev.evaluator_id} value={ev.evaluator_id}>{ev.username}</option>)}
            </select>
            {!selectedEvaluatorId && <div style={{ marginTop: 18, color: theme.subText }}>Select an evaluator to display the score distribution chart.</div>}
            {selectedEvaluatorLoading && <p style={{ color: theme.subText, marginTop: 16 }}>Loading evaluator details...</p>}
            {selectedEvaluatorData && !selectedEvaluatorLoading && (
              <div style={{ marginTop: 18 }}>
                <div style={styles.selectedEvalGrid}>
                  {[["Evaluator", selectedEvaluatorData.username, true], ["Average", selectedEvaluatorData.average_score], ["Highest", selectedEvaluatorData.highest_score], ["Lowest", selectedEvaluatorData.lowest_score]].map(([label, value, small]) => (
                    <div key={label} style={{ ...styles.selectedEvalCard, background: theme.card, border: `1px solid ${theme.border}` }}>
                      <div style={styles.selectedEvalLabel}>{label}</div>
                      <div style={small ? styles.selectedEvalValueSmall : styles.selectedEvalValue}>{value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ ...styles.subPanel, background: theme.card, border: `1px solid ${theme.border}`, marginTop: 18 }}>
                  <h4 style={{ marginTop: 0, marginBottom: 14 }}>Evaluator Score Distribution</h4>
                  {!Array.isArray(selectedEvaluatorData.smes) || selectedEvaluatorData.smes.length === 0 ? (
                    <p style={{ color: theme.subText }}>No SME scoring records found for this evaluator.</p>
                  ) : (
                    <>
                      <div style={styles.chartWrap}>
                        {selectedEvaluatorData.smes.map((sme) => (
                          <div key={sme.sme_id} style={styles.chartCol}>
                            <div style={{ color: theme.text, fontSize: 12, fontWeight: 700 }}>{sme.total_score}</div>
                            <div style={{ ...styles.chartBarArea, background: dark ? "rgba(255,255,255,0.05)" : "rgba(11,18,32,0.05)", border: `1px solid ${theme.border}` }}>
                              <div style={{ ...styles.chartBar, height: getBarHeight(sme.total_score), background: theme.button }} />
                            </div>
                            <div style={{ ...styles.chartLabel, color: theme.subText }} title={`${sme.sme_name} (${sme.br_number})`}>{sme.br_number}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ ...styles.evaluationCountCard, background: theme.bg, border: `1px solid ${theme.border}`, color: theme.text }}>
                        <div style={{ fontSize: 13, color: theme.subText, marginBottom: 6 }}>Number of evaluations done by this evaluator</div>
                        <div style={{ fontSize: 28, fontWeight: 800 }}>{selectedEvaluatorData.total_scored}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SmeAnalysis(props) {
  const { theme, styles, summary, industryData, selectedIndustry, setSelectedIndustry, selectedIndustryData, dark, getBarHeight, industryMaxScore, smes, selectedIds, toggleSme, comparisonData } = props;
  return (
    <div style={{ ...styles.panel, background: theme.card, border: `1px solid ${theme.border}`, marginBottom: 24 }}>
      <div style={styles.panelHead}>
        <div>
          <h3 style={{ margin: 0 }}>SME Analysis</h3>
          <p style={{ ...styles.panelSub, color: theme.subText }}>Industry, criterion, and SME comparison insights</p>
        </div>
      </div>
      <div style={styles.innerStatsGrid}>
        {[["Total SMEs", summary?.total_smes || 0], ["Scored SMEs", summary?.scored_smes || 0], ["Pending SMEs", summary?.pending_smes || 0]].map(([label, value]) => (
          <div key={label} style={{ ...styles.innerStatCard, background: theme.bg, border: `1px solid ${theme.border}` }}>
            <div style={styles.innerStatLabel}>{label}</div><div style={styles.innerStatValue}>{value}</div>
          </div>
        ))}
      </div>
      <div style={styles.analysisGrid}>
        <div style={{ ...styles.subPanel, background: theme.bg, border: `1px solid ${theme.border}`, marginTop: 20 }}>
          <h4 style={{ marginTop: 0, marginBottom: 14 }}>Industry Analysis</h4>
          <select value={selectedIndustry} onChange={(e) => setSelectedIndustry(e.target.value)} style={{ ...styles.selectInput, background: theme.card, border: `1px solid ${theme.border}`, color: theme.text, marginBottom: 16 }}>
            <option value="">Choose industry</option>
            {industryData.map((row, index) => <option key={`${row.industry}-${index}`} value={row.industry}>{row.industry}</option>)}
          </select>
          {!selectedIndustryData ? <p style={{ color: theme.subText }}>Select an industry to view score distribution and statistics.</p> : (
            <>
              <div style={styles.selectedEvalGrid}>
                {[
                  ["Industry", selectedIndustryData.industry, true],
                  ["Average", selectedIndustryData.average_score],
                  ["Highest", selectedIndustryData.highest_score],
                  ["Lowest", selectedIndustryData.lowest_score],
                ].map(([label, value, small]) => (
                  <div key={label} style={{ ...styles.selectedEvalCard, background: theme.card, border: `1px solid ${theme.border}` }}>
                    <div style={styles.selectedEvalLabel}>{label}</div>
                    <div style={small ? styles.selectedEvalValueSmall : styles.selectedEvalValue}>{value}</div>
                    {label === "Highest" && <div style={{ fontSize: 12, color: theme.subText, marginTop: 6 }}>BR: {selectedIndustryData.highest_sme_br || "-"}</div>}
                    {label === "Lowest" && <div style={{ fontSize: 12, color: theme.subText, marginTop: 6 }}>BR: {selectedIndustryData.lowest_sme_br || "-"}</div>}
                  </div>
                ))}
              </div>
              <div style={{ ...styles.subPanel, background: theme.card, border: `1px solid ${theme.border}`, marginTop: 18 }}>
                <h4 style={{ marginTop: 0, marginBottom: 14 }}>Industry Score Distribution</h4>
                {!Array.isArray(selectedIndustryData.smes) || selectedIndustryData.smes.length === 0 ? (
                  <p style={{ color: theme.subText }}>No scored SMEs available for this industry.</p>
                ) : (
                  <div style={styles.chartWrap}>
                    {selectedIndustryData.smes.map((sme) => (
                      <div key={sme.id} style={styles.chartCol}>
                        <div style={{ color: theme.text, fontSize: 12, fontWeight: 700 }}>{sme.total_score}</div>
                        <div style={{ ...styles.chartBarArea, background: dark ? "rgba(255,255,255,0.05)" : "rgba(11,18,32,0.05)", border: `1px solid ${theme.border}` }}>
                          <div style={{ ...styles.chartBar, height: getBarHeight(sme.total_score, industryMaxScore), background: theme.button }} />
                        </div>
                        <div style={{ ...styles.chartLabel, color: theme.subText }} title={`${sme.name} (${sme.br_number})`}>{sme.br_number}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <div style={{ ...styles.subPanel, background: theme.bg, border: `1px solid ${theme.border}`, marginTop: 20 }}>
        <h4 style={{ marginTop: 0 }}>SME Comparison Tool</h4>
        <p style={{ color: theme.subText, marginTop: 6 }}>Select 2 or 3 SMEs to compare their total and criterion-level scores.</p>
        <div style={styles.smeSelectGrid}>
          {smes.map((sme) => (
            <label key={sme.id} style={{ ...styles.selectCard, background: selectedIds.includes(sme.id) ? theme.tabActiveBg : theme.card, border: `1px solid ${selectedIds.includes(sme.id) ? theme.tabActiveBorder : theme.border}`, color: theme.text }}>
              <input type="checkbox" checked={selectedIds.includes(sme.id)} onChange={() => toggleSme(sme.id)} />
              <div>
                <div style={{ fontWeight: 700 }}>{sme.name}</div>
                <div style={{ fontSize: 13, color: theme.subText }}>BR: {sme.br_number}</div>
                <div style={{ fontSize: 13, color: theme.subText }}>Industry: {sme.industry}</div>
                <div style={{ fontSize: 13, color: theme.subText }}>Score: {sme.total_score}</div>
              </div>
            </label>
          ))}
        </div>
        {comparisonData.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h4 style={{ marginBottom: 14 }}>Comparison Result</h4>
            <div style={styles.cardGrid}>
              {comparisonData.map((item) => (
                <div key={item.id} style={{ ...styles.card, background: theme.card, border: `1px solid ${theme.border}` }}>
                  <h3 style={{ marginTop: 0 }}>{item.name}</h3>
                  <div style={{ color: theme.subText, marginBottom: 6 }}>BR: {item.br_number}</div>
                  <div style={{ color: theme.subText, marginBottom: 6 }}>Industry: {item.industry}</div>
                  <div style={{ fontWeight: 700, marginBottom: 14 }}>Total Score: {item.total_score}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Criteria</div>
                  {Object.keys(item.criteria || {}).length === 0 ? (
                    <div style={{ color: theme.subText }}>No criterion scores available.</div>
                  ) : (
                    Object.entries(item.criteria).sort(([codeA], [codeB]) => parseInt(codeA.replace(/\D/g, ""), 10) - parseInt(codeB.replace(/\D/g, ""), 10)).map(([code, score]) => {
                      const num = parseInt(code.replace(/\D/g, ""), 10);
                      const name = CRITERIA_NAMES[num - 1] || code;
                      return (
                        <div key={code} style={styles.criteriaRow}>
                          <span style={styles.criteriaLabel}>{code} {name}</span>
                          <strong style={styles.criteriaScore}>{score}</strong>
                        </div>
                      );
                    })
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityAndExport({ theme, styles, auditLogs, auditLoading, exporting, handleExportSmes, license }) {
  return (
    <div style={{ ...styles.panel, background: theme.card, border: `1px solid ${theme.border}`, marginBottom: 24 }}>
      <div style={styles.panelHead}>
        <div>
          <h3 style={{ margin: 0 }}>Governance & Reporting</h3>
          <p style={{ ...styles.panelSub, color: theme.subText }}>Operational audit trail and portfolio export for bank review packs</p>
        </div>
        <button
          type="button"
          onClick={handleExportSmes}
          disabled={exporting}
          style={{ ...styles.searchBtn, opacity: exporting ? 0.7 : 1 }}
        >
          {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>
      <div style={{ ...styles.innerStatsGrid, marginBottom: 16 }}>
        {[
          ["Status", license?.status || "Missing"],
          ["Timeline", license ? `${license.starts_on || "No start"} to ${license.expires_on || "No expiry"}` : "-"],
          ["Evaluators", license ? `${license.active_users ?? 0} / ${license.seats}` : "-"],
          ["SME / Evaluation Limit", license ? `${license.smes_used ?? 0} registered, ${license.evaluations_used ?? 0} completed / ${license.max_smes}` : "-"],
          ["Expires", license?.expires_on || "No expiry"],
        ].map(([label, value]) => (
          <div key={label} style={{ ...styles.innerStatCard, background: theme.bg, border: `1px solid ${theme.border}` }}>
            <div style={styles.innerStatLabel}>{label}</div>
            <div style={styles.innerStatValue}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ ...styles.subPanel, background: theme.bg, border: `1px solid ${theme.border}` }}>
        <h4 style={{ marginTop: 0, marginBottom: 14 }}>Recent Activity</h4>
        {auditLoading ? (
          <p style={{ color: theme.subText }}>Loading activity...</p>
        ) : auditLogs.length === 0 ? (
          <p style={{ color: theme.subText }}>No activity records available yet.</p>
        ) : (
          <div style={styles.auditLogList}>
            {auditLogs.map((item) => (
              <div key={item.id} style={{ ...styles.selectCard, background: theme.card, border: `1px solid ${theme.border}`, cursor: "default" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={styles.auditAction}>{item.action.replaceAll("_", " ")}</div>
                  <div style={{ fontSize: 13, color: theme.subText, marginTop: 4 }}>
                    {item.created_at} · Actor: {item.actor_username || "System"} · Target: {item.target_username || "-"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalysisTab(props) {
  const { theme, styles, analysisLoading } = props;
  return (
    <section>
      <div style={styles.sectionHeader}>
        <div>
          <h2 style={{ margin: 0 }}>Dashboard Analysis</h2>
          <p style={{ marginTop: 8, color: theme.subText }}>Evaluator and SME analysis for this bank.</p>
        </div>
      </div>
      {analysisLoading ? <p>Loading analysis...</p> : <><EvaluatorAnalysis {...props} /><SmeAnalysis {...props} /><ActivityAndExport {...props} /></>}
    </section>
  );
}
