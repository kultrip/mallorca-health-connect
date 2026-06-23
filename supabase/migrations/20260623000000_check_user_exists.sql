-- Create a security definer function to check if a user exists by email without exposing other auth data.
CREATE OR REPLACE FUNCTION public.check_user_exists_by_email(check_email TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE email = LOWER(TRIM(check_email))
  );
END;
$$;

-- Allow anonymous and authenticated users to check if an email exists for login feedback
GRANT EXECUTE ON FUNCTION public.check_user_exists_by_email(TEXT) TO anon, authenticated, service_role;
