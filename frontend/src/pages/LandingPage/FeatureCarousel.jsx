export default function FeatureCarousel({ theme, styles, features, activeFeature }) {
  return (
    <div style={styles.liveUiWrap}>
      <div
        style={{
          ...styles.liveCardLarge,
          background: theme.card,
          border: `1px solid ${theme.border}`,
          boxShadow: theme.shadow,
        }}
      >
        <div style={styles.liveHeader}>
          <div>
            <div style={{ ...styles.liveTitle, color: theme.text }}>Decision Support Features</div>
            <div style={{ ...styles.liveSub, color: theme.muted }}>Intelligent functions for your SME scoring platform</div>
          </div>

          <div style={styles.liveHeaderDots}>
            {features.map((_, index) => (
              <span
                key={index}
                style={{
                  ...styles.dot,
                  background: activeFeature === index ? theme.button : theme.dot,
                  transform: activeFeature === index ? "scale(1.15)" : "scale(1)",
                  transition: "all 0.2s ease",
                }}
              />
            ))}
          </div>
        </div>

        <div style={styles.featureStack}>
          {features.map((item, index) => {
            const isActive = activeFeature === index;

            return (
              <div
                key={item.title}
                style={{
                  ...styles.featureLiveCard,
                  background: isActive ? theme.activeCard : theme.subCard,
                  border: `1px solid ${isActive ? theme.activeBorder : theme.border}`,
                  boxShadow: isActive ? theme.activeShadow : "none",
                  transform: isActive ? "translateY(0px) scale(1.02)" : "translateY(0px) scale(0.98)",
                  opacity: isActive ? 1 : 0.75,
                }}
              >
                <div style={{ ...styles.featureAccent, background: isActive ? theme.button : theme.buttonSoft }} />

                <div style={styles.featureLiveBody}>
                  <div
                    style={{
                      ...styles.featureIndex,
                      background: isActive ? theme.buttonSoftStrong : theme.buttonSoft,
                      color: theme.button,
                    }}
                  >
                    0{index + 1}
                  </div>

                  <div>
                    <div style={{ ...styles.featureLiveTitle, color: theme.text }}>{item.title}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
