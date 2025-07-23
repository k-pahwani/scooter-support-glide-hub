-- Remove unique constraint on question field to allow similar questions
DROP INDEX IF EXISTS domain_questions_question_unique;
ALTER TABLE public.domain_questions DROP CONSTRAINT IF EXISTS domain_questions_question_unique;