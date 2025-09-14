import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserDashboard from "@/components/user/UserDashboard";

export default async function Dashboard() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <UserDashboard user={user} />;
}
