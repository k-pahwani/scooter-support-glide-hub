-- Remove duplicate questions, keeping only the most recent one for each question text
DELETE FROM public.domain_questions 
WHERE id IN (
    SELECT id 
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY question 
                   ORDER BY created_at DESC
               ) as rn
        FROM public.domain_questions
    ) t 
    WHERE t.rn > 1
);

-- Now add the unique constraint
ALTER TABLE public.domain_questions 
ADD CONSTRAINT domain_questions_question_unique UNIQUE (question);