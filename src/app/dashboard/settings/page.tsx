import React from "react";
import DashboardPageWrapper from "@/components/user/DashboardPageWrapper";
import SettingsPanel from "@/components/user/SettingsPanel";

export default function SettingsPage() {
  return (
    <DashboardPageWrapper username={undefined as unknown as string}>
      <SettingsPanel />
    </DashboardPageWrapper>
  );
}
