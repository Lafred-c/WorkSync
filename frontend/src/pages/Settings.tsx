import {useState, useEffect} from "react";
import {useUser} from "../hooks/useUser";
import {userService} from "../services/userService";
import {compressImage} from "../utils/imageCompression";
import Toast from "../components/ui/Toast";
import {User, Lock, Save, Camera} from "lucide-react";

const Settings = () => {
  const {user} = useUser();
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Profile State
  const [bio, setBio] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password State
  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setBio(user.bio || "");
      if (user.photo && user.photo !== "default.jpg") {
        setPhotoPreview(user.photo);
      }
    }
  }, [user]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate (reuse logic or keep simple)
    if (file.size > 5 * 1024 * 1024) {
      setToast({message: "Image exceeding 5MB limitation", type: "error"});
      return;
    }

    setIsCompressing(true);
    try {
      const compressed = await compressImage(file, 400, 400, 0.7);
      setPhotoPreview(compressed);
    } catch (err) {
      setToast({message: "Failed to process image", type: "error"});
    } finally {
      setIsCompressing(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const updateData: any = {bio};
      if (photoPreview && photoPreview !== user?.photo) {
        updateData.photo = photoPreview;
      }

      await userService.updateMe(updateData);
      setToast({message: "Profile updated successfully", type: "success"});
    } catch (err: any) {
      setToast({
        message: err.message || "Failed to update profile",
        type: "error",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setToast({message: "New passwords do not match", type: "error"});
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await userService.updatePassword(
        passwordCurrent,
        password,
        passwordConfirm,
      );
      setToast({message: "Password updated successfully", type: "success"});
      // Clear password fields (keep current for re-auth?) No, clear all usually.
      setPasswordCurrent("");
      setPassword("");
      setPasswordConfirm("");
    } catch (err: any) {
      setToast({
        message: err.message || "Failed to update password",
        type: "error",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your account settings and preferences.
          </p>
        </div>

        {/* Profile Section */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <User size={16} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Profile Information
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Update your personal details
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="flex items-center gap-4">
              {/* Avatar Upload */}
              <div className="relative group shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-900 text-white flex items-center justify-center text-xl font-medium border-2 border-transparent group-hover:border-indigo-500 transition-colors">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <label
                  htmlFor="photo-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                  <Camera size={20} className="text-white" />
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isCompressing}
                  className="hidden"
                />
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={user.name}
                    readOnly
                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Passionate about building projects."
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isUpdatingProfile ? (
                  "Saving..."
                ) : (
                  <>
                    <Save size={14} />
                    Update Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Password Section */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
              <Lock size={16} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Change Password
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ensure your account is secure
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={passwordCurrent}
                onChange={(e) => setPasswordCurrent(e.target.value)}
                required
                className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="flex items-center gap-2 px-4 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isUpdatingPassword ? "Updating..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Settings;
