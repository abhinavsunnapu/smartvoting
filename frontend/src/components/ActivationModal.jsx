import React from "react";
import { ButtonSpinner } from "./Spinners";

const ActivationModal = ({
  isOpen,
  onClose,
  onConfirm,
  electionName,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[90] backdrop-blur-sm bg-black/40 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col gap-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h2 className="text-[24px] font-semibold text-[#00263A] inter-font">
            Activate Election
          </h2>
          <p className="text-gray-500 text-[14px]">
            Are you sure you want to activate <strong>{electionName}</strong>?
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 w-full"></div>

        {/* Warning Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <span className="text-xl flex-shrink-0">🚀</span>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-blue-900">
              Ready for Voting
            </p>
            <p className="text-xs text-blue-800">
              Once active, whitelisted voters will be able to access and participate in this election during its scheduled dates.
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
            className="flex-1 py-3 bg-gray-100 text-[#00263A] font-semibold rounded-lg hover:bg-gray-200 transition border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 bg-[#00263A] text-white font-semibold rounded-lg hover:bg-[#001a28] transition shadow-md flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading && <ButtonSpinner size="sm" />}
            {loading ? "Activating..." : "Yes, Activate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivationModal;
