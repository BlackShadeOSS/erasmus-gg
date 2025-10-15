import React, { Suspense } from "react";

import LessonClient from "./LessonClient";

export default function LessonPage() {
  return (
    <Suspense fallback={<div className="p-6">Ładowanie lekcji...</div>}>
      {/* Client component uses useSearchParams and other client hooks */}
      <LessonClient />
    </Suspense>
  );
}