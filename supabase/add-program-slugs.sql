-- Migration STEP 1 of 2: Add new enum values
-- Run this FIRST, then run step 2 in a separate execution.
-- (Postgres requires new enum values to be committed before they can be used.)

ALTER TYPE public.package_type ADD VALUE IF NOT EXISTS 'new_role';
ALTER TYPE public.package_type ADD VALUE IF NOT EXISTS 'performance_plan';
