-- Migration: Add onboarding_completed field to users table
-- Run this in your Supabase SQL Editor if you have an existing database

-- Add the onboarding_completed column to existing users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Update existing users to have onboarding_completed = false
-- This ensures all existing users will see the onboarding flow
UPDATE public.users 
SET onboarding_completed = FALSE 
WHERE onboarding_completed IS NULL;
