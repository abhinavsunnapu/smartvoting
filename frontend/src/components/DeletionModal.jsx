import React from "react";
import { ButtonSpinner } from "./Spinners";

const DeletionModal = ({
  isOpen,
  onClose,
  onConfirm,
  electionName,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[90] backdrop-blur-sm bg-black/40 px-4 animate-in fade-in duration-200">
      <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col gap-6 w-full max-w-md animate-in slide-in-from-bottom-2 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h2 className="text-[24px] font-semibold text-red-600 inter-font">
            Delete Election
          </h2>
          <p className="text-gray-500 text-[14px]">
            Are you sure you want to delete <strong>{electionName}</strong>?
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 w-full"></div>

        {/* Warning Message */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <span className="text-xl flex-shrink-0">⚠️</span>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-red-900">
              Irreversible Action
            </p>
            <p className="text-xs text-red-800">
              This will permanently delete the election, its details, and all associated vote data. This cannot be undone.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 w-full"></div>

        {/* Buttons */}
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition shadow-md flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading && <ButtonSpinner size="sm" />}
            {loading ? "Deleting..." : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletionModal;
