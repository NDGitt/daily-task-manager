'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Archive, Calendar, Target } from 'lucide-react';
import type { UserSettings } from '@/types';

interface SettingsProps {
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => Promise<void>;
  onBack: () => void;
  onShowPreviousDays: () => void;
  onShowArchivedTasks: () => void;
}

export function Settings({ settings, onSaveSettings, onBack, onShowPreviousDays, onShowArchivedTasks }: SettingsProps) {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);


  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(localSettings) !== JSON.stringify(settings);
    setHasChanges(changed);
  }, [localSettings, settings]);



  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveSettings(localSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLocalSettings(settings);
  };

  const handleBack = () => {
    onBack();
  };

  const updateSetting = <K extends keyof UserSettings>(
    key: K, 
    value: UserSettings[K]
  ) => {
    console.log(`Updating setting ${key} to:`, value);
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Back to Daily View"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
              </div>
            </div>
            
            {/* Mobile Save Button */}
            <div className="flex items-center gap-2">
              {hasChanges && (
                <button
                  onClick={handleReset}
                  className="px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Reset
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[80px]"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1 ml-11">Customize your experience</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* Settings Sections */}
        <div className="space-y-4 sm:space-y-6">
          {/* Task Behavior */}
          <div className="bg-white  border border-gray-200  rounded-lg">
            <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-200 ">
              <div className="flex items-center gap-3">
                <Target className="text-blue-600 flex-shrink-0" size={20} />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 ">Task Behavior</h2>
              </div>
            </div>
            
            <div className="px-4 py-4 sm:px-6 sm:py-5 space-y-6">
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700  mb-3">
                  Visual appearance when completed:
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'change_color', label: 'Change to green background', description: 'Make completed tasks visually distinct' },
                    { value: 'no_change', label: 'Keep original appearance', description: 'No visual change when completed' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-start gap-3 p-3 sm:p-4 border border-gray-200  rounded-lg hover:bg-gray-50  cursor-pointer active:bg-gray-100  transition-colors">
                      <input
                        type="radio"
                        name="task_completion_visual"
                        value={option.value}
                        checked={localSettings.task_completion_visual === option.value}
                        onChange={(e) => updateSetting('task_completion_visual', e.target.value as 'change_color' | 'no_change')}
                        className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 "
                      />
                      <div>
                        <div className="font-medium text-gray-900  text-sm sm:text-base">{option.label}</div>
                        <div className="text-xs sm:text-sm text-gray-600  mt-1">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700  mb-3">
                  Position when completed:
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'stay_visible', label: 'Stay in place', description: 'Keep exactly where it is in the list' },
                    { value: 'move_to_bottom', label: 'Move to bottom', description: 'Push completed tasks to the end of the list' },
                    { value: 'hide', label: 'Hide completely', description: 'Remove from view (can be found in history)' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-start gap-3 p-3 sm:p-4 border border-gray-200  rounded-lg hover:bg-gray-50  cursor-pointer active:bg-gray-100  transition-colors">
                      <input
                        type="radio"
                        name="task_completion_behavior"
                        value={option.value}
                        checked={localSettings.task_completion_behavior === option.value}
                        onChange={(e) => updateSetting('task_completion_behavior', e.target.value as 'stay_visible' | 'move_to_bottom' | 'hide')}
                        className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 "
                      />
                      <div>
                        <div className="font-medium text-gray-900  text-sm sm:text-base">{option.label}</div>
                        <div className="text-xs sm:text-sm text-gray-600  mt-1">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700  mb-3">
                  Task overload threshold
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Coming Soon
                  </span>
                </label>
                <div className="flex items-center gap-3 opacity-50">
                  <input
                    type="range"
                    min="5"
                    max="25"
                    value={localSettings.task_overload_threshold}
                    disabled
                    //onChange={(e) => updateSetting('task_overload_threshold', parseInt(e.target.value))}
                   // className="flex-1 h-2 bg-gray-200  rounded-lg appearance-none cursor-pointer"
                   className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-not-allowed"

                  />
                  <span className="text-sm sm:text-base font-medium text-gray-900  min-w-[2.5rem] sm:min-w-[3rem] text-center">
                    {localSettings.task_overload_threshold}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600  mt-2">
                  Show overload warning when you have more than this many tasks
                </p>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <label className="text-sm sm:text-base font-medium text-gray-700 ">Smart suggestions
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Coming Soon
                  </span>
                  </label>
                <p className="text-xs sm:text-sm text-gray-600  mt-1">Get helpful task suggestions based on your patterns</p>
                </div>
                <button
                  disabled
                  //onClick={() => updateSetting('smart_suggestions_enabled', !localSettings.smart_suggestions_enabled)}
              //    onClick={() => updateSetting('smart_suggestions_enabled', !localSettings.smart_suggestions_enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 cursor-not-allowed opacity-50`}
                >
                 {/* <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localSettings.smart_suggestions_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  /> */}
                  
                  <span
                    className= "inline-block h-4 w-4 transform rounded-full bg-white translate-x-1"
                  />
                </button>
              </div>
            </div>
          </div>


          {/* Project Archiving */}
          <div className="bg-white  border border-gray-200  rounded-lg">
            <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-200 ">
              <div className="flex items-center gap-3">
                <Archive className="text-green-600 flex-shrink-0" size={20} />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 ">Project Archiving</h2>
              </div>
            </div>
            
            <div className="px-4 py-4 sm:px-6 sm:py-5 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <label className="text-sm sm:text-base font-medium text-gray-700 ">Auto-archive completed projects</label>
                  <p className="text-xs sm:text-sm text-gray-600  mt-1">Automatically hide projects when all tasks are done</p>
                </div>
                <button
                  onClick={() => updateSetting('project_archive_completed', !localSettings.project_archive_completed)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                    localSettings.project_archive_completed ? 'bg-green-600' : 'bg-gray-200 '
                  }`}
                >
                 <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localSettings.project_archive_completed ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  /> 
                  
                </button>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700  mb-3">
                  Archive inactive projects after
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={localSettings.project_auto_archive_days}
                    onChange={(e) => updateSetting('project_auto_archive_days', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200  rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm sm:text-base font-medium text-gray-900  min-w-[3rem] sm:min-w-[4rem] text-center">
                    {localSettings.project_auto_archive_days} day{localSettings.project_auto_archive_days !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600  mt-2">
                  Projects not accessed for this long will be automatically archived
                </p>
              </div>
            </div>
          </div>



          {/* Data Management */}
          <div className="bg-white  border border-gray-200  rounded-lg">
            <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-200 ">
              <div className="flex items-center gap-3">
                <Calendar className="text-orange-600 flex-shrink-0" size={20} />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 ">Data Management</h2>
              </div>
            </div>
            
            <div className="px-4 py-4 sm:px-6 sm:py-5 space-y-4">
              <div className="p-3 sm:p-4 bg-gray-50 /50 rounded-lg">
                <h3 className="font-medium text-gray-900  mb-2 text-sm sm:text-base">Task History</h3>
                <p className="text-xs sm:text-sm text-gray-600  mb-3">
                  View and manage your completed tasks and project history
                </p>
                <button 
                  onClick={onShowArchivedTasks}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Archived Tasks →
                </button>
              </div>
              
              <div className="p-3 sm:p-4 bg-gray-50 /50 rounded-lg">
                <h3 className="font-medium text-gray-900  mb-2 text-sm sm:text-base">Previous Days</h3>
                <p className="text-xs sm:text-sm text-gray-600  mb-3">
                  Browse your daily task history and see your productivity patterns
                </p>
                <button 
                  onClick={onShowPreviousDays}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Previous Days →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Save Status */}
      {hasChanges && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto bg-blue-600 text-white px-3 py-2 sm:px-4 rounded-lg shadow-lg z-20">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-xs sm:text-sm">Unsaved changes</span>
          </div>
        </div>
      )}
    </div>
  );
}