-- Add email preference columns to consent_settings
-- Run this in Supabase SQL Editor

ALTER TABLE consent_settings ADD COLUMN IF NOT EXISTS inactive_reminders boolean DEFAULT true;
ALTER TABLE consent_settings ADD COLUMN IF NOT EXISTS program_updates boolean DEFAULT true;
