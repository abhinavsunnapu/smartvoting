import React, { useState, useEffect, useRef } from "react";
import API_ENDPOINTS from "../config/api";

const OTPModal = ({ email, onVerify, onClose, isOpen }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Handle OTP input change
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP Verification
  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_ENDPOINTS.AUTH_VERIFY_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "OTP verification failed");
        setLoading(false);
        return;
      }

      // Success
      onVerify(data);
    } catch (error) {
      setError("Could not connect to server");
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResend = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_ENDPOINTS.AUTH_REQUEST_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to resend OTP");
        setLoading(false);
        return;
      }

      // Reset OTP fields and timer
      setOtp(["", "", "", "", "", ""]);
      setTimeLeft(600);
      setCanResend(false);
      setLoading(false);
    } catch (error) {
      setError("Could not connect to server");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-[420px] max-w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#262D34] mb-2">
            Verify Email
          </h2>
          <p className="text-gray-600 text-sm">
            Enter the 6-digit OTP sent to your email
          </p>
          <p className="text-gray-500 text-xs mt-1">{email}</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          {/* OTP Input Fields */}
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition"
                disabled={loading}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Timer and Resend */}
          <div className="text-center">
            {!canResend ? (
              <p className="text-sm text-gray-600">
                OTP expires in{" "}
                <span className="font-bold text-blue-600">
                  {formatTime(timeLeft)}
                </span>
              </p>
            ) : (
              <p className="text-sm text-red-500 font-semibold">
                OTP has expired
              </p>
            )}
          </div>

          {/* Resend Button */}
          {(canResend || timeLeft < 300) && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Resending..." : "Resend OTP"}
              </button>
            </div>
          )}

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading || otp.join("").length !== 6}
            className={`w-full py-3 text-white font-semibold rounded-lg transition ${
              loading || otp.join("").length !== 6
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#00263A] hover:bg-[#001a28] cursor-pointer"
            }`}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default OTPModal;
