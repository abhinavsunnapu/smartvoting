import React, { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Context/ToastContext";
import API_ENDPOINTS from "../config/api";
import { ButtonSpinner } from "./Spinners";

const FaceVerificationModal = ({ isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();
  const { error: showError, success } = useToast();

  const videoRef = useRef(null);
  const [faceError, setFaceError] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      stopVideo();
      setCapturedImage(null);
      setFaceError("");
      return;
    }

    const loadModels = async () => {
      const MODEL_URL = "/models";
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
        startVideo();
      } catch (error) {
        setFaceError("Failed to load models");
      }
    };

    if (!modelsLoaded) {
      loadModels();
    } else {
      startVideo();
    }

    return () => {
      stopVideo();
    };
  }, [isOpen]);

  const startVideo = async () => {
    try {
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
      setFaceError("Unable to access camera. Please allow camera permissions.");
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
    videoRef.current.pause();
  };

  const verifyFace = async () => {
    if (!modelsLoaded || !capturedImage) return;

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
        setFaceError(
          "Face not detected. Please retake photo plainly facing the camera.",
        );
        return;
      }

      const faceDescriptor = Array.from(detection.descriptor);

      setVerifying(true);
      const res = await fetch(API_ENDPOINTS.AUTH_VERIFY_FACE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ faceDescriptor }),
      });

      setVerifying(false);

      // Handle non-JSON responses
      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        setFaceError("Server error: Invalid response from server.");
        return;
      }

      if (res.ok && data.success) {
        success("Identity verified successfully!");
        onSuccess();
      } else {
        setFaceError(
          data.message || "Identity verification failed. Not a match.",
        );
      }
    } catch (error) {
      console.error(error);
      setDetecting(false);
      setVerifying(false);
      setFaceError("Error verifying face. Server might be unreachable.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] backdrop-blur-sm bg-black/40 px-4">
      <div className="bg-white p-7 rounded-2xl shadow-xl flex flex-col items-center gap-5 w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center gap-1 w-full mt-2">
          <h2 className="text-[24px] font-semibold text-[#00263A] inter-font">
            Security Verification
          </h2>
          <p className="text-gray-500 text-center text-[14px]">
            Please verify your identity using facial recognition to confirm your
            vote.
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
              disabled={verifying || detecting}
              className="flex-1 py-3 bg-gray-100 text-[#00263A] font-semibold rounded-lg hover:bg-gray-200 transition border border-gray-200"
            >
              Retake
            </button>
            <button
              type="button"
              onClick={verifyFace}
              disabled={verifying || detecting}
              className="flex-1 py-3 bg-[#00263A] text-white font-semibold rounded-lg hover:bg-[#001a28] transition shadow-md flex justify-center items-center gap-2"
            >
              {(verifying || detecting) && <ButtonSpinner size="sm" />}
              {verifying
                ? "Verifying..."
                : detecting
                  ? "Analyzing..."
                  : "Authenticate"}
            </button>
          </div>
        )}

        {faceError && (
          <p className="text-red-500 text-sm text-center font-medium bg-red-50/80 w-full py-2.5 rounded-lg border border-red-100">
            {faceError}
          </p>
        )}

        <button
          onClick={onClose}
          disabled={verifying || detecting}
          className="text-gray-400 text-sm hover:text-gray-700 underline underline-offset-2 mb-1 cursor-pointer transition disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default FaceVerificationModal;
