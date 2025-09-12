// filepath: /home/laitdsgn/Downloads/erasmus-gg/src/app/dashboard/vocabulary/page.tsx
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import VocabularyTable from "@/components/user/VocabularyTable";

export default async function VocabularyPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-neutral-900 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-100 mb-6">
          Słownictwo
        </h1>
        <VocabularyTable />
      </div>
    </div>
  );
}
