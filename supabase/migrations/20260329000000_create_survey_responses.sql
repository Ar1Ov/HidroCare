-- Anonymous research survey responses (public submit, no public raw read)
CREATE TABLE survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  consent BOOLEAN NOT NULL,
  age_group TEXT NOT NULL,
  excessive_sweating TEXT NOT NULL,
  diagnosed TEXT NOT NULL,
  severity_raw TEXT NOT NULL,
  severity_score NUMERIC,
  areas TEXT[] NOT NULL DEFAULT '{}',
  frequency TEXT NOT NULL,
  triggers TEXT[] NOT NULL DEFAULT '{}',
  episode_duration TEXT NOT NULL,
  wash_frequency TEXT NOT NULL,
  products TEXT[] NOT NULL DEFAULT '{}',
  odor_level TEXT NOT NULL,
  odor_onset TEXT NOT NULL,
  skin_irritation TEXT NOT NULL,
  treatments TEXT[] NOT NULL DEFAULT '{}',
  treatment_effectiveness TEXT NOT NULL,
  treatment_odor_change TEXT NOT NULL,
  daily_life_impact_raw TEXT NOT NULL,
  daily_life_impact NUMERIC,
  life_areas TEXT[] NOT NULL DEFAULT '{}',
  challenge TEXT,
  future_research TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX survey_responses_created_at_idx ON survey_responses (created_at DESC);

ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a consented response (no login required)
CREATE POLICY "Anyone can insert consented survey responses"
  ON survey_responses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (consent = true);

-- No SELECT policies on the table: raw rows stay private.
-- Aggregates are exposed only via this SECURITY DEFINER function.
CREATE OR REPLACE FUNCTION public.get_survey_stats()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT jsonb_build_object(
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
