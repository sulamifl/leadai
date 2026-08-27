"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { auth, storage } from "@/lib/firebase";
import { onAuthStateChanged, signOut, updatePassword, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import MagicButton from "@/components/MagicButton";
import { Spotlight } from "@/components/ui/Spotlight";
import { PuffLoader } from "react-spinners";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import ProgressDashboard from "@/components/ProgressDashboard";
import StudyPlan from "@/components/StudyPlan";

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const CabinetPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Профиль
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const inactivityTimeoutRef = useRef(null);

  const tools = [
    { name: t("ielts_testing"), route: "/main" },
    { name: t("selecting_university"), route: "/univer" },
    { name: t("test_history"), route: "/history" },
    { name: t("progress_achievements"), route: "/progress" },
    { name: t("goals_target"), route: "/goals" },
    { name: t("notifications_reminders"), route: "/notifications" },
    { name: t("gamification"), route: "/gamification" },
    { name: t("leaderboard"), route: "/leaderboard" },
    { name: t("essay_analysis"), route: "/essay" },
    { name: t("speech_analysis"), route: "/voice" },
    { name: t("speaking_tutor_title"), route: "/speaking-tutor" },
    { name: t("writing_tutor_title"), route: "/writing-tutor" },
    { name: t("reading_listening_tutor_title"), route: "/reading-listening-tutor" },
    { name: t("personalized_study_plan"), route: "/study-plan" },
    { name: t("vocabulary"), route: "/vocabulary" },
    { name: t("ai_assistant"), route: "/assistant" }
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setName(currentUser.displayName || "");
        setEmail(currentUser.email);
        setAvatar(currentUser.photoURL);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    const handleInactive = () => {
      toast.error(t("inactivity_logout"));
      signOut(auth)
        .then(() => router.push("/login"))
        .catch(() => toast.error(t("logout_failed")));
    };

    const resetTimeout = () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      inactivityTimeoutRef.current = setTimeout(handleInactive, 3600000);
    };

    resetTimeout();

    window.addEventListener("mousemove", resetTimeout);
    window.addEventListener("keypress", resetTimeout);

    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      window.removeEventListener("mousemove", resetTimeout);
      window.removeEventListener("keypress", resetTimeout);
      unsubscribe();
    };
  }, [router, t]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    try {
      if (auth.currentUser) {
        let photoURL = avatar;

        if (avatarFile) {
          const avatarRef = ref(storage, `avatars/${auth.currentUser.uid}`);
          await uploadBytes(avatarRef, avatarFile);
          photoURL = await getDownloadURL(avatarRef);
        }

        await updateProfile(auth.currentUser, { displayName: name, photoURL });
        setUser({ ...auth.currentUser, displayName: name, photoURL });

        if (password) {
          await updatePassword(auth.currentUser, password);
          setPassword("");
        }

        toast.success(t("profile_success"));
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(t("profile_update_error"));
    }
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        router.push("/login");
        toast.success(t("logged_out"));
      })
      .catch((error) => {
        console.error("Logout error:", error);
        toast.error(t("logout_error"));
      });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  if (loading) {
    return (
      <LoadingContainer>
        <PuffLoader size={60} color="#800120" />
      </LoadingContainer>
    );
  }

  return user ? (
    <main className="relative flex flex-col justify-center items-center min-h-screen overflow-hidden bg-white dark:bg-black-100">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="relative z-10 w-full max-w-3xl p-4 sm:p-6 mt-16">
        <section className="rounded-lg p-4 sm:p-8 bg-gray-100 dark:bg-gray-900">
          <h1 className="text-2xl font-bold mb-8 text-center text-black dark:text-white">{t("dashboard")}</h1>

          {/* Инструменты */}
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

          {/* Профиль */}
          <div className="border-t border-gray-300 dark:border-gray-700 pt-8">
            <h2 className="text-xl font-bold mb-6 text-center text-black dark:text-white">{t("profile")}</h2>
            <div className="flex flex-col items-center mb-6">
              <label htmlFor="avatar-upload" className="relative cursor-pointer mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-700">
                  <Image
                    src={avatar || "/da.png"}
                    alt="Avatar"
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
              <div className="mb-4 w-full">
                <label className="block text-lg font-medium text-black dark:text-white">{t("username")}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 bg-gray-700 text-white"
                />
              </div>
              <div className="mb-4 w-full">
                <label className="block text-lg font-medium text-black dark:text-white">{t("email")}</label>
                <input
                  type="email"
                  value={email}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 bg-gray-700 text-white"
                  readOnly
                />
              </div>
              <div className="mb-4 w-full relative">
                <label className="block text-lg font-medium text-black dark:text-white">{t("new_password")}</label>
                <div className="relative">
                  <div className="flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:border-indigo-500 bg-gray-700 text-white"
                      placeholder={t("enter_new_password")}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute left-2 top-9 p-1"
                    >
                      {showPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                    </button>
                  </div>
                </div>
              </div>
              <MagicButton
                title={t("save_changes")}
                handleClick={handleSaveChanges}
                otherClasses="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                position="left"
              />
              <button onClick={handleLogout} className="text-black dark:text-white mt-2 cursor-pointer bg-transparent border-none">
                {t("logout")}
              </button>
            </div>
          </div>
        </section>

        {user && (
          <div className="w-full mt-16">
            <ProgressDashboard />
            <StudyPlan />
          </div>
        )}
      </div>
    </main>
  ) : (
    <p>Loading...</p>
  );
};

export default CabinetPage;
