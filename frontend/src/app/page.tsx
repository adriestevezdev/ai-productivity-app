'use client';

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export default function Home() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <SignedOut>
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                AI Productivity App
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                Boost your productivity with AI-powered task management, intelligent scheduling, 
                and personalized insights to help you achieve more every day.
              </p>
              <div className="space-y-4">
                <SignInButton mode="modal">
                  <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors">
                    Get Started
                  </button>
                </SignInButton>
                <p className="text-sm text-gray-500">
                  No credit card required • Free forever
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                <div className="text-center">
                  <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Smart Task Management</h3>
                  <p className="text-gray-600">AI-powered task prioritization and organization</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Intelligent Scheduling</h3>
                  <p className="text-gray-600">Optimize your calendar with smart suggestions</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Productivity Analytics</h3>
                  <p className="text-gray-600">Track progress and improve your workflow</p>
                </div>
              </div>
            </div>
          </SignedOut>
          
          <SignedIn>
            <div className="text-center">
              <p className="text-gray-600">Redirecting to dashboard...</p>
            </div>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}