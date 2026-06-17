import React from "react";
import { ButtonSpinner } from "./Spinners";

const VoteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCandidate,
  loading,
}) => {
  if (!isOpen || !selectedCandidate) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[90] backdrop-blur-sm bg-black/40 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col gap-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h2 className="text-[24px] font-semibold text-[#00263A] inter-font">
            Confirm Your Vote
          </h2>
          <p className="text-gray-500 text-[14px]">
            Please review your selection before proceeding with facial
            verification.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 w-full"></div>

        {/* Selected Candidate */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-5 flex items-center gap-4">
          <span className="text-4xl">🗳️</span>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">
              Your Selection
            </p>
            <p className="text-lg font-bold text-[#00263A]">
              {selectedCandidate.name}
            </p>
            {selectedCandidate.party && (
              <p className="text-sm text-gray-600 font-medium">
                {selectedCandidate.party}
              </p>
            )}
          </div>
        </div>

        {/* Warning Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <span className="text-xl flex-shrink-0">⚠️</span>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-blue-900">
              Important Notice
            </p>
            <p className="text-xs text-blue-800">
              Votes cannot be changed once cast. You will need to verify your
              identity with facial recognition to proceed.
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
            className="flex-1 py-3 bg-gray-100 text-[#00263A] font-semibold rounded-lg hover:bg-gray-200 transition border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 bg-[#00263A] text-white font-semibold rounded-lg hover:bg-[#001a28] transition shadow-md flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <ButtonSpinner size="sm" />}
            {loading ? "Preparing..." : "Verify & Vote"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoteConfirmationModal;
