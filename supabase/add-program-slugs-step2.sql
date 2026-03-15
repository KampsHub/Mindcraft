-- Migration STEP 2 of 2: Update target_packages and deactivate old programs
-- Run this AFTER step 1 has been committed.

-- ═══════════════════════════════════════════════════════════════
-- 1. Update frameworks_library target_packages arrays
--    Remove old slugs, add new ones
-- ═══════════════════════════════════════════════════════════════
UPDATE public.frameworks_library
SET target_packages = array_cat(
  array_remove(
    array_remove(
      array_remove(
        array_remove(target_packages, 'international_move'::public.package_type),
        'new_manager'::public.package_type
      ),
      'dealing_with_others'::public.package_type
    ),
    'general_growth'::public.package_type
  ),
  ARRAY['new_role', 'performance_plan']::public.package_type[]
)
WHERE target_packages IS NOT NULL
  AND (
    'international_move'::public.package_type = ANY(target_packages)
    OR 'new_manager'::public.package_type = ANY(target_packages)
    OR 'dealing_with_others'::public.package_type = ANY(target_packages)
    OR 'general_growth'::public.package_type = ANY(target_packages)
  );

-- Also add new slugs to any framework that targets 'layoff'
-- (common/universal frameworks should serve all programs)
UPDATE public.frameworks_library
SET target_packages = array_cat(target_packages, ARRAY['new_role', 'performance_plan']::public.package_type[])
WHERE target_packages IS NOT NULL
  AND 'layoff'::public.package_type = ANY(target_packages)
  AND NOT ('new_role'::public.package_type = ANY(target_packages));

-- ═══════════════════════════════════════════════════════════════
-- 2. Deactivate any existing programs for removed packages
-- ═══════════════════════════════════════════════════════════════
UPDATE public.programs
SET active = false
WHERE slug IN ('international_move', 'new_manager', 'dealing_with_others', 'general_growth');
