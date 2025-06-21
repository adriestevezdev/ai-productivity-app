'use client';

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <SignedOut>
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-12 h-12 bg-white rounded-xl"></div>
                <h1 className="text-4xl font-bold text-white">productiv.ai</h1>
              </div>
              
              <h2 className="text-5xl font-bold text-white mb-6">
                AI-Powered Productivity
              </h2>
              <p className="text-xl text-[#A0A0A0] mb-12 max-w-3xl">
                Transform your workflow with intelligent task management, smart scheduling, 
                and AI-driven insights that help you accomplish more with less effort.
              </p>
              
              <div className="space-y-4 mb-16">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/sign-up"
                    className="bg-[#4ECDC4] text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#45B7B8] transition-colors inline-block"
                  >
                    Get Started Free
                  </Link>
                  <Link 
                    href="/sign-in"
                    className="bg-transparent text-white border-2 border-white/20 px-8 py-4 rounded-lg text-lg font-semibold hover:border-white/40 transition-colors inline-block"
                  >
                    Sign In
                  </Link>
                </div>
                <p className="text-sm text-[#606060]">
                  No credit card required • Start productive immediately
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6 bg-[#1A1A1C] rounded-xl border border-white/8">
                  <div className="bg-[#4ECDC4]/20 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#4ECDC4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">Smart Task Management</h3>
                  <p className="text-[#A0A0A0]">AI-powered task prioritization and intelligent organization that adapts to your workflow</p>
                </div>
                
                <div className="text-center p-6 bg-[#1A1A1C] rounded-xl border border-white/8">
                  <div className="bg-[#4ECDC4]/20 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#4ECDC4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">AI Assistant</h3>
                  <p className="text-[#A0A0A0]">Natural language task creation and intelligent suggestions powered by advanced AI</p>
                </div>
                
                <div className="text-center p-6 bg-[#1A1A1C] rounded-xl border border-white/8">
                  <div className="bg-[#4ECDC4]/20 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#4ECDC4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">Productivity Analytics</h3>
                  <p className="text-[#A0A0A0]">Deep insights into your productivity patterns with actionable recommendations</p>
                </div>
              </div>
            </div>
          </SignedOut>
          
          <SignedIn>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4ECDC4] mx-auto mb-4"></div>
              <p className="text-[#A0A0A0]">Redirecting to dashboard...</p>
            </div>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}