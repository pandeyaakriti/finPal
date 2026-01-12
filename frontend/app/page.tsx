//frontend/app/page.tsx
"use client";
import React from "react";
import { TrendingUp, PieChart, Sparkles, ArrowRight, Shield, Zap, Brain, Target, Lightbulb, Rocket, Link as LinkIcon, Maximize } from "lucide-react";
import Image from "next/image";

export default function Page() {
  const scrollToGetStarted = () => {
    document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-gray-50 font-sans">
      {/* Hero Section */}
      <div className="flex min-h-screen w-full items-center justify-center px-4 py-20">
        <main className="w-full max-w-6xl">
          <div className="text-center mb-32">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] text-white px-5 py-2.5 rounded-full text-sm font-semibold mb-8 shadow-lg hover:shadow-xl transition-shadow">
              <Sparkles className="w-4 h-4" />
              AI-Powered Financial Intelligence
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 text-gray-900 leading-tight">
              Your Personal <span className="text-[#5B6F70]">Finance Agent</span>
              <br />
              <span className="text-gray-900">That Learns</span>
            </h1>
            
            <p className="text-gray-500 text-lg sm:text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
              finPal autonomously analyzes your spending, detects emotional patterns,
              <br />
              and provides actionable insights. Its not a dashboard,
              <br />
              its an AI advisor that plans and acts for you.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => window.location.href = '/signup'} 
                className="bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] hover:from-[#7B8CA5] hover:to-[#5BB88A] hover:scale-105 text-white font-semibold py-3.5 px-10 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={scrollToGetStarted}
                className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3.5 px-10 rounded-lg border-2 border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg transition-all">
                How it works?
              </button>
            </div>
          </div>

          {/* The Agentic Loop Section */}
          <div className="mb-32">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                The Agentic Loop
              </h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                finPal operates through five intelligent stages to understand and optimize your finances
              </p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Perceive */}
              <div className="bg-white rounded-2xl shadow-md hover:shadow-xl p-6 border border-gray-100 hover:border-[#90A1B9]/30 transition-all group">
              <div className="bg-linear-to-br from-gray-50 to-gray-100 group-hover:from-[#90A1B9] group-hover:to-[#7AD1A6] w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all">
              <Brain className="w-7 h-7 text-gray-700 group-hover:text-gray-700 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Perceive
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Ingests transaction data from eSewa, Khalti, and digital wallets
                </p>
              </div>

              {/* Reason */}
              <div className="bg-white rounded-2xl shadow-md hover:shadow-xl p-6 border border-gray-100 hover:border-[#90A1B9]/30 transition-all group">
              <div className="bg-linear-to-br from-gray-50 to-gray-100 group-hover:from-[#90A1B9] group-hover:to-[#7AD1A6] w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all">
              <TrendingUp className="w-7 h-7 text-gray-700 group-hover:text-gray-700 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Reason
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Classifies expenses and detects spending patterns automatically
                </p>
              </div>

              {/* Plan */}
              <div className="bg-white rounded-2xl shadow-md hover:shadow-xl p-6 border border-gray-100 hover:border-[#90A1B9]/30 transition-all group">
              <div className="bg-linear-to-br from-gray-50 to-gray-100 group-hover:from-[#90A1B9] group-hover:to-[#7AD1A6] w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all">
              <Target className="w-7 h-7 text-gray-700 group-hover:text-gray-700 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Plan
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Calculates optimized budgets aligned with your goals
                </p>
              </div>

              {/* Act */}
              <div className="bg-white rounded-2xl shadow-md hover:shadow-xl p-6 border border-gray-100 hover:border-[#90A1B9]/30 transition-all group">
              <div className="bg-linear-to-br from-gray-50 to-gray-100 group-hover:from-[#90A1B9] group-hover:to-[#7AD1A6] w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all">
              <Zap className="w-7 h-7 text-gray-700 group-hover:text-gray-700 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Act
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Generates insights, alerts, and next-month recommendations
                </p>
              </div>

              {/* Reflect */}
              <div className="bg-white rounded-2xl shadow-md hover:shadow-xl p-6 border border-gray-100 hover:border-[#90A1B9]/30 transition-all group">
              <div className="bg-linear-to-br from-gray-50 to-gray-100 group-hover:from-[#90A1B9] group-hover:to-[#7AD1A6] w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all">
                <Brain className="w-7 h-7 text-gray-700 group-hover:text-gray-700 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Reflect
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Adapts logic based on feedback and new trends
                </p>
              </div>
            </div>
          </div>

          {/* Get Started Section */}
          <div id="get-started" className="mb-24 scroll-mt-20"> 
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-700 mb-4">
                Get Started in Minutes
              </h2>
              <p className="text-gray-500 text-lg">
                Your AI financial agent is ready to work for you
              </p>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Step 1 */}
              <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl p-8 border border-gray-100 relative transition-all hover:-translate-y-1 group">
                <div className="absolute -top-5 -right-5 bg-linear-to-br from-[#90A1B9] to-[#7AD1A6] text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                  01
                </div>
                <div className="bg-linear-to-br from-[#90A1B9]/10 to-[#7AD1A6]/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <LinkIcon className="w-8 h-8 text-[#5B6F70]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Connect Your Accounts
                </h3>
                <p className="text-gray-500 leading-relaxed text-base">
                  Securely link your bank accounts, credit cards, and investment platforms in seconds.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl p-8 border border-gray-100 relative transition-all hover:-translate-y-1 group">
                <div className="absolute -top-5 -right-5 bg-linear-to-br from-[#90A1B9] to-[#7AD1A6] text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                  02
                </div>
                <div className="bg-linear-to-br from-[#90A1B9]/10 to-[#7AD1A6]/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Maximize className="w-8 h-8 text-[#5B6F70]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  AI Analyzes Everything
                </h3>
                <p className="text-gray-500 leading-relaxed text-base">
                  Our AI scans your financial data, learns your patterns, and identifies opportunities.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl p-8 border border-gray-100 relative transition-all hover:-translate-y-1 group">
                <div className="absolute -top-5 -right-5 bg-linear-to-br from-[#90A1B9] to-[#7AD1A6] text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                  03
                </div>
                <div className="bg-linear-to-br from-[#90A1B9]/10 to-[#7AD1A6]/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="w-8 h-8 text-[#5B6F70]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Get Smart Recommendations
                </h3>
                <p className="text-gray-500 leading-relaxed text-base">
                  Receive personalized insights and automated actions tailored to your financial goals.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl p-8 border border-gray-100 relative transition-all hover:-translate-y-1 group">
                <div className="absolute -top-5 -right-5 bg-linear-to-br from-[#90A1B9] to-[#7AD1A6] text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                  04
                </div>
                <div className="bg-linear-to-br from-[#90A1B9]/10 to-[#7AD1A6]/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Rocket className="w-8 h-8 text-[#5B6F70]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Watch Your Wealth Grow
                </h3>
                <p className="text-gray-500 leading-relaxed text-base">
                  Sit back as your AI agent optimizes your finances and maximizes your savings.
                </p>
              </div>
            </div>
          </div>

          {/* Final CTA Section */}
          <div className="bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] rounded-3xl shadow-2xl p-14 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/5 rounded-full translate-x-20 translate-y-20"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-5">
                Ready to Master Your Finances?
              </h2>
              <p className="text-gray-200 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands using finPal to understand and optimize their spending behavior with AI-powered insights.
              </p>
              <button 
                onClick={() => window.location.href = '/signup'}
                className="bg-white hover:bg-gray-50 text-[#4a5c5e] font-bold py-4 px-12 rounded-xl shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-3 text-lg hover:scale-105"
              >
                Start Your Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}