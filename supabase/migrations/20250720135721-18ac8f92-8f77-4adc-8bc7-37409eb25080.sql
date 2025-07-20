
-- Migrate existing predefined questions from chat_messages to domain_questions
-- First, get the admin user ID for created_by field
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the admin user ID from user_roles table
    SELECT user_id INTO admin_user_id 
    FROM public.user_roles 
    WHERE role = 'admin'::app_role 
    LIMIT 1;
    
    -- If no admin found, use a default UUID
    IF admin_user_id IS NULL THEN
        admin_user_id := '0f2dbedd-e48a-4d75-a7c3-557602ba2dc3';
    END IF;
    
    -- Insert predefined questions from chat_messages into domain_questions
    INSERT INTO public.domain_questions (question, answer, category, created_by, is_active)
    SELECT 
        content as question,
        'This question requires further assistance. Please contact support for detailed help.' as answer,
        'General' as category,
        admin_user_id as created_by,
        true as is_active
    FROM public.chat_messages 
    WHERE type = 'predefined'
    ON CONFLICT DO NOTHING;
END $$;

-- Optional: Clean up the predefined messages from chat_messages table
-- Uncomment the line below if you want to remove them after migration
-- DELETE FROM public.chat_messages WHERE type = 'predefined';
