"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import styled from "styled-components";
import { PuffLoader } from "react-spinners";

const DynamicMainPage = dynamic(() => import("./MainPage"), {
  ssr: false,
});

const DynamicPracticePage = dynamic(() => import("../practice/PracticeGenerator"), {
  ssr: false,
});

const DynamicTestHub = dynamic(() => import("./TestHub"), {
  ssr: false,
});

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

function PageContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  if (mode === "trainer") {
    return <DynamicMainPage />;
  }

  if (mode === "practice") {
    return <DynamicPracticePage />;
  }

  return <DynamicTestHub />;
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <LoadingContainer>
          <PuffLoader size={60} color="#800120" />
        </LoadingContainer>
      }
    >
      <PageContent />
    </Suspense>
  );
}
