-- Add unique constraint to domain_questions table to prevent duplicate questions
ALTER TABLE public.domain_questions 
ADD CONSTRAINT domain_questions_question_unique UNIQUE (question);