import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminPanel() {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
        redirect("/login");
    }

    return <AdminDashboard user={user} />;
}
