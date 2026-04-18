import { appNavbarStyles, appShellStyles } from "../../styles/appTheme";

export const styles = {
  page: appShellStyles.page,
  navbar: { ...appNavbarStyles.shell, ...appNavbarStyles.flexShell, zIndex: 20 },
  brand: appNavbarStyles.brand,
  logoImg: appNavbarStyles.logoImg,
  brandTitle: appNavbarStyles.brandTitle,
  brandSub: appNavbarStyles.brandSub,
  main: { width: "min(600px, 92%)", margin: "40px auto" },
  card: { padding: 24, borderRadius: 20 },
  title: { fontSize: 24, fontWeight: 800, margin: 0 },
  subText: { marginTop: 8, marginBottom: 18, fontSize: 14 },
  form: { display: "grid", gap: 12 },
  input: { padding: 12, borderRadius: 12, width: "100%", boxSizing: "border-box", outline: "none", fontSize: 14 },
  btn: { padding: 12, borderRadius: 12, border: "none", fontWeight: 800, cursor: "pointer" },
  dropdownMenu: { position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, borderRadius: 12, padding: 10, zIndex: 20 },
  optionsList: { maxHeight: 220, overflowY: "auto", borderRadius: 8 },
  optionStyle: { padding: "10px 12px", borderRadius: 8, cursor: "pointer" },
  modalOverlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 100,
  },
  modalBox: { padding: 20, borderRadius: 16, width: 350, textAlign: "center" },
};
