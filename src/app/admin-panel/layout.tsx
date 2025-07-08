import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

export default async function AdminPanelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
        redirect("/login");
    }

    return <AdminLayout user={user}>{children}</AdminLayout>;
}
