-- Create trigger to sync user roles on therapist profile changes
CREATE OR REPLACE FUNCTION public.handle_therapist_role_sync()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_plan_slug TEXT;
  v_target_role public.app_role;
BEGIN
  -- Determine the plan slug from NEW.plan_id or NEW.pending_plan_slug
  IF NEW.plan_id IS NOT NULL THEN
    SELECT slug INTO v_plan_slug FROM public.plans WHERE id = NEW.plan_id;
  ELSE
    v_plan_slug := NEW.pending_plan_slug;
  END IF;

  -- Map plan slug to role
  IF v_plan_slug = 'centros-organizadores' THEN
    v_target_role := 'center';
  ELSIF v_plan_slug = 'profesional' OR v_plan_slug = 'presencia' THEN
    v_target_role := 'professional';
  ELSE
    v_target_role := 'professional'; -- default fallback
  END IF;

  -- Delete existing patient/professional/center role for this user
  DELETE FROM public.user_roles WHERE user_id = NEW.user_id AND role IN ('patient', 'professional', 'center');

  -- Insert the new role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, v_target_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_therapist_role ON public.therapists;
CREATE TRIGGER trg_sync_therapist_role
AFTER INSERT OR UPDATE OF plan_id, pending_plan_slug ON public.therapists
FOR EACH ROW EXECUTE FUNCTION public.handle_therapist_role_sync();
