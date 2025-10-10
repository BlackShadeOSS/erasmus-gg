import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import VideosPage from "@/components/user/VideosPage";

export default async function Videos() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <VideosPage user={user} />;
}
