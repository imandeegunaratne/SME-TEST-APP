import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const BRAND = "#2F96B4";
const SUCCESS = "#22c55e";
const DANGER = "#ef4444";

export default function BankAdminDashboard() {
  const navigate = useNavigate();

  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  const theme = dark ? darkTheme : lightTheme;

  const [activeTab, setActiveTab] = useState("approval");

  const [pending, setPending] = useState([]);
  const [smes, setSmes] = useState([]);
  const [evaluators, setEvaluators] = useState([]);

  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingSmes, setLoadingSmes] = useState(true);
  const [error, setError] = useState("");

  const [selectedEvaluator, setSelectedEvaluator] = useState("ALL");
  const [evaluatorPeriod, setEvaluatorPeriod] = useState("month");

  const [industrySort, setIndustrySort] = useState("desc");
  const [highSort, setHighSort] = useState("desc");
  const [lowSort, setLowSort] = useState("asc");
  const [displayCount, setDisplayCount] = useState(5);

  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    fetchPending();
    fetchSMEs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPending() {
    try {
      setError("");
      setLoadingPending(true);

      const token = localStorage.getItem("token");

      const res = await fetch("/api/bank-admin/pending-evaluators/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      const data = await res.json().catch(() => []);
      if (!res.ok) {
        throw new Error(data.detail || "Failed to fetch pending evaluators.");
      }

      setPending(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Something went wrong while loading evaluators.");
    } finally {
      setLoadingPending(false);
    }
  }

  async function fetchSMEs() {
    try {
      setError("");
      setLoadingSmes(true);

      const token = localStorage.getItem("token");

      const res = await fetch("/api/smes/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      const data = await res.json().catch(() => []);
      if (!res.ok) {
        throw new Error(data.detail || "Failed to fetch SMEs.");
      }

      const rows = Array.isArray(data) ? data : [];
      setSmes(rows);

      const uniqueEvaluators = Array.from(
        new Set(
          rows
            .map((item) => getEvaluatorName(item))
            .filter((name) => name && name !== "Unassigned")
        )
      ).sort((a, b) => a.localeCompare(b));

      setEvaluators(uniqueEvaluators);
    } catch (err) {
      setError(err.message || "Something went wrong while loading SME data.");
    } finally {
      setLoadingSmes(false);
    }
  }

  async function approve(profileId) {
    try {
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch(`/api/bank-admin/approve-evaluator/${profileId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Approval failed.");

      fetchPending();
    } catch (err) {
      setError(err.message || "Approval error.");
    }
  }

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  const scoredSMEs = useMemo(() => {
    return smes.filter(
      (s) =>
        s.total_score !== null &&
        s.total_score !== undefined &&
        !Number.isNaN(Number(s.total_score))
    );
  }, [smes]);

  const evaluatorAnalytics = useMemo(() => {
    const now = new Date();

    const filteredByPeriod = scoredSMEs.filter((s) => {
      const date = getRecordDate(s);
      if (!date) return false;

      const diff = now.getTime() - date.getTime();
      const dayMs = 1000 * 60 * 60 * 24;

      if (evaluatorPeriod === "week") return diff <= 7 * dayMs;
      if (evaluatorPeriod === "month") return diff <= 30 * dayMs;
      if (evaluatorPeriod === "year") return diff <= 365 * dayMs;
      return true;
    });

    const evaluatorFiltered =
      selectedEvaluator === "ALL"
        ? filteredByPeriod
        : filteredByPeriod.filter(
            (s) => getEvaluatorName(s) === selectedEvaluator
          );

    const evaluatorCountMap = {};
    const evaluatorScoreBuckets = {
      "0-25": 0,
      "26-50": 0,
      "51-75": 0,
      "76-100": 0,
    };
    const dailyMap = {};

    for (const record of filteredByPeriod) {
      const name = getEvaluatorName(record);
      evaluatorCountMap[name] = (evaluatorCountMap[name] || 0) + 1;
    }

    for (const record of evaluatorFiltered) {
      const score = Number(record.total_score || 0);
      const date = getRecordDate(record);

      if (score <= 25) evaluatorScoreBuckets["0-25"] += 1;
      else if (score <= 50) evaluatorScoreBuckets["26-50"] += 1;
      else if (score <= 75) evaluatorScoreBuckets["51-75"] += 1;
      else evaluatorScoreBuckets["76-100"] += 1;

      if (date) {
        const key = formatDateKey(date);
        dailyMap[key] = (dailyMap[key] || 0) + 1;
      }
    }

    const evaluatorSummary = Object.entries(evaluatorCountMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const dailyEvaluations = Object.entries(dailyMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      totalEvaluators: evaluators.length,
      evaluatorSummary,
      evaluatorScoreBuckets,
      dailyEvaluations,
      totalForSelected: evaluatorFiltered.length,
    };
  }, [scoredSMEs, evaluatorPeriod, selectedEvaluator, evaluators]);

  const smeAnalytics = useMemo(() => {
    const totalRegistered = smes.length;

    const industryMap = {};

    for (const s of scoredSMEs) {
      const industry = s.industry || "Unknown";

      if (!industryMap[industry]) {
        industryMap[industry] = {
          name: industry,
          count: 0,
          totalScore: 0,
        };
      }

      industryMap[industry].count += 1;
      industryMap[industry].totalScore += Number(s.total_score || 0);
    }

    let industryDistribution = Object.values(industryMap).map((item) => ({
      ...item,
      avgScore: item.count > 0 ? item.totalScore / item.count : 0,
    }));

    industryDistribution.sort((a, b) =>
      industrySort === "asc" ? a.avgScore - b.avgScore : b.avgScore - a.avgScore
    );

    const sortedHigh = [...scoredSMEs].sort((a, b) =>
      highSort === "asc"
        ? Number(a.total_score || 0) - Number(b.total_score || 0)
        : Number(b.total_score || 0) - Number(a.total_score || 0)
    );

    const sortedLow = [...scoredSMEs].sort((a, b) =>
      lowSort === "asc"
        ? Number(a.total_score || 0) - Number(b.total_score || 0)
        : Number(b.total_score || 0) - Number(a.total_score || 0)
    );

    return {
      totalRegistered,
      industryDistribution,
      highestSMEs: sortedHigh.slice(0, displayCount),
      lowestSMEs: sortedLow.slice(0, displayCount),
    };
  }, [smes, scoredSMEs, industrySort, highSort, lowSort, displayCount]);

  const adminName = localStorage.getItem("username") || "Bank Admin";
  const adminRole = localStorage.getItem("role") || "BANK_ADMIN";

  return (
    <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>
      {/* NAVBAR */}
      <div
        style={{
          ...styles.navbar,
          background: theme.navbar,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div style={styles.brandArea}>
          <div
            style={{
              ...styles.logoBox,
              background: BRAND,
              color: "#fff",
            }}
          >
            SME
          </div>

          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>
              SME Scoring
            </h1>
            <p style={{ margin: "4px 0 0", color: theme.muted, fontWeight: 600 }}>
              Bank Admin Workspace
            </p>
          </div>
        </div>

        <div style={styles.centerNav}>
          <button
            onClick={() => setActiveTab("approval")}
            style={{
              ...styles.navBtn,
              ...(activeTab === "approval"
                ? {
                    background: theme.activeTab,
                    color: BRAND,
                    border: `1px solid ${theme.activeBorder}`,
                  }
                : {
                    background: "transparent",
                    color: theme.text,
                    border: "1px solid transparent",
                  }),
            }}
          >
            Approval
          </button>

          <button
            onClick={() => setActiveTab("analysis")}
            style={{
              ...styles.navBtn,
              ...(activeTab === "analysis"
                ? {
                    background: theme.activeTab,
                    color: BRAND,
                    border: `1px solid ${theme.activeBorder}`,
                  }
                : {
                    background: "transparent",
                    color: theme.text,
                    border: "1px solid transparent",
                  }),
            }}
          >
            Analysis
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            style={{
              ...styles.navBtn,
              ...(activeTab === "profile"
                ? {
                    background: theme.activeTab,
                    color: BRAND,
                    border: `1px solid ${theme.activeBorder}`,
                  }
                : {
                    background: "transparent",
                    color: theme.text,
                    border: "1px solid transparent",
                  }),
            }}
          >
            Profile
          </button>
        </div>

        <div style={styles.rightNav}>
          <button
            onClick={() => setDark(!dark)}
            style={{
              ...styles.iconBtn,
              background: theme.card,
              color: theme.text,
              border: `1px solid ${theme.border}`,
            }}
          >
            {dark ? "☀" : "🌙"}
          </button>

          <div
            style={{
              ...styles.avatar,
              background: BRAND,
              color: "#fff",
            }}
          >
            {adminName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <div style={styles.content}>
        {error && (
          <div
            style={{
              marginBottom: 20,
              padding: 12,
              borderRadius: 10,
              background: "rgba(239,68,68,0.12)",
              color: DANGER,
              border: `1px solid rgba(239,68,68,0.25)`,
            }}
          >
            {error}
          </div>
        )}

        {/* APPROVAL TAB */}
        {activeTab === "approval" && (
          <div
            style={{
              ...styles.mainSection,
              background: theme.card,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div style={styles.sectionHeader}>
              <div>
                <h3 style={styles.mainTitle}>Evaluator Approval</h3>
                <p style={{ margin: "6px 0 0", color: theme.muted }}>
                  Approve new evaluators before they access the system
                </p>
              </div>
            </div>

            <div style={styles.statsGrid}>
              <StatCard
                theme={theme}
                title="Pending Approvals"
                value={loadingPending ? "..." : pending.length}
              />
              <StatCard
                theme={theme}
                title="Total Evaluators"
                value={loadingSmes ? "..." : evaluatorAnalytics.totalEvaluators}
              />
            </div>

            <div
              style={{
                ...styles.panel,
                background: theme.softCard,
                border: `1px solid ${theme.border}`,
                marginTop: 24,
              }}
            >
              <h4 style={styles.panelTitle}>Pending Evaluator Requests</h4>

              {loadingPending ? (
                <p>Loading pending evaluators...</p>
              ) : pending.length === 0 ? (
                <p style={{ color: theme.muted }}>No pending approvals.</p>
              ) : (
                <div style={{ display: "grid", gap: 14 }}>
                  {pending.map((p) => (
                    <div
                      key={p.profile_id}
                      style={{
                        padding: 16,
                        borderRadius: 14,
                        border: `1px solid ${theme.border}`,
                        background: theme.card,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 16 }}>
                          {p.username}
                        </div>
                        <div style={{ fontSize: 13, color: theme.muted, marginTop: 4 }}>
                          Waiting for bank admin approval
                        </div>
                      </div>

                      <button
                        onClick={() => approve(p.profile_id)}
                        style={styles.approveBtn}
                      >
                        Approve Evaluator
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ANALYSIS TAB */}
        {activeTab === "analysis" && (
          <>
            <div
              style={{
                ...styles.mainSection,
                background: theme.card,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div style={styles.sectionHeader}>
                <div>
                  <h3 style={styles.mainTitle}>Evaluator Analysis</h3>
                  <p style={{ margin: "6px 0 0", color: theme.muted }}>
                    Evaluator performance, score distribution, and daily evaluation count
                  </p>
                </div>

                <div style={styles.filterRow}>
                  <select
                    value={selectedEvaluator}
                    onChange={(e) => setSelectedEvaluator(e.target.value)}
                    style={{
                      ...styles.select,
                      background: theme.softCard,
                      color: theme.text,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <option value="ALL">All Evaluators</option>
                    {evaluators.map((ev) => (
                      <option key={ev} value={ev}>
                        {ev}
                      </option>
                    ))}
                  </select>

                  <select
                    value={evaluatorPeriod}
                    onChange={(e) => setEvaluatorPeriod(e.target.value)}
                    style={{
                      ...styles.select,
                      background: theme.softCard,
                      color: theme.text,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                  </select>
                </div>
              </div>

              <div style={styles.statsGrid}>
                <StatCard
                  theme={theme}
                  title="Total Evaluators"
                  value={loadingSmes ? "..." : evaluatorAnalytics.totalEvaluators}
                />
                <StatCard
                  theme={theme}
                  title="Evaluations in Selected Range"
                  value={loadingSmes ? "..." : evaluatorAnalytics.totalForSelected}
                />
                <StatCard
                  theme={theme}
                  title="Selected Evaluator"
                  value={selectedEvaluator === "ALL" ? "All" : selectedEvaluator}
                />
                <StatCard
                  theme={theme}
                  title="Selected Period"
                  value={capitalize(evaluatorPeriod)}
                />
              </div>

              <div style={styles.sectionGrid}>
                <div
                  style={{
                    ...styles.panel,
                    background: theme.softCard,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <h4 style={styles.panelTitle}>Evaluation Count by Evaluator</h4>

                  {loadingSmes ? (
                    <p>Loading evaluator analytics...</p>
                  ) : evaluatorAnalytics.evaluatorSummary.length === 0 ? (
                    <p style={{ color: theme.muted }}>No evaluation data available.</p>
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {evaluatorAnalytics.evaluatorSummary.map((item) => (
                        <BarRow
                          key={item.name}
                          label={item.name}
                          value={item.count}
                          maxValue={
                            evaluatorAnalytics.evaluatorSummary[0]?.count || 1
                          }
                          theme={theme}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    ...styles.panel,
                    background: theme.softCard,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <h4 style={styles.panelTitle}>
                    Selected Evaluator Score Distribution
                  </h4>

                  {loadingSmes ? (
                    <p>Loading score distribution...</p>
                  ) : (
                    <div style={{ display: "grid", gap: 12 }}>
                      {Object.entries(evaluatorAnalytics.evaluatorScoreBuckets).map(
                        ([label, value]) => (
                          <BarRow
                            key={label}
                            label={label}
                            value={value}
                            maxValue={Math.max(
                              ...Object.values(
                                evaluatorAnalytics.evaluatorScoreBuckets
                              ),
                              1
                            )}
                            theme={theme}
                          />
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  ...styles.panel,
                  background: theme.softCard,
                  border: `1px solid ${theme.border}`,
                  marginTop: 24,
                }}
              >
                <h4 style={styles.panelTitle}>Evaluations Done by Each Day</h4>

                {loadingSmes ? (
                  <p>Loading daily evaluation data...</p>
                ) : evaluatorAnalytics.dailyEvaluations.length === 0 ? (
                  <p style={{ color: theme.muted }}>No daily data available.</p>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={{ ...styles.th, color: theme.text }}>Date</th>
                          <th style={{ ...styles.th, color: theme.text }}>
                            Number of Evaluations
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {evaluatorAnalytics.dailyEvaluations.map((item) => (
                          <tr key={item.date}>
                            <td style={{ ...styles.td, color: theme.text }}>
                              {item.date}
                            </td>
                            <td style={{ ...styles.td, color: theme.text }}>
                              {item.count}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                ...styles.mainSection,
                background: theme.card,
                border: `1px solid ${theme.border}`,
                marginTop: 24,
              }}
            >
              <div style={styles.sectionHeader}>
                <div>
                  <h3 style={styles.mainTitle}>SME Analysis</h3>
                  <p style={{ margin: "6px 0 0", color: theme.muted }}>
                    SME registrations, industry score distribution, and highest / lowest scored SMEs
                  </p>
                </div>

                <div style={styles.filterRow}>
                  <select
                    value={industrySort}
                    onChange={(e) => setIndustrySort(e.target.value)}
                    style={{
                      ...styles.select,
                      background: theme.softCard,
                      color: theme.text,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <option value="desc">Industry Avg Score: Descending</option>
                    <option value="asc">Industry Avg Score: Ascending</option>
                  </select>

                  <select
                    value={displayCount}
                    onChange={(e) => setDisplayCount(Number(e.target.value))}
                    style={{
                      ...styles.select,
                      background: theme.softCard,
                      color: theme.text,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <option value={5}>Show 5</option>
                    <option value={10}>Show 10</option>
                    <option value={15}>Show 15</option>
                  </select>
                </div>
              </div>

              <div style={styles.statsGrid}>
                <StatCard
                  theme={theme}
                  title="Total Registered SMEs"
                  value={loadingSmes ? "..." : smeAnalytics.totalRegistered}
                />
                <StatCard
                  theme={theme}
                  title="Scored SMEs"
                  value={loadingSmes ? "..." : scoredSMEs.length}
                />
                <StatCard
                  theme={theme}
                  title="Industries with Scores"
                  value={loadingSmes ? "..." : smeAnalytics.industryDistribution.length}
                />
                <StatCard theme={theme} title="Display Count" value={displayCount} />
              </div>

              <div
                style={{
                  ...styles.panel,
                  background: theme.softCard,
                  border: `1px solid ${theme.border}`,
                  marginTop: 24,
                }}
              >
                <h4 style={styles.panelTitle}>Score Distribution by Industry</h4>

                {loadingSmes ? (
                  <p>Loading industry data...</p>
                ) : smeAnalytics.industryDistribution.length === 0 ? (
                  <p style={{ color: theme.muted }}>No scored SME data available.</p>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={{ ...styles.th, color: theme.text }}>Industry</th>
                          <th style={{ ...styles.th, color: theme.text }}>
                            Scored SMEs
                          </th>
                          <th style={{ ...styles.th, color: theme.text }}>
                            Average Score
                          </th>
                          <th style={{ ...styles.th, color: theme.text }}>Insight</th>
                        </tr>
                      </thead>
                      <tbody>
                        {smeAnalytics.industryDistribution.map((item) => (
                          <tr key={item.name}>
                            <td style={{ ...styles.td, color: theme.text }}>
                              {item.name}
                            </td>
                            <td style={{ ...styles.td, color: theme.text }}>
                              {item.count}
                            </td>
                            <td style={{ ...styles.td, color: theme.text }}>
                              {item.avgScore.toFixed(2)}
                            </td>
                            <td style={{ ...styles.td, color: theme.text }}>
                              {item.avgScore >= 75
                                ? "Strong performing"
                                : item.avgScore >= 50
                                ? "Moderate performing"
                                : "Needs improvement"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div style={styles.sectionGrid}>
                <div
                  style={{
                    ...styles.panel,
                    background: theme.softCard,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <div style={styles.subHeader}>
                    <h4 style={styles.panelTitle}>Highest Scored SMEs</h4>
                    <select
                      value={highSort}
                      onChange={(e) => setHighSort(e.target.value)}
                      style={{
                        ...styles.select,
                        background: theme.card,
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>

                  {loadingSmes ? (
                    <p>Loading highest scored SMEs...</p>
                  ) : smeAnalytics.highestSMEs.length === 0 ? (
                    <p style={{ color: theme.muted }}>No scored SMEs available.</p>
                  ) : (
                    <div style={styles.cardGrid}>
                      {smeAnalytics.highestSMEs.map((sme) => (
                        <SMECard key={sme.id} sme={sme} theme={theme} />
                      ))}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    ...styles.panel,
                    background: theme.softCard,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <div style={styles.subHeader}>
                    <h4 style={styles.panelTitle}>Lowest Scored SMEs</h4>
                    <select
                      value={lowSort}
                      onChange={(e) => setLowSort(e.target.value)}
                      style={{
                        ...styles.select,
                        background: theme.card,
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>

                  {loadingSmes ? (
                    <p>Loading lowest scored SMEs...</p>
                  ) : smeAnalytics.lowestSMEs.length === 0 ? (
                    <p style={{ color: theme.muted }}>No scored SMEs available.</p>
                  ) : (
                    <div style={styles.cardGrid}>
                      {smeAnalytics.lowestSMEs.map((sme) => (
                        <SMECard key={sme.id} sme={sme} theme={theme} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div
            style={{
              ...styles.mainSection,
              background: theme.card,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div style={styles.sectionHeader}>
              <div>
                <h3 style={styles.mainTitle}>Profile</h3>
                <p style={{ margin: "6px 0 0", color: theme.muted }}>
                  Bank admin account information and settings
                </p>
              </div>
            </div>

            <div style={styles.profileWrap}>
              <div
                style={{
                  ...styles.profileCard,
                  background: theme.softCard,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <div
                  style={{
                    ...styles.bigAvatar,
                    background: BRAND,
                    color: "#fff",
                  }}
                >
                  {adminName.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h4 style={{ margin: 0, fontSize: 22 }}>{adminName}</h4>
                  <p style={{ margin: "8px 0", color: theme.muted }}>
                    Role: {adminRole}
                  </p>
                  <p style={{ margin: "8px 0", color: theme.muted }}>
                    Workspace: Bank Admin Dashboard
                  </p>
                </div>
              </div>

              <div
                style={{
                  ...styles.profileCard,
                  background: theme.softCard,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <h4 style={{ marginTop: 0 }}>Preferences</h4>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    onClick={() => setDark(!dark)}
                    style={{
                      ...styles.smallBtn,
                      background: BRAND,
                      color: "#fff",
                    }}
                  >
                    Switch to {dark ? "Light" : "Dark"} Mode
                  </button>

                  <button
                    onClick={logout}
                    style={{
                      ...styles.smallBtn,
                      background: "#ef4444",
                      color: "#fff",
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* HELPERS */

function getEvaluatorName(item) {
  return (
    item.evaluator_name ||
    item.evaluator_username ||
    item.scored_by ||
    item.evaluator ||
    item.evaluator_user ||
    item.assigned_evaluator ||
    "Unassigned"
  );
}

function getRecordDate(item) {
  const raw =
    item.updated_at ||
    item.scored_at ||
    item.evaluated_at ||
    item.created_at ||
    null;

  if (!raw) return null;

  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function capitalize(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/* SMALL COMPONENTS */

function StatCard({ title, value, theme }) {
  return (
    <div
      style={{
        background: theme.softCard,
        border: `1px solid ${theme.border}`,
        borderRadius: 16,
        padding: 18,
      }}
    >
      <div style={{ fontSize: 13, color: theme.muted }}>{title}</div>
      <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{value}</div>
    </div>
  );
}

function SMECard({ sme, theme }) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 14,
        background: theme.card,
        border: `1px solid ${theme.border}`,
      }}
    >
      <h4 style={{ margin: 0 }}>{sme.name || "Unnamed SME"}</h4>
      <p style={{ margin: "8px 0 4px", color: theme.muted }}>
        BR No: {sme.br_number || "N/A"}
      </p>
      <p style={{ margin: "4px 0", color: theme.muted }}>
        Industry: {sme.industry || "Unknown"}
      </p>
      <p style={{ margin: "4px 0", color: theme.muted }}>
        Evaluator: {getEvaluatorName(sme)}
      </p>
      <div style={{ marginTop: 10, fontWeight: 800, color: BRAND }}>
        Score: {sme.total_score ?? "N/A"}
      </div>
    </div>
  );
}

function BarRow({ label, value, maxValue, theme }) {
  const width = maxValue > 0 ? `${(value / maxValue) * 100}%` : "0%";

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 6,
        }}
      >
        <span style={{ color: theme.text, fontWeight: 700 }}>{label}</span>
        <span style={{ color: theme.muted }}>{value}</span>
      </div>
      <div
        style={{
          height: 10,
          borderRadius: 999,
          background: "rgba(128,128,128,0.15)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width,
            height: "100%",
            background: BRAND,
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}

/* THEMES */

const lightTheme = {
  bg: "#f5f7fb",
  text: "#0f172a",
  muted: "rgba(15,23,42,0.65)",
  card: "#ffffff",
  softCard: "#f8fbff",
  border: "rgba(15,23,42,0.10)",
  navbar: "rgba(255,255,255,0.96)",
  activeTab: "#ecf7fc",
  activeBorder: "rgba(47,150,180,0.25)",
};

const darkTheme = {
  bg: "#071423",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.72)",
  card: "rgba(255,255,255,0.06)",
  softCard: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.12)",
  navbar: "#0a1a2b",
  activeTab: "rgba(47,150,180,0.14)",
  activeBorder: "rgba(47,150,180,0.35)",
};

/* STYLES */

const styles = {
  page: {
    minHeight: "100vh",
  },
  navbar: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: 20,
    padding: "18px 32px",
    position: "sticky",
    top: 0,
    zIndex: 20,
  },
  brandArea: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  logoBox: {
    width: 72,
    height: 50,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    fontSize: 22,
    flexShrink: 0,
  },
  centerNav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    flexWrap: "wrap",
  },
  rightNav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 14,
  },
  navBtn: {
    minWidth: 130,
    padding: "14px 24px",
    borderRadius: 20,
    fontWeight: 800,
    fontSize: 16,
    cursor: "pointer",
    transition: "0.2s",
  },
  iconBtn: {
    width: 56,
    height: 56,
    borderRadius: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 20,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    fontSize: 24,
  },
  content: {
    padding: "28px 6%",
  },
  mainSection: {
    borderRadius: 20,
    padding: 22,
  },
  mainTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 900,
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 20,
  },
  subHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  filterRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  select: {
    padding: "10px 12px",
    borderRadius: 10,
    minWidth: 190,
    outline: "none",
    cursor: "pointer",
  },
  smallBtn: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 18,
    marginTop: 8,
  },
  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: 24,
    marginTop: 24,
  },
  panel: {
    borderRadius: 18,
    padding: 20,
  },
  panelTitle: {
    marginTop: 0,
    marginBottom: 16,
    fontSize: 18,
    fontWeight: 900,
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: 16,
  },
  approveBtn: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "none",
    background: SUCCESS,
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 520,
  },
  th: {
    textAlign: "left",
    padding: "12px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.12)",
    fontSize: 14,
  },
  td: {
    padding: "12px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    fontSize: 14,
  },
  profileWrap: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 24,
  },
  profileCard: {
    borderRadius: 18,
    padding: 24,
  },
  bigAvatar: {
    width: 88,
    height: 88,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 32,
    fontWeight: 900,
    marginBottom: 16,
  },
};