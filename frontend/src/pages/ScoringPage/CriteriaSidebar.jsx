import { rubric } from "./constants";

export default function CriteriaSidebar({ theme, styles, scores, activeIndex, goToIndex }) {
  return (
    <aside
      style={{
        ...styles.sidebarCard,
        background: theme.card,
        border: `1px solid ${theme.border}`,
      }}
    >
      <div style={styles.sectionHeader}>
        <h3 style={{ ...styles.sideTitle, color: theme.text }}>Criteria</h3>
        <p style={{ ...styles.sectionSub, color: theme.subText }}>Select a criterion</p>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {rubric.map((criterion, index) => {
          const value = scores[criterion.code]?.score;
          const selected = index === activeIndex;
          const done = typeof value === "number";

          return (
            <button
              key={criterion.code}
              onClick={() => goToIndex(index)}
              style={{
                ...styles.criteriaNavBtn,
                background: selected ? theme.tabActiveBg : theme.resultBg,
                border: `1px solid ${selected ? theme.tabActiveBorder : theme.border}`,
                color: theme.text,
              }}
            >
              <div style={{ textAlign: "left", flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 13 }}>{criterion.code}</div>
                <div style={{ fontSize: 13, color: theme.subText, marginTop: 4 }}>{criterion.title}</div>
              </div>

              <div
                style={{
                  ...styles.criteriaBadge,
                  background: done ? theme.button : theme.card,
                  color: done ? "#fff" : theme.text,
                  border: `1px solid ${done ? theme.button : theme.border}`,
                }}
              >
                {done ? value : "-"}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
