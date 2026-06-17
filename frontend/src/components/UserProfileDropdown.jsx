import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../Context/ToastContext";

const UserProfileDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { success } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    success("Logged out successfully");
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  // Get user initials
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
        aria-label="User menu"
      >
        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
          {initials}
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">
          {user.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-600">{user.email}</p>
            {user.jobTitle && (
              <p className="text-xs text-gray-500 mt-1">{user.jobTitle}</p>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                navigate("/dashboard");
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
            >
              📊 Dashboard
            </button>

            <button
              onClick={() => {
                navigate("/create-election");
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
            >
              🗳️ Create Election
            </button>

            <div className="border-t border-gray-200 my-2"></div>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition font-medium"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
