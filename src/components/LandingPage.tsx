'use client';

import { useState } from 'react';
import { CheckCircle, Brain, Shield, ArrowRight, Zap, Focus, Clock } from 'lucide-react';
import Image from 'next/image';
import { signInWithEmail, signUpWithEmail } from '@/lib/supabase';

interface LandingPageProps {
  onAuthSuccess?: () => void;
}

export function LandingPage({ onAuthSuccess }: LandingPageProps) {
  const [showAuth, setShowAuth] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        setMessage('Check your email for the confirmation link!');
      } else {
        await signInWithEmail(email, password);
        onAuthSuccess?.();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="text-center mb-8">
              <Image 
                src="/my-diary-icon-2.png" 
                alt="My Diary App Icon" 
                width={64} 
                height={64} 
                className="mb-4 mx-auto"
              />
              <h2 className="text-2xl font-bold text-gray-900">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="mt-2 text-gray-600">
                {isSignUp ? 'Start your distraction-free journey' : 'Sign in to continue'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Email address"
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 px-4 rounded-xl font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-base"
              >
                {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {isSignUp 
                    ? 'Already have an account? Sign in' 
                    : "Don't have an account? Create one"
                  }
                </button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowAuth(false)}
                className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                ← Back to overview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="relative z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center space-x-2">
              <Image 
                src="/my-diary-icon-2.png" 
                alt="My Diary App Icon" 
                width={48} 
                height={48} 
                className="flex-shrink-0"
              />
              <span className="text-lg sm:text-xl font-bold text-gray-900 leading-none self-center">My Diary</span>
            </div>
            <button
              onClick={() => setShowAuth(true)}
              className="bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base touch-manipulation"
            >
              Sign In
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            <div className="lg:col-span-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight text-center sm:text-left">
                Back to 
                <span className="text-blue-600"> Basics</span>
                <br />
                Task Management
              </h1>
              
              <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed text-center sm:text-left">
                In an era of bells and whistles, we bring you back to what matters: 
                <strong className="text-gray-900"> focus, simplicity, and getting things done</strong>.
              </p>

              <p className="mt-4 text-base sm:text-lg text-gray-600 text-center sm:text-left">
                A distraction-free daily task manager with smart features that work silently in the background, 
                so you can focus on what truly matters.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <button
                  onClick={() => {
                    setIsSignUp(true);
                    setShowAuth(true);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 sm:px-8 rounded-2xl font-medium text-base sm:text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg touch-manipulation"
                >
                  Start Free Today
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setIsSignUp(false);
                    setShowAuth(true);
                  }}
                  className="border-2 border-gray-300 text-gray-700 px-6 py-4 sm:px-8 rounded-xl font-medium text-base sm:text-lg hover:border-gray-400 hover:bg-gray-50 transition-colors touch-manipulation"
                >
                  Sign In
                </button>
              </div>

              <p className="mt-4 text-sm text-gray-500 text-center sm:text-left">
                ✨ Core features always free • No ads • No distractions
              </p>
            </div>

            {/* App Preview */}
            <div className="lg:col-span-6 mt-16 lg:mt-0">
              <div className="relative">
                {/* Mock App Interface */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden" style={{boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.15)'}}>
                  {/* Mock Header */}
                  <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Today's Tasks</h3>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">Aug 18</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mock Task List */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-gray-600 line-through">Review quarterly goals</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                      <span className="text-gray-900">Prepare presentation slides</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                      <span className="text-gray-900">Call client about project timeline</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                      <span className="text-gray-900">Book dentist appointment</span>
                    </div>
                  </div>
                  
                  {/* Mock Input */}
                  <div className="border-t border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                      <div className="flex-1 text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                        Add a new task...
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  Clean & Simple
                </div>
                <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-blue-400 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  No Distractions
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Simplicity?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                While other apps overwhelm you with features, we focus on what actually helps you get things done.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="text-center p-4 sm:p-6">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-4 sm:mb-6">
                  <Focus className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Distraction-Free Design</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Clean, paper-like interface that helps you focus on what matters. No unnecessary bells and whistles.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center p-4 sm:p-6">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-4 sm:mb-6">
                  <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Smart Background Features</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Intelligent task carry-over and automatic archiving work silently behind the scenes. 
                  <span className="text-green-700 font-medium"><br/>AI-powered insights coming soon.</span>
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center p-4 sm:p-6">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-full mb-4 sm:mb-6">
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Daily-Focused Approach</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Built around your daily routine. Focus on today's tasks without getting lost in endless project hierarchies.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="text-center p-4 sm:p-6">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-amber-100 rounded-full mb-4 sm:mb-6">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Lightning Fast</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  No loading screens, no delays. Add tasks, check them off, and move on with your day.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="text-center p-4 sm:p-6">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-indigo-100 rounded-full mb-4 sm:mb-6">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Privacy First</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Your tasks are yours. Secure, private, and stored safely. No tracking, no ads, no data mining.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="text-center p-4 sm:p-6">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-rose-100 rounded-full mb-4 sm:mb-6">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-rose-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Core Features Free</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  All essential task management features are completely free. Optional AI enhancements available for power users.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-gray-50 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600">
                Three simple steps to better productivity
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full text-xl font-bold mb-6">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Add Your Tasks</h3>
                <p className="text-gray-600">
                  Simply type what you need to do today. No categories, no projects, no complexity.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-full text-xl font-bold mb-6">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Check Them Off</h3>
                <p className="text-gray-600">
                  Complete tasks with a satisfying click. Watch your progress grow throughout the day.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-600 text-white rounded-full text-xl font-bold mb-6">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Start Fresh Tomorrow</h3>
                <p className="text-gray-600">
                  Incomplete tasks are intelligently carried over. Completed tasks are archived. You start each day clean.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Preview Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full mb-6">
              <Brain className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              AI That Learns How You Work
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              <strong className="text-gray-900">Coming soon:</strong>{' '}
              Intelligent features that study your task completion patterns and adapt to help you succeed. 
              Personalized insights that work quietly in the background, just like everything else in My Diary.
            </p>
            
            <div className="bg-white rounded-xl p-6 shadow-lg max-w-2xl mx-auto">
              <p className="text-gray-700 italic">
                "AI that learns what helps you get things done, 
                and what doesn't - then adapts to your unique productivity style."
              </p>
            </div>
            
            <p className="mt-6 text-sm text-gray-500">
              Optional premium feature • Core app stays free forever
            </p>
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="bg-white py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
              Built for Focused Minds
            </h2>
            
            <div className="text-lg text-gray-600 space-y-6 leading-relaxed">
              <p>
                <strong className="text-gray-900">Modern productivity apps have lost their way.</strong>{' '}
                They're packed with features you don't need, notifications that break your flow, 
                and complexity that gets in the way of actually getting things done.
              </p>
              
              <p>
                <strong className="text-gray-900">My Diary takes you back to basics.</strong>{' '}
                It's designed like a digital notepad—simple, clean, and focused on today. 
                Smart features work quietly in the background, never interrupting your workflow.
              </p>
              
              <p>
                <strong className="text-gray-900">Perfect for minds that value clarity.</strong>{' '}
                Whether you have ADHD, anxiety, or simply prefer minimalism, 
                this app respects your need for a calm, organized digital space.
              </p>
            </div>

            <div className="mt-12 bg-blue-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">
                Core Features. Always Free.
              </h3>
              <p className="text-blue-800 text-lg">
                Essential task management stays free forever. Optional AI features for those who want them. 
                No ads, no tracking, no compromise on your privacy.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Simplify Your Day?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Rediscover the joy of simple, effective task management.
            </p>
            
            <button
              onClick={() => {
                setIsSignUp(true);
                setShowAuth(true);
              }}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <p className="mt-4 text-blue-200 text-sm">
              No credit card required • Core features always free
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <Image 
                  src="/my-diary-icon-2.png" 
                  alt="My Diary App Icon" 
                  width={40} 
                  height={40} 
                  className=""
                />
                <span className="text-xl font-bold text-white">My Diary</span>
              </div>
              
              <div className="text-gray-400 text-sm">
                Built with ❤️ for productive, focused task management
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
