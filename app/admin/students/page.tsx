"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Students page now redirects to Users page
// The terminology has been updated from "students" to "users" 
// to support all location types (restaurants, markets, offices, etc.)
export default function AdminStudentsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/users");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Redirecting to Users page...</p>
    </div>
  );
}
