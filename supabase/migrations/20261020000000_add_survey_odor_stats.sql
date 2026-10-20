-- Include optional odor answers in public aggregate results. Raw responses remain private.
CREATE OR REPLACE FUNCTION public.get_survey_stats()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT jsonb_build_object(
    'answered', (
      SELECT jsonb_build_object(
      'ageGroups', COUNT(*) FILTER (WHERE age_group <> '')::int,
      'diagnosed', COUNT(*) FILTER (WHERE diagnosed <> '')::int,
      'frequency', COUNT(*) FILTER (WHERE frequency <> '')::int,
      'severity', COUNT(*) FILTER (WHERE severity_score IS NOT NULL)::int,
      'dailyLifeImpact', COUNT(*) FILTER (WHERE daily_life_impact IS NOT NULL)::int,
      'areas', COUNT(*) FILTER (WHERE cardinality(areas) > 0)::int,
      'triggers', COUNT(*) FILTER (WHERE cardinality(triggers) > 0)::int,
      'treatments', COUNT(*) FILTER (WHERE cardinality(treatments) > 0)::int,
      'lifeAreas', COUNT(*) FILTER (WHERE cardinality(life_areas) > 0)::int,
      'futureResearch', COUNT(*) FILTER (WHERE future_research <> '')::int,
      'odorLevel', COUNT(*) FILTER (WHERE odor_level <> '')::int,
      'odorOnset', COUNT(*) FILTER (WHERE odor_onset <> '')::int
      ) FROM survey_responses WHERE consent = true
    ),
    'odorLevel', (
      SELECT COALESCE(jsonb_object_agg(odor_level, cnt), '{}'::jsonb)
      FROM (
        SELECT odor_level, COUNT(*)::int AS cnt FROM survey_responses
        WHERE consent = true AND odor_level <> '' GROUP BY odor_level
      ) t
    ),
    'odorOnset', (
      SELECT COALESCE(jsonb_object_agg(odor_onset, cnt), '{}'::jsonb)
      FROM (
        SELECT odor_onset, COUNT(*)::int AS cnt FROM survey_responses
        WHERE consent = true AND odor_onset <> '' GROUP BY odor_onset
      ) t
    ),
    'totalResponses', (
      SELECT COUNT(*)::int FROM survey_responses WHERE consent = true
    ),
    'ageGroups', (
      SELECT COALESCE(jsonb_object_agg(age_group, cnt), '{}'::jsonb)
      FROM (
        SELECT age_group, COUNT(*)::int AS cnt
        FROM survey_responses
        WHERE consent = true
        GROUP BY age_group
      ) t
    ),
    'diagnosed', (
      SELECT COALESCE(jsonb_object_agg(diagnosed, cnt), '{}'::jsonb)
      FROM (
        SELECT diagnosed, COUNT(*)::int AS cnt
        FROM survey_responses
        WHERE consent = true
        GROUP BY diagnosed
      ) t
    ),
    'frequency', (
      SELECT COALESCE(jsonb_object_agg(frequency, cnt), '{}'::jsonb)
      FROM (
        SELECT frequency, COUNT(*)::int AS cnt
        FROM survey_responses
        WHERE consent = true
        GROUP BY frequency
      ) t
    ),
    'severity', (
      SELECT COALESCE(jsonb_object_agg(bucket::text, cnt), '{}'::jsonb)
      FROM (
        SELECT LEAST(10, GREATEST(0, ROUND(severity_score)::int)) AS bucket,
               COUNT(*)::int AS cnt
        FROM survey_responses
        WHERE consent = true AND severity_score IS NOT NULL
        GROUP BY 1
      ) t
    ),
    'dailyLifeImpact', (
      SELECT COALESCE(jsonb_object_agg(bucket::text, cnt), '{}'::jsonb)
      FROM (
        SELECT LEAST(10, GREATEST(0, ROUND(daily_life_impact)::int)) AS bucket,
               COUNT(*)::int AS cnt
        FROM survey_responses
        WHERE consent = true AND daily_life_impact IS NOT NULL
        GROUP BY 1
      ) t
    ),
    'areas', (
      SELECT COALESCE(jsonb_object_agg(area, cnt), '{}'::jsonb)
      FROM (
        SELECT area, COUNT(*)::int AS cnt
        FROM survey_responses, unnest(areas) AS area
        WHERE consent = true
        GROUP BY area
      ) t
    ),
    'triggers', (
      SELECT COALESCE(jsonb_object_agg(trig, cnt), '{}'::jsonb)
      FROM (
        SELECT trig, COUNT(*)::int AS cnt
        FROM survey_responses, unnest(triggers) AS trig
        WHERE consent = true
        GROUP BY trig
      ) t
    ),
    'treatments', (
      SELECT COALESCE(jsonb_object_agg(treatment, cnt), '{}'::jsonb)
      FROM (
        SELECT treatment, COUNT(*)::int AS cnt
        FROM survey_responses, unnest(treatments) AS treatment
        WHERE consent = true
        GROUP BY treatment
      ) t
    ),
    'lifeAreas', (
      SELECT COALESCE(jsonb_object_agg(life_area, cnt), '{}'::jsonb)
      FROM (
        SELECT life_area, COUNT(*)::int AS cnt
        FROM survey_responses, unnest(life_areas) AS life_area
        WHERE consent = true
        GROUP BY life_area
      ) t
    ),
    'futureResearch', (
      SELECT COALESCE(jsonb_object_agg(future_research, cnt), '{}'::jsonb)
      FROM (
        SELECT future_research, COUNT(*)::int AS cnt
        FROM survey_responses
        WHERE consent = true
        GROUP BY future_research
      ) t
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_survey_stats() TO anon, authenticated;
