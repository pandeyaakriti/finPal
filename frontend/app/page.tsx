"use client";
import React from "react";
import { TrendingUp, PieChart, Sparkles, ArrowRight, Shield, Zap, Brain, Target, Lightbulb, Rocket, Link as LinkIcon, Maximize, CheckCircle, Users, Award, BarChart3 } from "lucide-react";
import Image from "next/image";

export default function Page() {
  const scrollToGetStarted = () => {
    document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="finPal Logo" width={40} height={40} className="w-10 h-10" />
              <span className="text-2xl font-bold text-[#5B6F70]">finPal</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-[#7AD1A6] font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-[#7AD1A6] font-medium transition-colors">How it Works</a>
              <a href="#get-started" className="text-gray-600 hover:text-[#7AD1A6] font-medium transition-colors">Get Started</a>
              <button 
                onClick={() => window.location.href = '/login'}
                className="text-gray-600 hover:text-[#7AD1A6] font-medium transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => window.location.href = '/signup'}
                className="bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] text-white font-semibold px-6 py-2.5 rounded-lg hover:shadow-lg transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] text-white px-5 py-2.5 rounded-full text-sm font-semibold mb-8 shadow-lg hover:shadow-xl transition-shadow">
              <Sparkles className="w-4 h-4" />
              AI powered Financial Intelligence
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-gray-900 leading-tight">
              Your Personal <span className="bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] bg-clip-text text-transparent">Finance Agent</span>
              <br />
              <span className="text-gray-900">That Learns & Adapts</span>
            </h1>
            
            <p className="text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
              finPal autonomously analyzes your spending, detects emotional patterns,
              and provides actionable insights. It's not just a dashboard—
              it's an AI advisor that plans and acts for you.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button 
                onClick={() => window.location.href = '/signup'} 
                className="bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] hover:shadow-xl text-white font-semibold py-4 px-8 rounded-xl transition-all flex items-center gap-2 text-lg group">
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={scrollToGetStarted}
                className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-8 rounded-xl border-2 border-gray-200 hover:border-[#90A1B9] transition-all text-lg">
                See How It Works
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* The Agentic Loop Section */}
      <section id="features" className="py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              HOW IT WORKS
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              The Agentic Loop
            </h2>
            <p className="text-gray-600 text-xl max-w-3xl mx-auto">
              finPal operates through five intelligent stages to understand and optimize your finances
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
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
      </section>

      {/* Key Features Section */}
      <section className="py-24 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              FEATURES
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-gray-600 text-xl max-w-3xl mx-auto">
              Powerful features designed to give you complete control over your finances
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl p-6 border border-gray-100 hover:border-[#90A1B9]/30 transition-all group">
              <div className="bg-linear-to-br from-gray-50 to-gray-100 group-hover:from-[#90A1B9] group-hover:to-[#7AD1A6] w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all">
                <Shield className="w-7 h-7 text-gray-700 group-hover:text-gray-700 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Security
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Your data is encrypted with 256-bit encryption and stored securely. We never share your information.

                </p>
              </div>

            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl p-6 border border-gray-100 hover:border-[#90A1B9]/30 transition-all group">
              <div className="bg-linear-to-br from-gray-50 to-gray-100 group-hover:from-[#90A1B9] group-hover:to-[#7AD1A6] w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all">
                <BarChart3 className="w-7 h-7 text-gray-700 group-hover:text-gray-700 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Smart Analytics
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                Get detailed insights into your spending patterns with AI-powered categorization and predictions.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl p-6 border border-gray-100 hover:border-[#90A1B9]/30 transition-all group">
              <div className="bg-linear-to-br from-gray-50 to-gray-100 group-hover:from-[#90A1B9] group-hover:to-[#7AD1A6] w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all">
                <Target className="w-7 h-7 text-gray-700 group-hover:text-gray-700 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Goal Tracking
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                Set financial goals and let finPal create a personalized plan to help you achieve them faster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section id="get-started" className="py-10 px-30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              GET STARTED
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Launch in Minutes
            </h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
              Your AI financial agent is ready to work for you in just four simple steps
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-linear-to-br from-[#90A1B9] to-[#7AD1A6] rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg z-10">
                01
              </div>
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-10 pt-14 border border-gray-100 transition-all hover:-translate-y-1">
                <div className="bg-linear-to-br from-[#90A1B9]/10 to-[#7AD1A6]/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <LinkIcon className="w-8 h-8 text-[#5B6F70]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Connect Your Accounts
                </h3>
                <p className="text-gray-600 leading-relaxed text-base">
                  Securely link your eSewa, Khalti, bank accounts, and credit cards in seconds with our secure API integration.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-linear-to-br from-[#90A1B9] to-[#7AD1A6] rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg z-10">
                02
              </div>
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-10 pt-14 border border-gray-100 transition-all hover:-translate-y-1">
                <div className="bg-linear-to-br from-[#90A1B9]/10 to-[#7AD1A6]/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <Brain className="w-8 h-8 text-[#5B6F70]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  AI Analyzes Everything
                </h3>
                <p className="text-gray-600 leading-relaxed text-base">
                  Our AI scans your financial data, learns your spending patterns, and identifies opportunities for optimization.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-linear-to-br from-[#90A1B9] to-[#7AD1A6] rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg z-10">
                03
              </div>
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-10 pt-14 border border-gray-100 transition-all hover:-translate-y-1">
                <div className="bg-linear-to-br from-[#90A1B9]/10 to-[#7AD1A6]/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <Lightbulb className="w-8 h-8 text-[#5B6F70]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Get Smart Recommendations
                </h3>
                <p className="text-gray-600 leading-relaxed text-base">
                  Receive personalized insights, alerts, and automated actions tailored to your unique financial goals.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-linear-to-br from-[#90A1B9] to-[#7AD1A6] rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg z-10">
                04
              </div>
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-10 pt-14 border border-gray-100 transition-all hover:-translate-y-1">
                <div className="bg-linear-to-br from-[#90A1B9]/10 to-[#7AD1A6]/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <Rocket className="w-8 h-8 text-[#5B6F70]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Watch Your Wealth Grow
                </h3>
                <p className="text-gray-600 leading-relaxed text-base">
                  Sit back as your AI agent continuously optimizes your finances and maximizes your savings potential.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Final CTA Section */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] rounded-3xl shadow-2xl p-16 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-20 -translate-y-20"></div>
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-white/10 rounded-full translate-x-28 translate-y-28"></div>
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Finances?
              </h2>
              <p className="text-white/90 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                Join finPal to optimize your spending and achieve your financial goals with AI-powered insights.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => window.location.href = '/signup'}
                  className="bg-white hover:bg-gray-50 text-[#5B6F70] font-bold py-4 px-10 rounded-xl shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-3 text-lg hover:scale-105"
                >
                  Start Your Free Trial
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image src="/logo.png" alt="finPal Logo" width={32} height={32} className="w-8 h-8" />
                <span className="text-2xl font-bold text-white">finPal</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your AI-powered financial companion for smarter money management.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex justify-center items-center">
            <p className="text-gray-400 text-sm text-center">
              © 2026 finPal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}