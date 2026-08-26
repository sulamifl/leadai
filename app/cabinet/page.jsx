"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import MagicButton from "@/components/MagicButton";
import { Spotlight } from "@/components/ui/Spotlight";
import { PuffLoader } from "react-spinners";
import styled from "styled-components"; 

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const CabinetPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [router]);

  const tools = [
    { name: "IELTS Preparation", route: "/main" },
    { name: "Selecting Your university", route: "/univer" },
    { name: "Test History", route: "/history" },
    { name: "AI Practice Test", route: "/practice" }
  ];

  if (loading) {
    return (
      <LoadingContainer>
        <PuffLoader size={60} color="#800120" />
      </LoadingContainer>
    );
  }

  return user ? (
    <main className="relative flex flex-col justify-center items-center min-h-screen overflow-hidden bg-white dark:bg-black-100">
      <div className="relative z-10 w-full max-w-3xl p-6 mt-16">
        <section className="rounded-lg p-8 bg-gray-100 dark:bg-gray-900">
          <h1 className="text-2xl font-bold mb-8 text-center text-black">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {tools.map((tool, index) => (
              <MagicButton
                key={index}
                title={tool.name}
                handleClick={() => router.push(tool.route)}
                otherClasses="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                position="left"
              />
            ))}
          </div>
          <div className="flex justify-center">
            <MagicButton
              title="Profile"
              handleClick={() => router.push("/dashboard")}
              otherClasses="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              position="left"
            />
          </div>
        </section>
      </div>
    </main>
  ) : (
    <p>Loading...</p>
  );
};

export default CabinetPage;
