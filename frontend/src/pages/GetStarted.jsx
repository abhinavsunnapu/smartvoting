import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import API_ENDPOINTS from "../config/api";
import OTPModal from "../components/OTPModal";
import { ButtonSpinner } from "../components/Spinners";
import * as faceapi from "face-api.js";
import { useRef, useEffect } from "react";

const GetStarted = () => {
  const navigate = useNavigate();
  const { error: showError, success } = useToast();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    jobTitle: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const videoRef = useRef(null);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [faceError, setFaceError] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  useEffect(() => {
    if (showCamera) {
      startVideo();
    } else {
      stopVideo();
    }
  }, [showCamera]);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";

      try {
        console.log("Loading models...");

        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        console.log("TinyFaceDetector loaded");

        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        console.log("Landmarks loaded");

        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        console.log("Recognition loaded");

        setModelsLoaded(true);
        console.log("ALL MODELS LOADED ✅");
      } catch (error) {
        console.error("Model loading failed ❌", error);
        setFaceError("Failed to load face detection models");
      }
    };

    loadModels();
  }, []);

  const startVideo = async () => {
    try {
      // stop previous stream first
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }
    } catch (err) {
      console.error(err);
      setFaceError("Unable to access camera");
    }
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  const takePhoto = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);
    const image = canvas.toDataURL("image/png");
    setCapturedImage(image);
    // OPTIONAL: pause video for cleaner UX
    videoRef.current.pause();
  };

  const confirmFace = async () => {
    if (!modelsLoaded) {
      setFaceError("Face detection still loading...");
      return;
    }

    if (!capturedImage) {
      setFaceError("No image captured.");
      return;
    }

    try {
      setDetecting(true);
      setFaceError("");

      const img = await faceapi.fetchImage(capturedImage);

      const detection = await faceapi
        .detectSingleFace(
          img,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 512,
            scoreThreshold: 0.5,
          }),
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      setDetecting(false);

      if (!detection) {
        setFaceError("Face not detected. Please retake.");
        return;
      }

      // ✅ success
      setFaceDescriptor(Array.from(detection.descriptor));

      // close instantly
      setShowCamera(false);
      setCapturedImage(null);
      stopVideo();
    } catch (error) {
      console.error(error);
      setDetecting(false);
      setFaceError("Error detecting face. Try again.");
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!faceDescriptor) {
      showError("Please capture your face before registering.");
      return;
    }

    setLoading(true);
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;
    if (!passwordRegex.test(form.password)) {
      showError(
        "Password must be at least 6 characters and include letters, numbers, and a special character",
      );
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(API_ENDPOINTS.AUTH_REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          faceDescriptor,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.message || "Registration Failed");
        setLoading(false);
        return;
      }

      if (data.alreadyVerified) {
        success(data.message);
        navigate("/login", { replace: true });
        return;
      }

      // Show OTP modal instead of immediately logging in
      success("Registration successful! Check your email for OTP.");
      setUserEmail(form.email);
      setShowOTPModal(true);
      setLoading(false);
    } catch (error) {
      showError("Could not connect to server");
      setLoading(false);
    }
  };

  // Handle OTP verification success
  const handleOTPVerify = (userData) => {
    // userData contains token and user info
    login(userData.user, userData.token);
    setShowOTPModal(false);
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="flex items-center justify-center px-4 py-2">
      <div className="w-full max-w-lg flex flex-col gap-2 px-4 py-2">
        <h1 className="inter-font text-[32px] font-semibold text-[#262D34]">
          Administrator Sign Up
        </h1>
        <p className="text-[16px] text-[#262D3A] mb-6.25">
          Already have an account ?{" "}
          <a
            className="text-orange-400 underline text-sm font-bold"
            href="/login"
          >
            Login
          </a>
        </p>
        <form
          onSubmit={onSubmitHandler}
          noValidate
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1">
            <p className="text-[16px] text-[#262D3A] mb-1 inter-font font-semibold">
              Name
            </p>
            <input
              className="w-full px-4 py-3 bg-[#F3F7FE] outline-none"
              type="text"
              name="name"
              value={form.name}
              required
              onChange={handleChange}
              placeholder="Name"
            />
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[16px] text-[#262D3A] mb-1 inter-font font-semibold">
              Email
            </p>
            <input
              className="w-full px-4 py-3 bg-[#F3F7FE] outline-none"
              type="email"
              name="email"
              value={form.email}
              required
              onChange={handleChange}
              placeholder="Email"
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[16px] text-[#262D3A] mb-1 inter-font font-semibold">
              Password
            </p>
            <input
              className="w-full px-4 py-3 bg-[#F3F7FE] outline-none"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              required
              name="password"
              value={form.password}
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[16px] text-[#262D3A] mb-1 inter-font font-semibold">
              Job Title{" "}
            </p>
            <input
              className="w-full px-4 py-3 bg-[#F3F7FE] outline-none"
              type="text"
              placeholder=""
              name="jobTitle"
              onChange={handleChange}
              value={form.jobTitle}
            />
          </div>
          <div className="flex flex-col items-center gap-3 mt-6">
            {/* Section Title */}
            <p className="text-[15px] font-semibold text-gray-700">
              Identity Verification
            </p>

            {/* Capture Button */}
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              disabled={!modelsLoaded}
              className={`px-6 py-2 rounded-md font-medium transition 
                            ${
                              !modelsLoaded
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
            >
              {modelsLoaded ? "Capture Face" : "Loading..."}
            </button>

            {/* Success Message */}
            {faceDescriptor && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                ✓ Face verified successfully
              </div>
            )}
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="flex justify-center mt-2">
            <button
              type="submit"
              disabled={loading || !faceDescriptor}
              className={`w-full sm:w-[70%] px-7 py-3 text-white font-semibold text-md inter-font my-2 rounded-md flex items-center justify-center gap-2
                            ${loading || !faceDescriptor ? "bg-gray-400 cursor-not-allowed" : "bg-[#00263A] cursor-pointer hover:bg-[#001a28] transition"}`}
            >
              {loading && <ButtonSpinner size="sm" />}
              {loading ? "Signing Up..." : "Sign-Up"}
            </button>
          </div>
        </form>
        {showCamera && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] backdrop-blur-sm bg-black/40 px-4">
            <div className="bg-white p-7 rounded-2xl shadow-xl flex flex-col items-center gap-5 w-full max-w-md animate-in fade-in zoom-in duration-200">
              <div className="flex flex-col items-center gap-1 w-full mt-2">
                <h2 className="text-[24px] font-semibold text-[#00263A] inter-font">
                  Facial Registration
                </h2>
                <p className="text-gray-500 text-center text-[14px]">
                  Please look straight into the camera in a well-lit
                  environment.
                </p>
              </div>

              {/* Camera / Preview */}
              <div className="w-full h-[320px] bg-[#F8F9FA] rounded-xl overflow-hidden flex items-center justify-center border border-gray-200 shadow-inner">
                {!modelsLoaded && !capturedImage ? (
                  <div className="flex flex-col items-center gap-3">
                    <ButtonSpinner size="md" />
                    <p className="text-gray-400 text-sm font-medium">
                      Loading AI models...
                    </p>
                  </div>
                ) : !capturedImage ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <img
                    src={capturedImage}
                    alt="captured"
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                )}
              </div>

              {/* Buttons */}
              {!capturedImage ? (
                <button
                  type="button"
                  onClick={takePhoto}
                  disabled={!modelsLoaded}
                  className={`w-full py-3 rounded-lg font-semibold text-[15px] inter-font transition shadow-sm ${
                    !modelsLoaded
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#00263A] text-white hover:bg-[#001a28]"
                  }`}
                >
                  {modelsLoaded ? "Capture Photo" : "Please Wait..."}
                </button>
              ) : (
                <div className="flex gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setCapturedImage(null);
                      setFaceError("");
                      startVideo();
                    }}
                    disabled={detecting}
                    className="flex-1 py-3 bg-gray-100 text-[#00263A] font-semibold rounded-lg hover:bg-gray-200 transition border border-gray-200"
                  >
                    Retake
                  </button>
                  <button
                    type="button"
                    onClick={confirmFace}
                    disabled={detecting}
                    className="flex-1 py-3 bg-[#00263A] text-white font-semibold rounded-lg hover:bg-[#001a28] transition shadow-md flex justify-center items-center gap-2"
                  >
                    {detecting && <ButtonSpinner size="sm" />}
                    {detecting ? "Analyzing..." : "Confirm Face"}
                  </button>
                </div>
              )}

              {faceError && (
                <p className="text-red-500 text-sm text-center font-medium bg-red-50/80 w-full py-2.5 rounded-lg border border-red-100">
                  {faceError}
                </p>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowCamera(false);
                  stopVideo();
                  setCapturedImage(null);
                  setFaceError("");
                }}
                disabled={detecting}
                className="text-gray-400 text-sm hover:text-gray-700 underline underline-offset-2 mb-1 cursor-pointer transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* OTP Verification Modal */}
        <OTPModal
          email={userEmail}
          isOpen={showOTPModal}
          onVerify={handleOTPVerify}
          onClose={() => {
            setShowOTPModal(false);
            setForm({ name: "", email: "", password: "", jobTitle: "" });
            setFaceDescriptor(null);
          }}
        />
      </div>
    </div>
  );
};

export default GetStarted;
