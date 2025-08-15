'use client';

import { useState } from 'react';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to My Diary",
      subtitle: "Your minimalist daily task manager",
      content: (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-lg text-gray-600 leading-relaxed">
            Think of this as your digital piece of paper. Simple, clean, and focused on what matters today.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Philosophy:</strong> Less is more. Focus on today's tasks without the clutter of complex project management.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Daily Task Management",
      subtitle: "One list per day, just like paper",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-lg font-semibold mb-2">Simple Daily Workflow</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">1</div>
              <div>
                <p className="font-medium">Add tasks for today</p>
                <p className="text-sm text-gray-600">Just type and press enter - no complex forms</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">2</div>
              <div>
                <p className="font-medium">Check them off as you go</p>
                <p className="text-sm text-gray-600">Simple checkbox to mark tasks complete</p>
              </div>
            </div>
                         <div className="flex items-start space-x-3">
               <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">3</div>
               <div>
                 <p className="font-medium">Incomplete tasks carry over</p>
                 <p className="text-sm text-gray-600">Tomorrow's list automatically includes unfinished items</p>
               </div>
             </div>
             <div className="flex items-start space-x-3">
               <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">4</div>
               <div>
                 <p className="font-medium">Clean slate when you're away</p>
                 <p className="text-sm text-gray-600">If you don't use the app for a day, carried-over tasks are archived to keep your workspace clutter-free</p>
               </div>
             </div>
          </div>
        </div>
      )
    },
    {
      title: "Smart Features",
      subtitle: "Gentle nudges to help you stay productive",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-lg font-semibold mb-2">Intelligent Assistance</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Task Overload Detection</h4>
              <p className="text-sm text-green-700">
                When you have too many tasks, we&apos;ll suggest using the Eisenhower Matrix to prioritize.
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">Carry-Over Management</h4>
              <p className="text-sm text-purple-700">
                Tasks that carry over for multiple days get special attention to help you decide what to do.
              </p>
            </div>
                         <div className="bg-orange-50 p-4 rounded-lg">
               <h4 className="font-medium text-orange-800 mb-2">Project Archiving</h4>
               <p className="text-sm text-orange-700">
                 Inactive projects are automatically suggested for archiving to keep your workspace clean.
               </p>
             </div>
             <div className="bg-blue-50 p-4 rounded-lg">
               <h4 className="font-medium text-blue-800 mb-2">Clean Slate Philosophy</h4>
               <p className="text-sm text-blue-700">
                 If you don't use the app for a day, carried-over tasks are automatically archived. This ensures you always start with a fresh, uncluttered workspace.
               </p>
             </div>
          </div>
        </div>
      )
    },
    {
      title: "Optional Projects",
      subtitle: "For when you need more organization",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-lg font-semibold mb-2">Project Lists</h3>
          </div>
          <div className="space-y-4">
            <p className="text-gray-600">
              Create separate task lists for specific events, trips, or projects. These are hidden by default to keep your daily view clean.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Perfect for:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Vacation planning</li>
                <li>• Event preparation</li>
                <li>• Work projects</li>
                <li>• Home renovations</li>
              </ul>
            </div>
            <p className="text-sm text-gray-500">
              Access projects via the &quot;Projects&quot; button when you need them.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "You&apos;re All Set!",
      subtitle: "Ready to start your productive journey",
      content: (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-lg text-gray-600">
            Your minimalist task manager is ready. Start with today's tasks and let the app adapt to your workflow.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Don&apos;t worry about getting everything perfect. The app is designed to be forgiving and flexible.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            You can always adjust settings and explore features later.
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h1>
            <p className="text-lg text-gray-600">
              {currentStepData.subtitle}
            </p>
          </div>

          <div className="mb-8">
            {currentStepData.content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center mt-6 space-x-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentStep ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
