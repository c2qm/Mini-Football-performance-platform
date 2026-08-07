import { Outlet } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";

export function RootLayout() {
  const { theme } = useTheme();

  return (
    <div className="app-shell" data-theme={theme}>
      <Outlet />
    </div>
  );
}
