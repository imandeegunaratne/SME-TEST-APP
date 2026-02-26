import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function SMEReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "";

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`/api/smes/${id}/report/`, {
          headers: { "X-Username": username },
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j.detail || "Failed to load report.");
        setData(j);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, username]);

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>;
  if (err) return <div style={{ padding: 20 }}>Error: {err}</div>;
  if (!data) return null;

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ margin: 0 }}>SME Report</h2>
      <div style={{ marginTop: 10 }}>
        <div><b>Name:</b> {data.name}</div>
        <div><b>BR:</b> {data.br_number}</div>
        <div><b>Industry:</b> {data.industry || "—"}</div>
        <div><b>Total Score:</b> {Number(data.total_score || 0).toFixed(2)}</div>
        <div><b>Scored By:</b> {data.scored_by || "—"}</div>
      </div>

      <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
        <button onClick={() => navigate("/evaluator-home")}>Back</button>

        {data.is_editable && (
          <button onClick={() => navigate(`/smes/${id}/score?edit=1`)}>
            Edit Scoring
          </button>
        )}
      </div>
    </div>
  );
}