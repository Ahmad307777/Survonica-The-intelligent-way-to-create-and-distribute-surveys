-- Create surveys table
CREATE TABLE IF NOT EXISTS public.surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  template TEXT DEFAULT 'single-column',
  require_qualification BOOLEAN DEFAULT false,
  qualification_pass_score INTEGER DEFAULT 80,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create qualification_tests table
CREATE TABLE IF NOT EXISTS public.qualification_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create respondent_qualifications table
CREATE TABLE IF NOT EXISTS public.respondent_qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  respondent_email TEXT NOT NULL,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  qualification_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(respondent_email, survey_id)
);

-- Create survey_responses table
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  respondent_email TEXT NOT NULL,
  responses JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualification_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respondent_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for surveys
CREATE POLICY "Users can view their own surveys"
  ON public.surveys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own surveys"
  ON public.surveys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own surveys"
  ON public.surveys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own surveys"
  ON public.surveys FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for qualification_tests
CREATE POLICY "Users can view qualification tests for their surveys"
  ON public.qualification_tests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.surveys 
    WHERE surveys.id = qualification_tests.survey_id 
    AND surveys.user_id = auth.uid()
  ));

CREATE POLICY "Users can create qualification tests for their surveys"
  ON public.qualification_tests FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.surveys 
    WHERE surveys.id = qualification_tests.survey_id 
    AND surveys.user_id = auth.uid()
  ));

CREATE POLICY "Public can view qualification tests"
  ON public.qualification_tests FOR SELECT
  USING (true);

-- RLS Policies for respondent_qualifications
CREATE POLICY "Survey owners can view qualifications"
  ON public.respondent_qualifications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.surveys 
    WHERE surveys.id = respondent_qualifications.survey_id 
    AND surveys.user_id = auth.uid()
  ));

CREATE POLICY "Anyone can create qualifications"
  ON public.respondent_qualifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can view their own qualifications"
  ON public.respondent_qualifications FOR SELECT
  USING (true);

-- RLS Policies for survey_responses
CREATE POLICY "Survey owners can view responses"
  ON public.survey_responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.surveys 
    WHERE surveys.id = survey_responses.survey_id 
    AND surveys.user_id = auth.uid()
  ));

CREATE POLICY "Anyone can submit responses"
  ON public.survey_responses FOR INSERT
  WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_surveys_updated_at
  BEFORE UPDATE ON public.surveys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();