"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// /dashboard объединён с /cabinet (личный кабинет).
// Эта страница перенаправляет на /cabinet, где теперь находится
// и хаб инструментов, и профиль пользователя.
const DashboardRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/cabinet");
  }, [router]);

  return null;
};

export default DashboardRedirect;
