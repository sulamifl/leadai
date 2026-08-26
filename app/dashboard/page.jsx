"use client";

import React, { useState, useEffect, useRef } from "react";
import { auth, storage } from "@/lib/firebase";
import { signOut, updatePassword, updateProfile, onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import MagicButton from "@/components/MagicButton";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ProgressDashboard from "@/components/ProgressDashboard";
import StudyPlan from "@/components/StudyPlan";

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const inactivityTimeoutRef = useRef(null);
  const [avatarFile, setAvatarFile] = useState(null);

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
    });

    const handleInactive = () => {
      toast.error("You have been logged out due to inactivity.");
      signOut(auth)
        .then(() => router.push("/login"))
        .catch(() => toast.error("Logout failed, please try again."));
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
  }, [router]);

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

        toast.success("Profile successfully updated!");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Profile update failed, please try again.");
    }
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        router.push("/login");
        toast.success("Logged out successfully.");
      })
      .catch((error) => {
        console.error("Logout error:", error);
        toast.error("Logout failed, please try again.");
      });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <main className="relative flex justify-center items-center min-h-screen">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="relative z-10 flex justify-center items-center min-h-screen w-full">
        <div className="w-full max-w-sm p-6 mt-16">
          <section>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-4 text-black">{name}</h1>
            </div>
            <div className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <label htmlFor="avatar-upload" className="relative cursor-pointer mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-700">
                    <img
                      src={avatar || "/da.png"}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      style={{ width: "100px", height: "100px", objectFit: "cover" }}
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
                  <label className="block text-lg font-medium text-black">Username</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 bg-gray-700 text-white"
                  />
                </div>
                <div className="mb-4 w-full">
                  <label className="block text-lg font-medium text-black">Email</label>
                  <input
                    type="email"
                    value={email}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 bg-gray-700 text-white"
                    readOnly
                  />
                </div>
                <div className="mb-4 w-full relative">
                  <label className="block text-lg font-medium text-black">New Password</label>
                  <div className="relative">
                    <div class="flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:border-indigo-500 bg-gray-700 text-white"
                      placeholder="Enter your new password"
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
                  title="Save changes"
                  handleClick={handleSaveChanges}
                  otherClasses="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  position="left"
                />
                <Link href="/login" onClick={handleLogout} className="text-black mt-2">
                  Logout
                </Link>
              </div>
            </div>
          </section>
        </div>
        {user && (
          <div className="w-full mt-16">
            <ProgressDashboard />
            <StudyPlan />
          </div>
        )}
      </div>
    </main>
  );
};

export default DashboardPage;
