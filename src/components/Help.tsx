'use client';

import { ArrowLeft, CheckCircle, Calendar, FolderOpen, Settings, Target, Archive } from 'lucide-react';

interface HelpProps {
  onBack: () => void;
}

export function Help({ onBack }: HelpProps) {
  const sections = [
    {
      title: "Daily Tasks",
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      items: [
        "Add tasks by typing in the input field and pressing Enter",
        "Click the checkbox to mark tasks as complete",
        "Click on any task text to edit it",
        "Use the trash icon to delete tasks",
        "Incomplete tasks automatically carry over to the next day"
      ]
    },
    {
      title: "Projects",
      icon: <FolderOpen className="w-5 h-5 text-blue-600" />,
      items: [
        "Create separate task lists for specific projects or events",
        "Access projects through the menu or Projects button",
        "Projects keep your daily view clean and focused",
        "Perfect for vacation planning, work projects, or event preparation"
      ]
    },
    {
      title: "Carry Over Tasks",
      icon: <Calendar className="w-5 h-5 text-purple-600" />,
      items: [
        "Use 'Carry Over Tasks' to manually bring forward incomplete tasks",
        "Tasks that carry over multiple times get special attention",
        "The app suggests prioritizing tasks with high carry-over counts"
      ]
    },
    {
      title: "Smart Features",
      icon: <Target className="w-5 h-5 text-orange-600" />,
      items: [
        "Task overload detection suggests using the Eisenhower Matrix",
        "Inactive projects are automatically suggested for archiving",
        "Clean slate philosophy: unused tasks are archived after a day"
      ]
    },
    {
      title: "Settings",
      icon: <Settings className="w-5 h-5 text-gray-600" />,
      items: [
        "Customize how completed tasks behave and look",
        "Enable or disable smart suggestions",
        "Set your task overload threshold",
        "View previous days and archived tasks"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Help & How To</h1>
              <p className="text-sm text-gray-600 mt-1">Learn how to use your task manager effectively</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                {section.icon}
                <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
              </div>
              <ul className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Quick Tips
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white rounded-md p-4">
              <h3 className="font-medium text-blue-800 mb-2">Keep It Simple</h3>
              <p className="text-sm text-blue-700">Focus on today's tasks. The app is designed to be your digital piece of paper - simple and distraction-free.</p>
            </div>
            <div className="bg-white rounded-md p-4">
              <h3 className="font-medium text-blue-800 mb-2">Don't Overthink</h3>
              <p className="text-sm text-blue-700">The app adapts to your workflow. Start with basic task management and explore features as needed.</p>
            </div>
            <div className="bg-white rounded-md p-4">
              <h3 className="font-medium text-blue-800 mb-2">Trust the System</h3>
              <p className="text-sm text-blue-700">Let the app handle carry-overs and suggestions. Focus on completing tasks rather than managing them.</p>
            </div>
            <div className="bg-white rounded-md p-4">
              <h3 className="font-medium text-blue-800 mb-2">Stay Consistent</h3>
              <p className="text-sm text-blue-700">Check in daily for the best experience. The app works best with regular use.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}








