// app/upload/page.tsx

"use client";

import { useState } from "react";
import { SwingAnalysis } from "@/types/analysis";
import CoachingReport from "@/components/CoachingReport";
import Link from "next/link";

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [shotType, setShotType] = useState<string>("forehand");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SwingAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setAnalysis(null); // Clear previous analysis
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze video. Please try again.";
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
        {/* Court Lines Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 right-0 h-1 bg-white"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-yellow-300 hover:text-yellow-200 text-sm mb-2 inline-block">
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
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN - Upload Section */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-white rounded-xl shadow-2xl p-8 border-4 border-green-600">
              <div className="space-y-6">
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
                    📱 Tip: 5-10 second clips work best. Phone camera quality is perfect!
                  </p>
                </div>

                {/* Shot Type Selector */}
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    What Shot Are You Hitting?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "forehand", emoji: "💪", label: "Forehand" },
                      { value: "backhand", emoji: "🤚", label: "Backhand" },
                      { value: "serve", emoji: "⬆️", label: "Serve" },
                      { value: "volley", emoji: "⚡", label: "Volley" },
                    ].map((shot) => (
                      <button
                        key={shot.value}
                        onClick={() => setShotType(shot.value)}
                        className={`p-4 rounded-lg border-2 font-bold transition-all
                          ${shotType === shot.value
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
                {videoPreview && !analysis && (
                  <div>
                    <label className="block text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-2xl">👀</span>
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
                  disabled={!selectedFile || isAnalyzing}
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
                      <span className="text-2xl">⚠️</span>
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
      </div>
    </div>
  );
}