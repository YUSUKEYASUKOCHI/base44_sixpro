import React, { useState, useEffect } from "react";
import { UserProfile } from "@/api/entities";
import { User } from "@/api/entities";
import { motion } from "framer-motion";
import { Loader2, CheckCircle } from "lucide-react";
import ProfileForm from "../components/profile/ProfileForm";
import AuthRequired from "../components/auth/AuthRequired";

export default function ProfileSettings() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // For profile data loading
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentUserForPage, setCurrentUserForPage] = useState(null);


  // This useEffect hook is to fetch the current user for the page.
  // The AuthRequired component will handle the case where user is not logged in.
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await User.me();
        setCurrentUserForPage(user);
      } catch (error) {
        // AuthRequired component will handle this
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserForPage) {
      loadProfile(currentUserForPage.email);
    } else {
      setIsLoading(false); // If no user, no profile to load
    }
  }, [currentUserForPage]);

  const loadProfile = async (userEmail) => {
    setIsLoading(true);
    try {
      const profiles = await UserProfile.filter({ created_by: userEmail });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      } else {
        setProfile(null); // Ensure profile is null if not found
      }
    } catch (error) {
      console.error("プロフィール読み込みエラー:", error);
      setProfile(null);
    }
    setIsLoading(false);
  };

  const handleSave = async (profileData) => {
    if (!currentUserForPage) return; // Should not happen if AuthRequired is used

    setIsSaving(true);
    try {
      const dataToSave = { ...profileData, created_by: currentUserForPage.email };
      if (profile && profile.id) {
        await UserProfile.update(profile.id, dataToSave);
      } else {
        const newProfile = await UserProfile.create(dataToSave);
        setProfile(newProfile); // Update state with the newly created profile
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      // Reload profile after save to ensure UI is consistent with DB
      await loadProfile(currentUserForPage.email);
    } catch (error) {
      console.error("プロフィール保存エラー:", error);
    }
    setIsSaving(false);
  };
  
  return (
    <AuthRequired>
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              プロフィール設定
            </h1>
            <p className="text-gray-600 text-lg">
              あなたに最適な栄養メニューを生成するために、詳しい情報を教えてください
            </p>
          </motion.div>

          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">プロフィールが正常に保存されました</span>
            </motion.div>
          )}

          {isLoading && !profile && ( // Show loader only if loading and no profile yet
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-main" />
            </div>
          )}

          {(!isLoading || profile) && ( // Render form if not loading OR if profile is loaded
            <div className="relative">
              {isSaving && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-main mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">保存中...</p>
                  </div>
                </div>
              )}
              
              <ProfileForm profile={profile} onSave={handleSave} />
            </div>
          )}
        </div>
      </div>
    </AuthRequired>
  );
}