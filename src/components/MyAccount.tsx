'use client';

import { ArrowLeft, Mail } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface MyAccountProps {
  user: User;
  onBack: () => void;
}

export function MyAccount({ user, onBack }: MyAccountProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <Mail className="text-blue-600" size={20} />
              </div>
              <h2 className="text-lg font-medium text-gray-900">Email Address</h2>
            </div>
            
            <div className="bg-gray-50 rounded-md p-4">
              <p className="text-gray-700 font-mono text-sm break-all">
                {user.email}
              </p>
            </div>
            
            <p className="text-sm text-gray-500 mt-3">
              This is the email address associated with your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}





