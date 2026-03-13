import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function BankAdminDashboard() {
  const navigate = useNavigate();

  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  const [activeTab, setActiveTab] = useState("approval");
  const theme = dark ? darkTheme : lightTheme;

  const [pending, setPending] = useState([]);
  const [summary, setSummary] = useState(null);
  const [industryData, setIndustryData] = useState([]);
  const [evaluatorData, setEvaluatorData] = useState(null);
  const [criterionData, setCriterionData] = useState([]);
  const [smes, setSmes] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);

  const [selectedEvaluatorId, setSelectedEvaluatorId] = useState("");
  const [selectedEvaluatorData, setSelectedEvaluatorData] = useState(null);
  const [selectedEvaluatorLoading, setSelectedEvaluatorLoading] = useState(false);

  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedCriterion, setSelectedCriterion] = useState("");

  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // evaluator search + manage
  const [searchEvaluator, setSearchEvaluator] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    fetchPending();
    fetchAnalysisData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedIds.length >= 2) {
      fetchComparison(selectedIds);
    } else {
      setComparisonData([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds]);

  useEffect(() => {
    if (selectedEvaluatorId) {
      fetchEvaluatorDistribution(selectedEvaluatorId);
    } else {
      setSelectedEvaluatorData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEvaluatorId]);

  async function apiGet(url) {
    const token = localStorage.getItem("token");

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    let data = null;
    let text = "";

    try {
      data = await res.json();
    } catch {
      try {
        text = await res.text();
      } catch {
        text = "";
      }
    }

    if (!res.ok) {
      throw new Error(
        data?.detail ||
          data?.message ||
          data?.error ||
          text ||
          `Request failed with status ${res.status}`
      );
    }

    return data;
  }

  async function apiPost(url, body = {}) {
    const token = localStorage.getItem("token");

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data?.detail ||
          data?.message ||
          data?.error ||
          `Request failed with status ${res.status}`
      );
    }

    return data;
  }

  async function fetchPending() {
    try {
      setError("");
      setLoading(true);
      const data = await apiGet("/api/bank-admin/pending-evaluators/");
      setPending(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAnalysisData() {
    try {
      setError("");
      setAnalysisLoading(true);

      const [summaryRes, industryRes, evaluatorRes, criterionRes, smeRes] =
        await Promise.all([
          apiGet("/api/bank-admin/dashboard-summary/"),
          apiGet("/api/bank-admin/industry-analysis/"),
          apiGet("/api/bank-admin/evaluator-analysis/"),
          apiGet("/api/bank-admin/criterion-analysis/"),
          apiGet("/api/bank-admin/smes/"),
        ]);

      setSummary(summaryRes || null);
      setIndustryData(Array.isArray(industryRes) ? industryRes : []);
      setEvaluatorData(evaluatorRes || null);
      setCriterionData(Array.isArray(criterionRes) ? criterionRes : []);
      setSmes(Array.isArray(smeRes) ? smeRes : []);
    } catch (err) {
      setError(err.message || "Failed to load analysis.");
    } finally {
      setAnalysisLoading(false);
    }
  }

  async function fetchComparison(ids) {
    try {
      setError("");
      const query = ids.join(",");
      const data = await apiGet(`/api/bank-admin/sme-comparison/?ids=${query}`);
      setComparisonData(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load comparison.");
    }
  }

  async function fetchEvaluatorDistribution(evaluatorId) {
    try {
      setError("");
      setSelectedEvaluatorLoading(true);

      const data = await apiGet(
        `/api/bank-admin/evaluator-score-distribution/${evaluatorId}/`
      );

      setSelectedEvaluatorData(data || null);
    } catch (err) {
      setError(err.message || "Failed to load evaluator distribution.");
      setSelectedEvaluatorData(null);
    } finally {
      setSelectedEvaluatorLoading(false);
    }
  }

  async function approve(profileId) {
    try {
      setError("");
      setSuccessMsg("");
      setActionLoadingId(profileId);

      await apiPost(`/api/bank-admin/approve-evaluator/${profileId}/`);

      setSuccessMsg("Evaluator approved successfully.");
      fetchPending();
      fetchAnalysisData();
      if (searchEvaluator.trim()) {
        handleSearchEvaluator();
      }
    } catch (err) {
      setError(err.message || "Approval error.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function disapprove(profileId) {
    try {
      setError("");
      setSuccessMsg("");
      setActionLoadingId(profileId);

      await apiPost(`/api/bank-admin/disapprove-evaluator/${profileId}/`);

      setSuccessMsg("Evaluator disapproved and blocked successfully.");
      fetchPending();
      fetchAnalysisData();
      if (searchEvaluator.trim()) {
        handleSearchEvaluator();
      }
    } catch (err) {
      setError(err.message || "Disapproval error.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function blockEvaluator(profileId) {
    try {
      setError("");
      setSuccessMsg("");
      setActionLoadingId(profileId);

      await apiPost(`/api/bank-admin/block-evaluator/${profileId}/`);

      setSuccessMsg("Evaluator blocked successfully.");
      fetchPending();
      fetchAnalysisData();
      handleSearchEvaluator();
    } catch (err) {
      setError(err.message || "Block failed.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function unblockEvaluator(profileId) {
    try {
      setError("");
      setSuccessMsg("");
      setActionLoadingId(profileId);

      await apiPost(`/api/bank-admin/unblock-evaluator/${profileId}/`);

      setSuccessMsg("Evaluator unblocked successfully.");
      fetchPending();
      fetchAnalysisData();
      handleSearchEvaluator();
    } catch (err) {
      setError(err.message || "Unblock failed.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleSearchEvaluator() {
    try {
      setError("");
      setSuccessMsg("");
      setSearchLoading(true);

      if (!searchEvaluator.trim()) {
        setSearchResults([]);
        return;
      }

      const data = await apiGet(
        `/api/bank-admin/search-evaluators/?q=${encodeURIComponent(
          searchEvaluator.trim()
        )}`
      );

      setSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Search failed.");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }

  function toggleSme(id) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  function logout() {
    localStorage.clear();
    navigate("/");
  }

  function getBarHeight(value, max = 10) {
    const score = Number(value || 0);
    const top = Number(max || 10);
    if (top <= 0) return "6%";
    return `${Math.max((score / top) * 100, 6)}%`;
  }

  const selectedIndustryData = useMemo(() => {
    return industryData.find((item) => item.industry === selectedIndustry) || null;
  }, [industryData, selectedIndustry]);

  const selectedCriterionData = useMemo(() => {
    return (
      criterionData.find((item) => item.criterion_code === selectedCriterion) ||
      null
    );
  }, [criterionData, selectedCriterion]);

  const industryMaxScore = useMemo(() => {
    if (!selectedIndustryData?.smes?.length) return 10;
    const max = Math.max(
      ...selectedIndustryData.smes.map((s) => Number(s.total_score || 0))
    );
    return max || 10;
  }, [selectedIndustryData]);

  const criterionMaxScore = useMemo(() => {
    if (!selectedCriterionData?.scores?.length) return 10;
    const max = Math.max(
      ...selectedCriterionData.scores.map((s) => Number(s.score || 0))
    );
    return max || 10;
  }, [selectedCriterionData]);

  return (
    <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>
      <header
        style={{
          ...styles.navbar,
          background: theme.navBg,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div
          style={styles.brand}
          onClick={() => navigate("/bank-admin-dashboard")}
        >
          <img src={logo} alt="SME logo" style={styles.logoImg} />
          <div style={styles.brandTextWrap}>
            <div style={{ ...styles.brandTitle, color: theme.text }}>
              SME Scoring
            </div>
            <div style={{ ...styles.brandSub, color: theme.subText }}>
              Bank Admin Workspace
            </div>
          </div>
        </div>

        <div style={styles.tabWrap}>
          {["approval", "analysis"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tabBtn,
                background: activeTab === tab ? theme.tabActiveBg : "transparent",
                color: activeTab === tab ? theme.button : theme.text,
                border:
                  activeTab === tab
                    ? `1px solid ${theme.tabActiveBorder}`
                    : `1px solid transparent`,
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div style={styles.rightWrap}>
          <button
            onClick={() => setDark(!dark)}
            style={{
              ...styles.iconBtn,
              background: theme.card,
              border: `1px solid ${theme.border}`,
              color: theme.text,
            }}
          >
            {dark ? "Light" : "Dark"}
          </button>

          <button
            onClick={logout}
            style={{
              ...styles.iconBtn,
              background: theme.card,
              border: `1px solid ${theme.border}`,
              color: theme.text,
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {error && (
          <div
            style={{
              ...styles.messageBox,
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.35)",
              color: "#ef4444",
            }}
          >
            {error}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              ...styles.messageBox,
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.35)",
              color: "#22c55e",
            }}
          >
            {successMsg}
          </div>
        )}

        {activeTab === "approval" && (
          <section>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={{ margin: 0 }}>Evaluator Approval & Access Control</h2>
                <p style={{ marginTop: 8, color: theme.subText }}>
                  Approve, disapprove, search, and block evaluators from system access.
                </p>
              </div>
            </div>

            <div
              style={{
                ...styles.panel,
                background: theme.card,
                border: `1px solid ${theme.border}`,
                marginBottom: 24,
              }}
            >
              <div style={styles.panelHead}>
                <div>
                  <h3 style={{ margin: 0 }}>Pending Evaluator Accounts</h3>
                  <p style={{ ...styles.panelSub, color: theme.subText }}>
                    Approve new evaluator registrations or disapprove them to block access.
                  </p>
                </div>
              </div>

              {loading && <p>Loading...</p>}

              {!loading && pending.length === 0 && (
                <div
                  style={{
                    ...styles.emptyCard,
                    background: theme.bg,
                    border: `1px solid ${theme.border}`,
                    color: theme.subText,
                  }}
                >
                  No pending approvals.
                </div>
              )}

              <div style={styles.cardGrid}>
                {pending.map((p) => {
                  const profileId = p.id || p.profile_id;

                  return (
                    <div
                      key={profileId}
                      style={{
                        ...styles.card,
                        background: theme.bg,
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      <div style={styles.cardTop}>
                        <div>
                          <h3 style={{ margin: 0, color: theme.text }}>{p.username}</h3>
                          <p style={{ margin: "8px 0 6px", color: theme.subText }}>
                            Evaluator account waiting for approval
                          </p>
                          {p.bank_name && (
                            <p style={{ margin: 0, color: theme.subText, fontSize: 13 }}>
                              Bank: {p.bank_name}
                            </p>
                          )}
                        </div>
                      </div>

                      <div style={styles.actionRow}>
                        <button
                          onClick={() => approve(profileId)}
                          disabled={actionLoadingId === profileId}
                          style={styles.approveBtn}
                        >
                          {actionLoadingId === profileId ? "Please wait..." : "Approve"}
                        </button>

                        <button
                          onClick={() => disapprove(profileId)}
                          disabled={actionLoadingId === profileId}
                          style={styles.disapproveBtn}
                        >
                          {actionLoadingId === profileId
                            ? "Please wait..."
                            : "Disapprove"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                ...styles.panel,
                background: theme.card,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div style={styles.panelHead}>
                <div>
                  <h3 style={{ margin: 0 }}>Search and Manage Evaluators</h3>
                  <p style={{ ...styles.panelSub, color: theme.subText }}>
                    Search for any evaluator and block or unblock access to the system.
                  </p>
                </div>
              </div>

              <div style={styles.searchRow}>
                <input
                  type="text"
                  value={searchEvaluator}
                  onChange={(e) => setSearchEvaluator(e.target.value)}
                  placeholder="Search by evaluator username"
                  style={{
                    ...styles.searchInput,
                    background: theme.bg,
                    border: `1px solid ${theme.border}`,
                    color: theme.text,
                  }}
                />

                <button onClick={handleSearchEvaluator} style={styles.searchBtn}>
                  Search
                </button>
              </div>

              {searchLoading && (
                <p style={{ color: theme.subText, marginTop: 16 }}>
                  Searching evaluators...
                </p>
              )}

              {!searchLoading && searchEvaluator.trim() && searchResults.length === 0 && (
                <div
                  style={{
                    ...styles.emptyCard,
                    marginTop: 16,
                    background: theme.bg,
                    border: `1px solid ${theme.border}`,
                    color: theme.subText,
                  }}
                >
                  No evaluators found.
                </div>
              )}

              {searchResults.length > 0 && (
                <div style={styles.cardGrid}>
                  {searchResults.map((ev) => (
                    <div
                      key={ev.profile_id}
                      style={{
                        ...styles.card,
                        background: theme.bg,
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      <h3 style={{ marginTop: 0, marginBottom: 8 }}>{ev.username}</h3>

                      <div style={{ color: theme.subText, marginBottom: 6 }}>
                        Role: Evaluator
                      </div>
                      <div style={{ color: theme.subText, marginBottom: 6 }}>
                        Approval: {ev.is_approved ? "Approved" : "Not Approved"}
                      </div>
                      <div style={{ color: theme.subText, marginBottom: 14 }}>
                        Status: {ev.is_active ? "Active" : "Blocked"}
                      </div>

                      <div style={styles.actionRow}>
                        {ev.is_active ? (
                          <button
                            onClick={() => blockEvaluator(ev.profile_id)}
                            disabled={actionLoadingId === ev.profile_id}
                            style={styles.blockBtn}
                          >
                            {actionLoadingId === ev.profile_id
                              ? "Please wait..."
                              : "Block"}
                          </button>
                        ) : (
                          <button
                            onClick={() => unblockEvaluator(ev.profile_id)}
                            disabled={actionLoadingId === ev.profile_id}
                            style={styles.unblockBtn}
                          >
                            {actionLoadingId === ev.profile_id
                              ? "Please wait..."
                              : "Unblock"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "analysis" && (
          <section>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={{ margin: 0 }}>Dashboard Analysis</h2>
                <p style={{ marginTop: 8, color: theme.subText }}>
                  Evaluator and SME analysis for this bank.
                </p>
              </div>
            </div>

            {analysisLoading && <p>Loading analysis...</p>}

            {!analysisLoading && (
              <>
                <div
                  style={{
                    ...styles.panel,
                    background: theme.card,
                    border: `1px solid ${theme.border}`,
                    marginBottom: 24,
                  }}
                >
                  <div style={styles.panelHead}>
                    <div>
                      <h3 style={{ margin: 0 }}>Evaluator Analysis</h3>
                      <p style={{ ...styles.panelSub, color: theme.subText }}>
                        Evaluator counts, selected evaluator distribution, and total evaluations
                      </p>
                    </div>
                  </div>

                  {!evaluatorData ? (
                    <p style={{ color: theme.subText }}>
                      No evaluator analysis available.
                    </p>
                  ) : (
                    <>
                      <div style={styles.innerStatsGrid}>
                        <div
                          style={{
                            ...styles.innerStatCard,
                            background: theme.bg,
                            border: `1px solid ${theme.border}`,
                          }}
                        >
                          <div style={styles.innerStatLabel}>Approved</div>
                          <div style={styles.innerStatValue}>
                            {evaluatorData.approved_evaluators || 0}
                          </div>
                        </div>

                        <div
                          style={{
                            ...styles.innerStatCard,
                            background: theme.bg,
                            border: `1px solid ${theme.border}`,
                          }}
                        >
                          <div style={styles.innerStatLabel}>Pending</div>
                          <div style={styles.innerStatValue}>
                            {evaluatorData.pending_evaluators || 0}
                          </div>
                        </div>

                        <div
                          style={{
                            ...styles.innerStatCard,
                            background: theme.bg,
                            border: `1px solid ${theme.border}`,
                          }}
                        >
                          <div style={styles.innerStatLabel}>Total</div>
                          <div style={styles.innerStatValue}>
                            {evaluatorData.total_evaluators || 0}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          ...styles.subPanel,
                          background: theme.bg,
                          border: `1px solid ${theme.border}`,
                          marginTop: 20,
                        }}
                      >
                        <h4 style={{ marginTop: 0, marginBottom: 14 }}>
                          Select Evaluator
                        </h4>

                        <select
                          value={selectedEvaluatorId}
                          onChange={(e) => setSelectedEvaluatorId(e.target.value)}
                          style={{
                            ...styles.selectInput,
                            background: theme.card,
                            border: `1px solid ${theme.border}`,
                            color: theme.text,
                          }}
                        >
                          <option value="">Choose evaluator</option>
                          {(evaluatorData.evaluators || []).map((ev) => (
                            <option key={ev.evaluator_id} value={ev.evaluator_id}>
                              {ev.username}
                            </option>
                          ))}
                        </select>

                        {!selectedEvaluatorId && (
                          <div style={{ marginTop: 18, color: theme.subText }}>
                            Select an evaluator to display the score distribution chart.
                          </div>
                        )}

                        {selectedEvaluatorLoading && (
                          <p style={{ color: theme.subText, marginTop: 16 }}>
                            Loading evaluator details...
                          </p>
                        )}

                        {selectedEvaluatorData && !selectedEvaluatorLoading && (
                          <div style={{ marginTop: 18 }}>
                            <div style={styles.selectedEvalGrid}>
                              <div
                                style={{
                                  ...styles.selectedEvalCard,
                                  background: theme.card,
                                  border: `1px solid ${theme.border}`,
                                }}
                              >
                                <div style={styles.selectedEvalLabel}>Evaluator</div>
                                <div style={styles.selectedEvalValueSmall}>
                                  {selectedEvaluatorData.username}
                                </div>
                              </div>

                              <div
                                style={{
                                  ...styles.selectedEvalCard,
                                  background: theme.card,
                                  border: `1px solid ${theme.border}`,
                                }}
                              >
                                <div style={styles.selectedEvalLabel}>Average</div>
                                <div style={styles.selectedEvalValue}>
                                  {selectedEvaluatorData.average_score}
                                </div>
                              </div>

                              <div
                                style={{
                                  ...styles.selectedEvalCard,
                                  background: theme.card,
                                  border: `1px solid ${theme.border}`,
                                }}
                              >
                                <div style={styles.selectedEvalLabel}>Highest</div>
                                <div style={styles.selectedEvalValue}>
                                  {selectedEvaluatorData.highest_score}
                                </div>
                              </div>

                              <div
                                style={{
                                  ...styles.selectedEvalCard,
                                  background: theme.card,
                                  border: `1px solid ${theme.border}`,
                                }}
                              >
                                <div style={styles.selectedEvalLabel}>Lowest</div>
                                <div style={styles.selectedEvalValue}>
                                  {selectedEvaluatorData.lowest_score}
                                </div>
                              </div>
                            </div>

                            <div
                              style={{
                                ...styles.subPanel,
                                background: theme.card,
                                border: `1px solid ${theme.border}`,
                                marginTop: 18,
                              }}
                            >
                              <h4 style={{ marginTop: 0, marginBottom: 14 }}>
                                Evaluator Score Distribution
                              </h4>

                              {!Array.isArray(selectedEvaluatorData.smes) ||
                              selectedEvaluatorData.smes.length === 0 ? (
                                <p style={{ color: theme.subText }}>
                                  No SME scoring records found for this evaluator.
                                </p>
                              ) : (
                                <>
                                  <div style={styles.chartWrap}>
                                    {selectedEvaluatorData.smes.map((sme) => (
                                      <div key={sme.sme_id} style={styles.chartCol}>
                                        <div
                                          style={{
                                            color: theme.text,
                                            fontSize: 12,
                                            fontWeight: 700,
                                          }}
                                        >
                                          {sme.total_score}
                                        </div>

                                        <div
                                          style={{
                                            ...styles.chartBarArea,
                                            background: dark
                                              ? "rgba(255,255,255,0.05)"
                                              : "rgba(11,18,32,0.05)",
                                            border: `1px solid ${theme.border}`,
                                          }}
                                        >
                                          <div
                                            style={{
                                              ...styles.chartBar,
                                              height: getBarHeight(sme.total_score),
                                              background: theme.button,
                                            }}
                                          />
                                        </div>

                                        <div
                                          style={{
                                            ...styles.chartLabel,
                                            color: theme.subText,
                                          }}
                                          title={`${sme.sme_name} (${sme.br_number})`}
                                        >
                                          {sme.br_number}
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div
                                    style={{
                                      ...styles.evaluationCountCard,
                                      background: theme.bg,
                                      border: `1px solid ${theme.border}`,
                                      color: theme.text,
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: 13,
                                        color: theme.subText,
                                        marginBottom: 6,
                                      }}
                                    >
                                      Number of evaluations done by this evaluator
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 28,
                                        fontWeight: 800,
                                      }}
                                    >
                                      {selectedEvaluatorData.total_scored}
                                    </div>
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

                <div
                  style={{
                    ...styles.panel,
                    background: theme.card,
                    border: `1px solid ${theme.border}`,
                    marginBottom: 24,
                  }}
                >
                  <div style={styles.panelHead}>
                    <div>
                      <h3 style={{ margin: 0 }}>SME Analysis</h3>
                      <p style={{ ...styles.panelSub, color: theme.subText }}>
                        Industry, criterion, and SME comparison insights
                      </p>
                    </div>
                  </div>

                  <div style={styles.innerStatsGrid}>
                    <div
                      style={{
                        ...styles.innerStatCard,
                        background: theme.bg,
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      <div style={styles.innerStatLabel}>Total SMEs</div>
                      <div style={styles.innerStatValue}>
                        {summary?.total_smes || 0}
                      </div>
                    </div>

                    <div
                      style={{
                        ...styles.innerStatCard,
                        background: theme.bg,
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      <div style={styles.innerStatLabel}>Scored SMEs</div>
                      <div style={styles.innerStatValue}>
                        {summary?.scored_smes || 0}
                      </div>
                    </div>

                    <div
                      style={{
                        ...styles.innerStatCard,
                        background: theme.bg,
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      <div style={styles.innerStatLabel}>Pending SMEs</div>
                      <div style={styles.innerStatValue}>
                        {summary?.pending_smes || 0}
                      </div>
                    </div>
                  </div>

                  <div style={styles.analysisGrid}>
                    <div
                      style={{
                        ...styles.subPanel,
                        background: theme.bg,
                        border: `1px solid ${theme.border}`,
                        marginTop: 20,
                      }}
                    >
                      <h4 style={{ marginTop: 0, marginBottom: 14 }}>Industry Analysis</h4>

                      <select
                        value={selectedIndustry}
                        onChange={(e) => setSelectedIndustry(e.target.value)}
                        style={{
                          ...styles.selectInput,
                          background: theme.card,
                          border: `1px solid ${theme.border}`,
                          color: theme.text,
                          marginBottom: 16,
                        }}
                      >
                        <option value="">Choose industry</option>
                        {industryData.map((row, index) => (
                          <option key={`${row.industry}-${index}`} value={row.industry}>
                            {row.industry}
                          </option>
                        ))}
                      </select>

                      {!selectedIndustryData ? (
                        <p style={{ color: theme.subText }}>
                          Select an industry to view score distribution and statistics.
                        </p>
                      ) : (
                        <>
                          <div style={styles.selectedEvalGrid}>
                            <div
                              style={{
                                ...styles.selectedEvalCard,
                                background: theme.card,
                                border: `1px solid ${theme.border}`,
                              }}
                            >
                              <div style={styles.selectedEvalLabel}>Industry</div>
                              <div style={styles.selectedEvalValueSmall}>
                                {selectedIndustryData.industry}
                              </div>
                            </div>

                            <div
                              style={{
                                ...styles.selectedEvalCard,
                                background: theme.card,
                                border: `1px solid ${theme.border}`,
                              }}
                            >
                              <div style={styles.selectedEvalLabel}>Average</div>
                              <div style={styles.selectedEvalValue}>
                                {selectedIndustryData.average_score}
                              </div>
                            </div>

                            <div
                              style={{
                                ...styles.selectedEvalCard,
                                background: theme.card,
                                border: `1px solid ${theme.border}`,
                              }}
                            >
                              <div style={styles.selectedEvalLabel}>Highest</div>
                              <div style={styles.selectedEvalValue}>
                                {selectedIndustryData.highest_score}
                              </div>
                              <div style={{ fontSize: 12, color: theme.subText, marginTop: 6 }}>
                                BR: {selectedIndustryData.highest_sme_br || "-"}
                              </div>
                            </div>

                            <div
                              style={{
                                ...styles.selectedEvalCard,
                                background: theme.card,
                                border: `1px solid ${theme.border}`,
                              }}
                            >
                              <div style={styles.selectedEvalLabel}>Lowest</div>
                              <div style={styles.selectedEvalValue}>
                                {selectedIndustryData.lowest_score}
                              </div>
                              <div style={{ fontSize: 12, color: theme.subText, marginTop: 6 }}>
                                BR: {selectedIndustryData.lowest_sme_br || "-"}
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              ...styles.subPanel,
                              background: theme.card,
                              border: `1px solid ${theme.border}`,
                              marginTop: 18,
                            }}
                          >
                            <h4 style={{ marginTop: 0, marginBottom: 14 }}>
                              Industry Score Distribution
                            </h4>

                            {!Array.isArray(selectedIndustryData.smes) ||
                            selectedIndustryData.smes.length === 0 ? (
                              <p style={{ color: theme.subText }}>
                                No scored SMEs available for this industry.
                              </p>
                            ) : (
                              <div style={styles.chartWrap}>
                                {selectedIndustryData.smes.map((sme) => (
                                  <div key={sme.id} style={styles.chartCol}>
                                    <div
                                      style={{
                                        color: theme.text,
                                        fontSize: 12,
                                        fontWeight: 700,
                                      }}
                                    >
                                      {sme.total_score}
                                    </div>

                                    <div
                                      style={{
                                        ...styles.chartBarArea,
                                        background: dark
                                          ? "rgba(255,255,255,0.05)"
                                          : "rgba(11,18,32,0.05)",
                                        border: `1px solid ${theme.border}`,
                                      }}
                                    >
                                      <div
                                        style={{
                                          ...styles.chartBar,
                                          height: getBarHeight(
                                            sme.total_score,
                                            industryMaxScore
                                          ),
                                          background: theme.button,
                                        }}
                                      />
                                    </div>

                                    <div
                                      style={{
                                        ...styles.chartLabel,
                                        color: theme.subText,
                                      }}
                                      title={`${sme.name} (${sme.br_number})`}
                                    >
                                      {sme.br_number}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      ...styles.subPanel,
                      background: theme.bg,
                      border: `1px solid ${theme.border}`,
                      marginTop: 20,
                    }}
                  >
                    <h4 style={{ marginTop: 0 }}>SME Comparison Tool</h4>
                    <p style={{ color: theme.subText, marginTop: 6 }}>
                      Select 2 or 3 SMEs to compare their total and criterion-level scores.
                    </p>

                    <div style={styles.smeSelectGrid}>
                      {smes.map((sme) => (
                        <label
                          key={sme.id}
                          style={{
                            ...styles.selectCard,
                            background: selectedIds.includes(sme.id)
                              ? theme.tabActiveBg
                              : theme.card,
                            border: `1px solid ${
                              selectedIds.includes(sme.id)
                                ? theme.tabActiveBorder
                                : theme.border
                            }`,
                            color: theme.text,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(sme.id)}
                            onChange={() => toggleSme(sme.id)}
                          />
                          <div>
                            <div style={{ fontWeight: 700 }}>{sme.name}</div>
                            <div style={{ fontSize: 13, color: theme.subText }}>
                              BR: {sme.br_number}
                            </div>
                            <div style={{ fontSize: 13, color: theme.subText }}>
                              Industry: {sme.industry}
                            </div>
                            <div style={{ fontSize: 13, color: theme.subText }}>
                              Score: {sme.total_score}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>

                    {comparisonData.length > 0 && (
                      <div style={{ marginTop: 24 }}>
                        <h4 style={{ marginBottom: 14 }}>Comparison Result</h4>
                        <div style={styles.cardGrid}>
                          {comparisonData.map((item) => (
                            <div
                              key={item.id}
                              style={{
                                ...styles.card,
                                background: theme.card,
                                border: `1px solid ${theme.border}`,
                              }}
                            >
                              <h3 style={{ marginTop: 0 }}>{item.name}</h3>
                              <div style={{ color: theme.subText, marginBottom: 6 }}>
                                BR: {item.br_number}
                              </div>
                              <div style={{ color: theme.subText, marginBottom: 6 }}>
                                Industry: {item.industry}
                              </div>
                              <div style={{ fontWeight: 700, marginBottom: 14 }}>
                                Total Score: {item.total_score}
                              </div>

                              <div
                                style={{
                                  fontSize: 14,
                                  fontWeight: 700,
                                  marginBottom: 10,
                                }}
                              >
                                Criteria
                              </div>

                              {Object.keys(item.criteria || {}).length === 0 ? (
                                <div style={{ color: theme.subText }}>
                                  No criterion scores available.
                                </div>
                              ) : (
                                Object.entries(item.criteria).map(([code, score]) => (
                                  <div key={code} style={styles.criteriaRow}>
                                    <span>{code}</span>
                                    <strong>{score}</strong>
                                  </div>
                                ))
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

const lightTheme = {
  bg: "#f4f9ff",
  navBg: "rgba(255,255,255,0.9)",
  text: "#0b1220",
  subText: "#5b6472",
  card: "#ffffff",
  border: "rgba(11,18,32,0.12)",
  button: "#2F96B4",
  tabActiveBg: "rgba(47,150,180,0.10)",
  tabActiveBorder: "rgba(47,150,180,0.28)",
};

const darkTheme = {
  bg: "#071423",
  navBg: "rgba(7,20,35,0.92)",
  text: "#ffffff",
  subText: "rgba(255,255,255,0.72)",
  card: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.15)",
  button: "#67d4f3",
  tabActiveBg: "rgba(103,212,243,0.10)",
  tabActiveBorder: "rgba(103,212,243,0.30)",
};

const styles = {
  page: {
    minHeight: "100vh",
  },
  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    padding: "14px 28px",
    backdropFilter: "blur(12px)",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
    minWidth: 220,
  },
  logoImg: {
    width: 108,
    height: 58,
    objectFit: "contain",
    display: "block",
  },
  brandTextWrap: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    lineHeight: 1.1,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: "-0.3px",
    marginBottom: 3,
  },
  brandSub: {
    fontSize: 12,
    fontWeight: 500,
    marginTop: 4,
  },
  tabWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
    flex: 1,
  },
  tabBtn: {
    padding: "10px 18px",
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    transition: "0.2s ease",
  },
  rightWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minWidth: 220,
    justifyContent: "flex-end",
  },
  iconBtn: {
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },
  main: {
    padding: "34px 6%",
  },
  messageBox: {
    marginBottom: 16,
    padding: "12px 14px",
    borderRadius: 12,
    fontWeight: 600,
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  analysisGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 20,
  },
  panel: {
    padding: 22,
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  panelHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  panelSub: {
    margin: "6px 0 0",
    fontSize: 13,
  },
  innerStatsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 14,
    marginTop: 6,
  },
  innerStatCard: {
    padding: 16,
    borderRadius: 14,
    textAlign: "center",
  },
  innerStatLabel: {
    fontSize: 12,
    marginBottom: 8,
    opacity: 0.8,
  },
  innerStatValue: {
    fontSize: 24,
    fontWeight: 800,
  },
  subPanel: {
    padding: 18,
    borderRadius: 16,
  },
  selectInput: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    outline: "none",
  },
  selectedEvalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 12,
  },
  selectedEvalCard: {
    padding: 14,
    borderRadius: 14,
  },
  selectedEvalLabel: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 8,
  },
  selectedEvalValue: {
    fontSize: 24,
    fontWeight: 800,
  },
  selectedEvalValueSmall: {
    fontSize: 18,
    fontWeight: 800,
    lineHeight: 1.3,
  },
  chartWrap: {
    display: "flex",
    alignItems: "flex-end",
    gap: 14,
    overflowX: "auto",
    paddingBottom: 12,
    paddingTop: 8,
    minHeight: 280,
  },
  chartCol: {
    minWidth: 90,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  chartBarArea: {
    width: 54,
    height: 200,
    borderRadius: 14,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    padding: 6,
  },
  chartBar: {
    width: "100%",
    borderRadius: 10,
    transition: "0.3s ease",
  },
  chartLabel: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 1.3,
    maxWidth: 88,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  evaluationCountCard: {
    marginTop: 22,
    padding: 18,
    borderRadius: 14,
    textAlign: "center",
  },
  smeSelectGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 14,
    marginTop: 16,
  },
  selectCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    cursor: "pointer",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 20,
    marginTop: 20,
  },
  card: {
    padding: 22,
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  actionRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 18,
  },
  approveBtn: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "none",
    background: "#22c55e",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
  disapproveBtn: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "none",
    background: "#ef4444",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
  blockBtn: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "none",
    background: "#ef4444",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
  unblockBtn: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "none",
    background: "#2F96B4",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
  searchRow: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
  searchInput: {
    flex: 1,
    minWidth: 260,
    padding: "12px 14px",
    borderRadius: 12,
    outline: "none",
  },
  searchBtn: {
    padding: "12px 18px",
    borderRadius: 12,
    border: "none",
    background: "#2F96B4",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
  emptyCard: {
    marginTop: 20,
    padding: 24,
    borderRadius: 16,
  },
  criteriaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid rgba(148,163,184,0.16)",
  },
};