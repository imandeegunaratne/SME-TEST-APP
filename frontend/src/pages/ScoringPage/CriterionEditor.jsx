import { bands, rubric, bandKeyFromScore, clampScore, scoreForBand } from "./constants";

export default function CriterionEditor({
  theme,
  styles,
  activeIndex,
  scores,
  setScores,
  goToIndex,
  cardRef,
  progress,
  saveDraftToBackend,
  savingDraft,
  submitFinal,
  submitting,
}) {
  const activeCriterion = rubric[activeIndex];
  const active = scores[activeCriterion.code];
  const activeScore = active?.score;
  const selectedBandKey = typeof activeScore === "number" ? bandKeyFromScore(activeScore) : null;

  const setScore = (newScore) => {
    setScores((previous) => ({
      ...previous,
      [activeCriterion.code]: { ...previous[activeCriterion.code], score: newScore },
    }));
  };

  const setActiveField = (key, value) => {
    setScores((previous) => ({
      ...previous,
      [activeCriterion.code]: { ...previous[activeCriterion.code], [key]: value },
    }));
  };

  return (
    <section
      ref={cardRef}
      style={{
        ...styles.searchCard,
        background: theme.card,
        border: `1px solid ${theme.border}`,
      }}
    >
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>{activeCriterion.title}</h2>
        <p style={{ ...styles.sectionSub, color: theme.subText }}>
          {activeCriterion.code} • Criterion {activeIndex + 1} of {rubric.length}
        </p>
      </div>

      <div style={styles.rangeRow}>
        <input
          type="range"
          min={1}
          max={10}
          value={typeof activeScore === "number" ? activeScore : 5}
          onChange={(event) => setScore(clampScore(Number(event.target.value)))}
          style={{ width: "100%" }}
        />

        <input
          type="number"
          min={1}
          max={10}
          value={activeScore ?? ""}
          onChange={(event) => setScore(event.target.value === "" ? null : clampScore(Number(event.target.value)))}
          placeholder="-"
          style={{
            ...styles.scoreInput,
            background: theme.inputBg,
            color: theme.text,
            border: `1px solid ${theme.border}`,
          }}
        />
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={styles.bandsHeader}>
          <div style={{ fontWeight: 800, color: theme.text }}>Rubric Bands</div>
          <div style={{ fontSize: 12, color: theme.subText }}>
            {selectedBandKey ? `Selected: ${selectedBandKey}` : "Not selected yet"}
          </div>
        </div>

        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          {bands.map((band) => {
            const activeBand = selectedBandKey === band.key;

            return (
              <button
                key={band.key}
                type="button"
                onClick={() => setScore(scoreForBand(band))}
                style={{
                  ...styles.bandCard,
                  background: activeBand ? theme.tabActiveBg : theme.resultBg,
                  border: `1px solid ${activeBand ? theme.button : theme.border}`,
                  color: theme.text,
                }}
              >
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div
                    style={{
                      ...styles.bandIcon,
                      background: theme.iconBg1,
                      color: theme.text,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    {activeBand ? "✓" : "+"}
                  </div>

                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{band.label}</div>
                    <div style={{ marginTop: 6, color: theme.subText, fontSize: 14, lineHeight: 1.6 }}>
                      {activeCriterion.desc?.[band.key] ?? "-"}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <label style={styles.label}>Notes</label>
        <textarea
          value={active.notes}
          onChange={(event) => setActiveField("notes", event.target.value)}
          placeholder="Evidence / notes"
          style={{
            ...styles.textarea,
            background: theme.inputBg,
            color: theme.text,
            border: `1px solid ${theme.border}`,
          }}
        />

        <label
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            marginTop: 14,
            color: theme.text,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <input
            type="checkbox"
            checked={!!active.followup}
            onChange={(event) => setActiveField("followup", event.target.checked)}
          />
          Need follow-up information
        </label>
      </div>

      <div style={styles.bottomActions}>
        <button
          style={{
            ...styles.searchBtn,
            background: theme.card,
            color: theme.text,
            border: `1px solid ${theme.border}`,
            boxShadow: "none",
            opacity: activeIndex === 0 ? 0.6 : 1,
          }}
          disabled={activeIndex === 0}
          onClick={() => goToIndex(activeIndex - 1)}
        >
          Previous
        </button>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            style={{
              ...styles.searchBtn,
              background: theme.resultBg,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              boxShadow: "none",
            }}
            onClick={saveDraftToBackend}
            disabled={savingDraft}
          >
            {savingDraft ? "Saving..." : "Save Draft"}
          </button>

          {activeIndex < rubric.length - 1 ? (
            <button style={{ ...styles.searchBtn, background: theme.button }} onClick={() => goToIndex(activeIndex + 1)}>
              Next
            </button>
          ) : (
            <button
              style={{
                ...styles.searchBtn,
                background: theme.button,
                opacity: progress.scored === progress.total && !submitting ? 1 : 0.65,
              }}
              disabled={progress.scored !== progress.total || submitting}
              onClick={submitFinal}
            >
              {submitting ? "Submitting..." : "Submit Final"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
