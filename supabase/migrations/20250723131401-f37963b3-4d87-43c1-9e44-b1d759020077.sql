-- Remove unique constraint on question field to allow similar questions
ALTER TABLE public.domain_questions DROP CONSTRAINT IF EXISTS domain_questions_question_unique;