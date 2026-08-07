import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export function MainTabLayout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
}
