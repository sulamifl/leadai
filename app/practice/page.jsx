"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// /practice объединён с /main (хаб тестирования).
// AI Practice Test Generator теперь доступен по адресу /main?mode=practice.
// Эта страница перенаправляет на /main?mode=practice.
const PracticeRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/main?mode=practice");
  }, [router]);

  return null;
};

export default PracticeRedirect;
