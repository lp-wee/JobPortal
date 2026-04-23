-- Sync role from profiles to user_roles automatically
CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- On insert or role change, ensure user_roles has matching record
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role) THEN
    -- Remove old role records for this user
    DELETE FROM public.user_roles WHERE user_id = NEW.user_id;
    -- Insert new role
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.user_id, NEW.role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS sync_user_role_trigger ON public.profiles;
CREATE TRIGGER sync_user_role_trigger
AFTER INSERT OR UPDATE OF role ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_user_role();

-- Backfill existing profiles into user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;