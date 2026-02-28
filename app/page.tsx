// app/page.tsx

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Tennis Court Inspired */}
      <section className="relative bg-gradient-to-br from-green-800 via-green-700 to-green-900 text-white overflow-hidden">
        {/* Court Lines Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 right-0 h-1 bg-white"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white"></div>
          <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-white"></div>
          <div className="absolute top-1/3 left-0 right-0 h-px bg-white"></div>
          <div className="absolute top-2/3 left-0 right-0 h-px bg-white"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            {/* Tennis Ball Accent */}
            <div className="inline-block mb-6 text-6xl animate-bounce">
              🎾
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
              Your Personal AI Tennis Coach
              <span className="block text-yellow-300 mt-2">
                On your computer
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto font-light">
              Upload your swing. Get instant, expert coaching feedback powered by AI.
              <span className="block mt-2 text-green-200">
                No $150/hour coach needed.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/upload"
                className="bg-yellow-400 text-green-900 px-8 py-4 rounded-lg text-lg font-bold 
                  hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-lg
                  border-4 border-yellow-500"
              >
                Analyze My Swing Now →
              </Link>
              <div className="text-green-200 text-sm">
                ✓ Free to try • ✓ No signup required
              </div>
            </div>
          </div>
        </div>

        {/* Court Net Bottom Border */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-white opacity-30"></div>
      </section>

      {/* How It Works - Court Flow */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Three Steps to Better Tennis
            </h2>
            <p className="text-xl text-gray-600">
              It's faster than booking a lesson
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white rounded-xl p-8 shadow-xl border-4 border-green-600 hover:border-yellow-400 transition-colors">
                <div className="absolute -top-6 left-8 bg-green-700 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                  1
                </div>
                <div className="text-5xl mb-4 mt-2"></div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Record Your Swing
                </h3>
                <p className="text-gray-600">
                  Just 5-10 seconds of video. Forehand, backhand, serve, or volley.
                  Phone camera works perfectly.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white rounded-xl p-8 shadow-xl border-4 border-green-600 hover:border-yellow-400 transition-colors">
                <div className="absolute -top-6 left-8 bg-green-700 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                  2
                </div>
                <div className="text-5xl mb-4 mt-2"></div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  AI Analyzes
                </h3>
                <p className="text-gray-600">
                  Our AI examines your stance, swing path, contact point, follow-through,
                  and footwork in seconds.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white rounded-xl p-8 shadow-xl border-4 border-green-600 hover:border-yellow-400 transition-colors">
                <div className="absolute -top-6 left-8 bg-green-700 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                  3
                </div>
                <div className="text-5xl mb-4 mt-2"></div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Get Your Report
                </h3>
                <p className="text-gray-600">
                  Detailed scores, specific tips, and drills to fix your biggest weakness.
                  Actionable, not generic.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Exists - The Problem */}
      <section className="py-20 bg-green-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 50px, white 50px, white 51px)',
          }}></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black mb-6">
            Tennis Coaching Costs $50-150 Per Hour
          </h2>
          <p className="text-2xl text-green-100 mb-8 font-light">
            Most players can't afford weekly lessons. YouTube videos are too generic.
            You need feedback on <span className="text-yellow-300 font-bold italic">your</span> swing.
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-green-800 bg-opacity-50 rounded-lg p-6 border-2 border-green-600">
              <div className="text-3xl mb-3"></div>
              <h3 className="font-bold text-lg mb-2">10x Cheaper</h3>
              <p className="text-green-200 text-sm">
                Get expert analysis for the cost of a coffee, not a lesson.
              </p>
            </div>
            <div className="bg-green-800 bg-opacity-50 rounded-lg p-6 border-2 border-green-600">
              <div className="text-3xl mb-3"></div>
              <h3 className="font-bold text-lg mb-2">Instant Feedback</h3>
              <p className="text-green-200 text-sm">
                No scheduling, no driving to the court. Results in 30 seconds.
              </p>
            </div>
            <div className="bg-green-800 bg-opacity-50 rounded-lg p-6 border-2 border-green-600">
              <div className="text-3xl mb-3"></div>
              <h3 className="font-bold text-lg mb-2">Specific to You</h3>
              <p className="text-green-200 text-sm">
                Not generic tips. Analyzes YOUR stance, YOUR contact point, YOUR form.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get - Example Report Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              What Your Report Looks Like
            </h2>
            <p className="text-xl text-gray-600">
              Real feedback. Actionable tips. No fluff.
            </p>
          </div>

          {/* Mock Report Preview */}
          <div className="bg-white rounded-xl shadow-2xl p-8 border-4 border-green-600">
            <div className="text-center border-b pb-6 mb-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                Your Coaching Report
              </h3>
              <p className="text-gray-600">Forehand Analysis</p>
              <div className="mt-4">
                <div className="text-5xl font-bold text-green-600">8.2</div>
                <div className="text-sm text-gray-500 mt-1">Overall Score</div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Example Category */}
              <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl"></span>
                    <h4 className="font-bold text-lg text-green-900">Contact Point</h4>
                  </div>
                  <div className="text-2xl font-bold text-green-600">9/10</div>
                </div>
                <p className="text-sm mb-2 italic text-gray-700">
                  <span className="font-semibold">Observation:</span> Excellent contact position
                  in front of the body with full extension through the ball.
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Tip:</span> Try making contact 2 inches
                  earlier to add more control on faster balls.
                </p>
              </div>

              {/* Example Warning */}
              <div className="border-2 border-yellow-300 bg-yellow-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl"></span>
                    <h4 className="font-bold text-lg text-green-900">Follow-Through</h4>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">6/10</div>
                </div>
                <p className="text-sm mb-2 italic text-gray-700">
                  <span className="font-semibold">Observation:</span> Finish is cutting short,
                  limiting topspin generation.
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold"> Tip:</span> Let your racket finish over
                  your opposite shoulder to maximize spin and consistency.
                </p>
              </div>
            </div>

            <div className="mt-6 bg-green-50 border-2 border-green-600 rounded-lg p-6">
              <h3 className="text-lg font-bold text-green-900 mb-2 flex items-center gap-2">
                Top Priority
              </h3>
              <p className="text-green-800">
                Focus on extending your follow-through - this will immediately improve
                topspin and control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Court Inspired */}
      <section className="relative bg-gradient-to-br from-yellow-400 via-yellow-300 to-orange-400 py-20 overflow-hidden">
        {/* Tennis Ball Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-6xl">🎾</div>
          <div className="absolute top-40 right-20 text-6xl">🎾</div>
          <div className="absolute bottom-20 left-1/4 text-6xl">🎾</div>
          <div className="absolute bottom-10 right-1/3 text-6xl">🎾</div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-black text-green-900 mb-6">
            Ready to Level Up Your Game?
          </h2>
          <p className="text-2xl text-green-800 mb-8 font-medium">
            Upload a swing. Get pro-level feedback in 30 seconds.
          </p>
          <Link
            href="/upload"
            className="inline-block bg-green-800 text-white px-12 py-5 rounded-xl text-xl font-bold 
              hover:bg-green-900 transition-all transform hover:scale-105 shadow-2xl
              border-4 border-green-900"
          >
            Analyze My Swing Now 
          </Link>
          <p className="mt-6 text-green-700 font-medium">
            No credit card. No signup. Just upload and go.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-950 text-green-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-semibold mb-2">SwingCoach AI</p>
          <p className="text-sm text-green-300">
            Built for tennis players who want to improve without breaking the bank.
          </p>
        </div>
      </footer>
    </div>
  );
}