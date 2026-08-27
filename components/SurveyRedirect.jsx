// components/SurveyRedirect.jsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const SurveyRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    const hasCompletedSurvey = localStorage.getItem("hasCompletedSurvey");

    if (!hasCompletedSurvey) {
      router.push("/survey");
    } else {
      router.push("/cabinet");
    }
  }, [router]);

  return null;
};

export default SurveyRedirect;
