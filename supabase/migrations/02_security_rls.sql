-- ==============================================================================
-- GYM SCAN AI — Database Security Migration 02: Row Level Security (RLS)
-- Target DB: PostgreSQL (Supabase / Standard Postgres 15+)
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user has 'admin' role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if the current user has 'editor' or 'admin' role
CREATE OR REPLACE FUNCTION public.is_editor_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('editor', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 1. Profiles Table Security
-- ------------------------------------------------------------------------------
-- Users can view their own profile; Admins can view all profiles
CREATE POLICY "Users view own profile or admins view all"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

-- Users can update permitted fields on their own profile
CREATE POLICY "Users update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 2. Machines & Exercises & Tutorials (Public Catalog)
-- ------------------------------------------------------------------------------
-- Anyone authenticated or unauthenticated can read verified machines
CREATE POLICY "Public read verified machines"
    ON public.machines FOR SELECT
    USING (true);

-- Only admins/editors can insert, update, delete machines
CREATE POLICY "Admins insert machines"
    ON public.machines FOR INSERT
    WITH CHECK (public.is_editor_or_admin());

CREATE POLICY "Admins update machines"
    ON public.machines FOR UPDATE
    USING (public.is_editor_or_admin());

CREATE POLICY "Admins delete machines"
    ON public.machines FOR DELETE
    USING (public.is_admin());

-- Exercises & Tutorials Public Read / Admin Manage
CREATE POLICY "Public read exercises"
    ON public.exercises FOR SELECT USING (true);
CREATE POLICY "Admins manage exercises"
    ON public.exercises FOR ALL USING (public.is_editor_or_admin());

CREATE POLICY "Public read tutorials"
    ON public.tutorials FOR SELECT USING (status = 'published' OR public.is_editor_or_admin());
CREATE POLICY "Admins manage tutorials"
    ON public.tutorials FOR ALL USING (public.is_editor_or_admin());

CREATE POLICY "Public read tutorial steps"
    ON public.tutorial_steps FOR SELECT USING (true);
CREATE POLICY "Admins manage tutorial steps"
    ON public.tutorial_steps FOR ALL USING (public.is_editor_or_admin());

-- ------------------------------------------------------------------------------
-- 3. Activity Records & XP Security (Strict Isolation)
-- ------------------------------------------------------------------------------
-- Users can only read their own activity records
CREATE POLICY "Users read own activity"
    ON public.activity_records FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

-- Users can insert their own verified activity
CREATE POLICY "Users insert own activity"
    ON public.activity_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only read their own XP transactions
CREATE POLICY "Users read own xp"
    ON public.xp_transactions FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. Favorites & Achievements Security
-- ------------------------------------------------------------------------------
CREATE POLICY "Users manage own favorites"
    ON public.favorites FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public read master achievements"
    ON public.achievements FOR SELECT USING (active_status = true);

CREATE POLICY "Users read own achievement progress"
    ON public.user_achievements FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users update own achievement progress"
    ON public.user_achievements FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. Audit Logs Security (Admin Read-Only)
-- ------------------------------------------------------------------------------
CREATE POLICY "Only admins read audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_admin());

CREATE POLICY "System insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (true);
