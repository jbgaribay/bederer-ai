// app/upload/page.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { SwingAnalysis } from "@/types/analysis";
import CoachingReport from "@/components/CoachingReport";
import SwingHistory from "@/components/SwingHistory";
import { useSwingHistory } from "@/hooks/useSwingHistory";
import Link from "next/link";

const LOADING_STEPS = [
  { label: "Uploading video", duration: 3000 },
  { label: "Extracting frames", duration: 8000 },
  { label: "AI analyzing technique", duration: 15000 },
  { label: "Generating your report", duration: 99999 }, // stays until done
];

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [shotType, setShotType] = useState<string>("forehand");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SwingAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"analyze" | "history">("analyze");
  const [savedConfirm, setSavedConfirm] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stepTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const { history, saveSwing, clearHistory } = useSwingHistory();

  const MAX_FILE_SIZE_MB = 500;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Advance loading steps on a timer while analyzing
  useEffect(() => {
    if (isAnalyzing) {
      setLoadingStep(0);
      let elapsed = 0;
      LOADING_STEPS.slice(0, -1).forEach((step, i) => {
        elapsed += step.duration;
        const t = setTimeout(() => setLoadingStep(i + 1), elapsed);
        stepTimers.current.push(t);
      });
    } else {
      stepTimers.current.forEach(clearTimeout);
      stepTimers.current = [];
    }
    return () => {
      stepTimers.current.forEach(clearTimeout);
    };
  }, [isAnalyzing]);

  const validateAndSetFile = (file: File, inputEl?: HTMLInputElement) => {
    setFileError(null);

    if (!file.type.startsWith("video/")) {
      setFileError(
        "That doesn't look like a video file. Please upload an MP4, MOV, or similar video format."
      );
      if (inputEl) inputEl.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(
        `File is too large (${formatFileSize(file.size)}). Please upload a video under ${MAX_FILE_SIZE_MB}MB. Try trimming your clip to 5–15 seconds.`
      );
      if (inputEl) inputEl.value = "";
      return;
    }

    setSelectedFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setAnalysis(null);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file, e.target);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("video", selectedFile);
      formData.append("shotType", shotType);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const result: SwingAnalysis = await response.json();
      setAnalysis(result);
      saveSwing(result);
      setSavedConfirm(true);
      setTimeout(() => setSavedConfirm(false), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to analyze video. Please try again.";
      setError(errorMessage);
      console.error("Full error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-gray-50 to-green-100">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-green-800 to-green-700 text-white py-8 mb-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 right-0 h-1 bg-white"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <Link
              href="/"
              className="text-yellow-300 hover:text-yellow-200 text-sm mb-2 inline-block"
            >
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
              <span className="text-3xl">🎾</span>
              Bederer AI
            </h1>
            <p className="text-green-100">
              Upload your swing and get instant AI coaching feedback
            </p>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex gap-2 bg-white rounded-xl shadow p-1.5 border-2 border-green-200 w-fit">
          <button
            onClick={() => setActiveTab("analyze")}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
              activeTab === "analyze"
                ? "bg-green-600 text-white shadow"
                : "text-gray-600 hover:text-green-700 hover:bg-green-50"
            }`}
          >
            Analyze Swing
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === "history"
                ? "bg-green-600 text-white shadow"
                : "text-gray-600 hover:text-green-700 hover:bg-green-50"
            }`}
          >
           My Swings
            {history.length > 0 && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-black ${
                  activeTab === "history"
                    ? "bg-white text-green-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {history.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {activeTab === "history" ? (
          <SwingHistory history={history} onClear={clearHistory} />
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* LEFT COLUMN - Upload */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <div className="bg-white rounded-xl shadow-2xl p-8 border-4 border-green-600">
                <div className="space-y-6">

                  {/* Drag & Drop Zone */}
                  <div>
                    <label className="block text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-2xl"></span>
                      Upload Your Swing Video
                    </label>

                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative cursor-pointer rounded-xl border-4 border-dashed p-8 text-center transition-all duration-200
                        ${isDragOver
                          ? "border-green-500 bg-green-50 scale-[1.02]"
                          : selectedFile && !fileError
                          ? "border-green-400 bg-green-50"
                          : "border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50"
                        }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {isDragOver ? (
                        <>
                          <div className="text-5xl mb-3">🎯</div>
                          <p className="text-green-700 font-black text-lg">Drop it!</p>
                        </>
                      ) : selectedFile && !fileError ? (
                        <>
                          <div className="text-4xl mb-2"></div>
                          <p className="font-bold text-green-800 text-sm truncate px-4">
                            {selectedFile.name}
                          </p>
                          <p className="text-green-600 text-xs mt-1">
                            {formatFileSize(selectedFile.size)} · Click to change
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="text-5xl mb-3"></div>
                          <p className="font-black text-gray-700 text-base">
                            Drag & drop your video here
                          </p>
                          <p className="text-gray-400 text-sm mt-1">or click to browse files</p>
                          <p className="text-gray-400 text-xs mt-3">
                            MP4, MOV, AVI · Max 500MB
                          </p>
                        </>
                      )}
                    </div>

                    {/* File validation error */}
                    {fileError && (
                      <div className="mt-3 bg-red-50 border-2 border-red-300 text-red-800 px-4 py-3 rounded-lg text-sm font-medium flex items-start gap-2">
                        <span className="text-lg leading-none mt-0.5">⚠️</span>
                        <span>{fileError}</span>
                      </div>
                    )}

                    <p className="mt-2 text-sm text-gray-500">
                      Tip: 5–10 second clips work best. Phone camera quality is perfect!
                    </p>
                  </div>

                  {/* Shot Type Selector */}
                  <div>
                    <label className="block text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-2xl"></span>
                      What Shot Are You Hitting?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "forehand", label: "Forehand" },
                        { value: "backhand",  label: "Backhand" },
                        { value: "serve",  label: "Serve" },
                        { value: "volley",  label: "Volley" },
                      ].map((shot) => (
                        <button
                          key={shot.value}
                          onClick={() => setShotType(shot.value)}
                          className={`p-4 rounded-lg border-2 font-bold transition-all
                            ${
                              shotType === shot.value
                                ? "bg-green-600 text-white border-green-700 shadow-lg scale-105"
                                : "bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50"
                            }`}
                        >
                          <div className="text-2xl mb-1">{shot.emoji}</div>
                          <div className="text-sm">{shot.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Video Preview */}
                  {videoPreview && (
                    <div>
                      <label className="block text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-2xl"></span>
                        Preview
                      </label>
                      <video
                        src={videoPreview}
                        controls
                        className="w-full rounded-lg shadow-lg border-4 border-green-200 max-h-96"
                      />
                    </div>
                  )}

                  {/* Analyze Button */}
                  <button
                    onClick={handleAnalyze}
                    disabled={!selectedFile || isAnalyzing || !!fileError}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-black text-lg
                      hover:from-green-700 hover:to-green-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
                      transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-[1.02]
                      border-4 border-green-800 disabled:border-gray-500"
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg
                          className="animate-spin h-6 w-6 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Analyzing Your Swing...</span>
                        <span className="text-2xl animate-bounce">🎾</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>Analyze My Swing</span>
                        <span className="text-2xl"></span>
                      </span>
                    )}
                  </button>

                  {/* Saved confirmation */}
                  {savedConfirm && (
                    <div className="bg-green-50 border-2 border-green-300 text-green-800 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
                      <span>✅</span>
                      <span>Swing saved to your history!</span>
                    </div>
                  )}

                  {/* Analysis error */}
                  {error && (
                    <div className="bg-red-50 border-4 border-red-300 text-red-800 px-6 py-4 rounded-lg font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">⚠️</span>
                        <span>{error}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - Results / Loading */}
            <div>
              {isAnalyzing ? (
                /* Loading Steps Panel */
                <div className="bg-white rounded-xl shadow-2xl p-10 border-4 border-green-600">
                  <div className="text-center mb-8">
                    <div className="text-5xl mb-3 animate-bounce">🎾</div>
                    <h3 className="text-2xl font-black text-gray-900">
                      Coaching in Progress
                    </h3>
                    <p className="text-gray-500 mt-1 text-sm">This usually takes 20–30 seconds</p>
                  </div>

                  <div className="space-y-4">
                    {LOADING_STEPS.map((step, i) => {
                      const isDone = i < loadingStep;
                      const isActive = i === loadingStep;

                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-500
                            ${isDone ? "border-green-300 bg-green-50" : ""}
                            ${isActive ? "border-green-500 bg-green-50 shadow-md" : ""}
                            ${!isDone && !isActive ? "border-gray-200 bg-gray-50 opacity-40" : ""}
                          `}
                        >
                          {/* Icon */}
                          <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                            {isDone ? (
                              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <circle cx="12" cy="12" r="10" className="fill-green-100 stroke-green-400" strokeWidth={1.5} />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 13l3 3 7-7" />
                              </svg>
                            ) : isActive ? (
                              <svg className="animate-spin w-7 h-7 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : (
                              <div className="w-7 h-7 rounded-full border-2 border-gray-300 bg-white" />
                            )}
                          </div>

                          {/* Label */}
                          <span
                            className={`font-bold text-base ${
                              isDone ? "text-green-700" : isActive ? "text-green-900" : "text-gray-400"
                            }`}
                          >
                            {step.label}
                            {isActive && (
                              <span className="ml-1 inline-flex gap-0.5">
                                <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                                <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                                <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : analysis ? (
                <CoachingReport analysis={analysis} />
              ) : (
                <div className="bg-white rounded-xl shadow-2xl p-12 border-4 border-dashed border-green-300 text-center">
                  <div className="text-6xl mb-4">🎾</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Your Coaching Report Will Appear Here
                  </h3>
                  <p className="text-gray-600">
                    Upload a video and click "Analyze My Swing" to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}