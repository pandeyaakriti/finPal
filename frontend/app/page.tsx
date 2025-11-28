"use client";
import React from "react";
import {TrendingUp, PieChart, Sparkles, ArrowRight, Shield, Zap } from "lucide-react";
import Image from "next/image";


export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-emerald-50 dark:from-[#4a5c5e] dark:to-[#5b6f71] font-sans">
      <div className="flex min-h-screen w-full items-center justify-center px-4 py-12">
        <main className="w-full max-w-4xl">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12 mb-8">
            <div className="flex flex-col items-center text-center">
              {/* Logo with animated glow */}
              <div className="mb-8 relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse"></div>
                <div>
                 <Image 
                 src="/finPal.png" 
                 alt="FinPal hero" 
                 width={320} height={320} 
                 className="rounded-2xl shadow-2xl" />
                </div>
              </div>

              {/* Heading with gradient */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-gray-900 via-emerald-800 to-gray-900 dark:from-white dark:via-emerald-300 dark:to-white bg-clip-text text-transparent">
                Smarter budgeting starts here.
              </h1>
              
              <p className="text-gray-600 dark:text-gray-300 text-lg sm:text-xl max-w-2xl mb-8 leading-relaxed">
                FinPal helps you track expenses and save effortlessly with AI-powered insights tailored to your financial goals.
              </p>

              {/* CTA Button */}
              <button onClick={() => window.location.href = '/signup'} className="group bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-4 px-12 rounded-2xl shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl flex items-center gap-3 text-lg">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                AI Insights
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Get personalized recommendations to optimize your spending habits.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                <PieChart className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Smart Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Visualize your finances with beautiful, intuitive dashboards.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Goal Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Set and achieve your savings goals with automated tracking.
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <div className="flex flex-wrap items-center justify-center gap-8 text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-semibold">Bank-level Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-semibold">Real-time Sync</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}