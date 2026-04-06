-- ============================================================
-- Find frameworks that have never been picked by the exercise
-- matcher for a real user. Run in Supabase SQL Editor.
--
-- Returns three result sets:
--   1. Never-used frameworks (zero completions, zero references)
--   2. Rarely-used frameworks (1-3 completions total)
--   3. Usage distribution — which frameworks dominate, which are tail
-- ============================================================

-- 1. Never picked by any user
SELECT
  fl.id,
  fl.name,
  fl.modality,
  fl.target_packages,
  fl.when_to_use
FROM public.frameworks_library fl
LEFT JOIN public.exercise_completions ec ON ec.framework_id = fl.id
WHERE ec.id IS NULL
ORDER BY fl.name;

-- 2. Picked less than 4 times (still a signal that triggers are weak)
SELECT
  fl.id,
  fl.name,
  fl.modality,
  COUNT(ec.id) AS times_used,
  fl.when_to_use
FROM public.frameworks_library fl
LEFT JOIN public.exercise_completions ec ON ec.framework_id = fl.id
GROUP BY fl.id, fl.name, fl.modality, fl.when_to_use
HAVING COUNT(ec.id) BETWEEN 1 AND 3
ORDER BY times_used ASC, fl.name;

-- 3. Top / bottom distribution — which frameworks do the heavy lifting
SELECT
  fl.name,
  fl.modality,
  COUNT(ec.id) AS times_used,
  ROUND(100.0 * COUNT(ec.id) / NULLIF((SELECT COUNT(*) FROM public.exercise_completions), 0), 2) AS pct_of_total
FROM public.frameworks_library fl
LEFT JOIN public.exercise_completions ec ON ec.framework_id = fl.id
GROUP BY fl.id, fl.name, fl.modality
ORDER BY times_used DESC
LIMIT 40;
