"use client";

import { useState } from "react";
import { SwingAnalysis } from "@/types/analysis";
import CoachingReport from "@/components/CoachingReport";
import SwingHistory from "@/components/SwingHistory";
import { useSwingHistory } from "@/hooks/useSwingHistory";
import Link from "next/link";

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [shotType, setShotType] = useState<string>("forehand");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SwingAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"analyze" | "history">("analyze");
  const [savedConfirm, setSavedConfirm] = useState(false);

  const { history, saveSwing, clearHistory } = useSwingHistory();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setAnalysis(null);
      setError(null);
    }
  };

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
      {/* Header with Court Lines */}
      <div className="relative bg-gradient-to-r from-green-800 to-green-700 text-white py-8 mb-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 right-0 h-1 bg-white"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/"
                className="text-yellow-300 hover:text-yellow-200 text-sm mb-2 inline-block"
              >
                ← Back to Home
              </Link>
              <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                <span className="text-3xl">🎾</span>
                SwingCoach AI
              </h1>
              <p className="text-green-100">
                Upload your swing and get instant AI coaching feedback
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setActiveTab("analyze")}
              className={`px-6 py-2 rounded-lg font-black text-sm transition-all ${
                activeTab === "analyze"
                  ? "bg-yellow-400 text-green-900"
                  : "bg-green-700 text-green-100 hover:bg-green-600"
              }`}
            >
               Analyze Swing
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-2 rounded-lg font-black text-sm transition-all flex items-center gap-2 ${
                activeTab === "history"
                  ? "bg-yellow-400 text-green-900"
                  : "bg-green-700 text-green-100 hover:bg-green-600"
              }`}
            >
               My Swings
              {history.length > 0 && (
                <span className="bg-green-900 text-yellow-300 text-xs font-black px-2 py-0.5 rounded-full">
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {activeTab === "history" ? (
          <SwingHistory history={history} onClear={clearHistory} />
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* LEFT COLUMN - Upload Section */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <div className="bg-white rounded-xl shadow-2xl p-8 border-4 border-green-600">
                <div className="space-y-6">
                  {/* Saved confirmation */}
                  {savedConfirm && (
                    <div className="bg-green-50 border-2 border-green-400 text-green-800 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Saved to My Swings
                    </div>
                  )}

                  {/* File Upload */}
                  <div>
                    <label className="block text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-2xl">📹</span>
                      Upload Your Swing Video
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-700
                        file:mr-4 file:py-3 file:px-6
                        file:rounded-lg file:border-2
                        file:text-sm file:font-bold
                        file:bg-green-50 file:text-green-800
                        file:border-green-600
                        hover:file:bg-green-100
                        cursor-pointer
                        border-2 border-dashed border-gray-300 rounded-lg p-4
                        hover:border-green-500 transition-colors"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                       Tip: 5-10 second clips work best. Phone camera quality
                      is perfect!
                    </p>
                  </div>

                  {/* Video Preview */}
                  {videoPreview && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                        Preview
                      </label>
                      <video
                        src={videoPreview}
                        controls
                        className="w-full rounded-lg border-4 border-green-600 shadow-md"
                      />
                    </div>
                  )}

                  {/* Shot Type Selector */}
                  <div>
                    <label className="block text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-2xl"></span>
                      Shot Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "forehand",
                        "backhand",
                        "serve",
                        "volley",
                        "overhead",
                        "slice",
                      ].map((shot) => (
                        <button
                          key={shot}
                          onClick={() => setShotType(shot)}
                          className={`py-2 px-4 rounded-lg border-2 font-bold text-sm capitalize transition-all ${
                            shotType === shot
                              ? "bg-green-600 text-white border-green-600"
                              : "bg-white text-gray-700 border-gray-300 hover:border-green-500"
                          }`}
                        >
                          {shot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Analyze Button */}
                  <button
                    onClick={handleAnalyze}
                    disabled={!selectedFile || isAnalyzing}
                    className="w-full py-4 px-8 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black text-lg rounded-xl border-4 border-green-800 disabled:border-gray-400 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg
                          className="animate-spin h-6 w-6 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Analyzing Your Swing...</span>
                        <span className="text-2xl animate-bounce">🎾</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>Analyze My Swing</span>
                        <span className="text-2xl">🚀</span>
                      </span>
                    )}
                  </button>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border-4 border-red-300 text-red-800 px-6 py-4 rounded-lg font-medium">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-6 h-6 text-red-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                          />
                        </svg>
                        <span>{error}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - Results Section */}
            <div>
              {analysis ? (
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