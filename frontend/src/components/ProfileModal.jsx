import React, { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import { useNavigate } from "react-router-dom";
import API_ENDPOINTS from "../config/api";
import { ButtonSpinner } from "./Spinners";

const ProfileModal = ({ isOpen, onClose, user }) => {
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      error("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      error("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.AUTH_CHANGE_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email,
          oldPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        error(data.message || "Failed to change password");
        return;
      }

      success("Password changed successfully");
      setShowPasswordChange(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      error("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    success("Logged out successfully");
    onClose();
    navigate("/", { replace: true });
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <h2 className="inter-font text-[28px] font-semibold text-[#262D34]">
            Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black transition text-2xl font-bold font-sans"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-8 space-y-6">
          {/* Profile Info Card */}
          <div className="bg-[#F3F7FE] rounded p-6 space-y-4">
            <div>
              <p className="inter-font text-[14px] text-[#262D3A] font-semibold mb-1">
                NAME
              </p>
              <p className="inter-font text-[16px] text-[#00263A]">
                {user?.name || "User"}
              </p>
            </div>
            <div className="border-t border-[#E0E7FF] pt-3">
              <p className="inter-font text-[14px] text-[#262D3A] font-semibold mb-1">
                EMAIL
              </p>
              <p className="inter-font text-[16px] text-[#00263A]">
                {user?.email}
              </p>
            </div>
            <div className="border-t border-[#E0E7FF] pt-3">
              <p className="inter-font text-[14px] text-[#262D3A] font-semibold mb-1">
                ROLE
              </p>
              <p className="inter-font text-[16px] text-[#00263A]">
                {user?.jobTitle || "No role assigned"}
              </p>
            </div>
          </div>

          {/* Change Password Section */}
          {!showPasswordChange ? (
            <button
              onClick={() => setShowPasswordChange(true)}
              className="w-full px-7 py-3 text-white font-semibold text-md inter-font rounded flex items-center justify-center gap-2 bg-[#00263A] hover:bg-[#001a28] transition"
            >
              🔐 Change Password
            </button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="flex flex-col gap-1">
                <p className="text-[14px] text-[#262D34] mb-1 inter-font font-semibold">
                  Current Password
                </p>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 bg-[#F3F7FE] outline-none"
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[14px] text-[#262D34] mb-1 inter-font font-semibold">
                  New Password
                </p>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 bg-[#F3F7FE] outline-none"
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[14px] text-[#262D34] mb-1 inter-font font-semibold">
                  Confirm Password
                </p>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 bg-[#F3F7FE] outline-none"
                  disabled={loading}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 px-7 py-3 text-white font-semibold text-md inter-font rounded flex items-center justify-center gap-2 transition
                              ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#00263A] cursor-pointer hover:bg-[#001a28]"}`}
                >
                  {loading && <ButtonSpinner size="sm" />}
                  {loading ? "Updating..." : "Update"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordChange(false);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="flex-1 px-7 py-3 text-[#262D3A] bg-gray-200 hover:bg-gray-300 font-semibold text-md inter-font rounded flex items-center justify-center transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 px-7 py-3 font-semibold text-white text-md inter-font rounded transition flex items-center justify-center gap-2"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
