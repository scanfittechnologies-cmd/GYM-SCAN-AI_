-- ==============================================================================
-- GYM SCAN AI — Database Schema Migration 01: Initial Tables & Indexes
-- Target DB: PostgreSQL (Supabase / Standard Postgres 15+)
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_seed TEXT DEFAULT 'lifter_01',
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'editor', 'admin')),
    experience_level TEXT DEFAULT 'Beginner' CHECK (experience_level IN ('Beginner', 'Intermediate', 'Advanced')),
    sound_enabled BOOLEAN DEFAULT TRUE,
    haptic_enabled BOOLEAN DEFAULT TRUE,
    privacy_mode BOOLEAN DEFAULT FALSE,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    verified_scan_count INTEGER DEFAULT 0,
    unique_machine_count INTEGER DEFAULT 0,
    tutorials_completed_count INTEGER DEFAULT 0,
    achievements_unlocked_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Machines Table
CREATE TABLE IF NOT EXISTS public.machines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    tagline TEXT,
    difficulty TEXT NOT NULL DEFAULT 'Beginner',
    equipment_type TEXT NOT NULL,
    qr_code_id TEXT UNIQUE NOT NULL,
    match_keywords TEXT[] DEFAULT '{}',
    image_svg TEXT DEFAULT 'chest-press',
    description TEXT NOT NULL,
    setup_instructions TEXT[] DEFAULT '{}',
    movement_guidance TEXT[] DEFAULT '{}',
    safety_reminders TEXT[] DEFAULT '{}',
    video_duration_sec INTEGER DEFAULT 30,
    featured BOOLEAN DEFAULT FALSE,
    verification_status TEXT DEFAULT 'Verified' CHECK (verification_status IN ('Verified', 'Pending Review', 'Community Sample', 'Demo Sample')),
    gym_id TEXT DEFAULT 'metro-fitness-flagship',
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Exercises Table
CREATE TABLE IF NOT EXISTS public.exercises (
    id TEXT PRIMARY KEY,
    machine_id TEXT REFERENCES public.machines(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    main_muscle TEXT NOT NULL,
    secondary_muscles TEXT[] DEFAULT '{}',
    description TEXT,
    difficulty TEXT DEFAULT 'Beginner',
    setup_guidance TEXT[] DEFAULT '{}',
    movement_steps TEXT[] DEFAULT '{}',
    breathing_cues TEXT,
    safety_reminder TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tutorials Table
CREATE TABLE IF NOT EXISTS public.tutorials (
    id TEXT PRIMARY KEY,
    machine_id TEXT REFERENCES public.machines(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    video_url TEXT,
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    verification_status TEXT DEFAULT 'Verified',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tutorial Steps Table
CREATE TABLE IF NOT EXISTS public.tutorial_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutorial_id TEXT REFERENCES public.tutorials(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Activity Records Table
CREATE TABLE IF NOT EXISTS public.activity_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    machine_id TEXT REFERENCES public.machines(id) ON DELETE SET NULL,
    machine_name TEXT NOT NULL,
    machine_category TEXT,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('qr_scan', 'photo_scan', 'tutorial_viewed', 'achievement_unlocked', 'favorite_saved')),
    scan_method TEXT DEFAULT 'none' CHECK (scan_method IN ('qr', 'photo', 'manual', 'none')),
    xp_awarded INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Verified' CHECK (status IN ('Verified', 'Completed', 'Unlocked', 'Demo', 'Pending')),
    confidence NUMERIC DEFAULT 100,
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. XP Transactions Table
CREATE TABLE IF NOT EXISTS public.xp_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    machine_id TEXT REFERENCES public.machines(id) ON DELETE SET NULL,
    activity_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Achievements Master Table
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirement TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('discovery', 'learning', 'consistency', 'mastery')),
    target_count INTEGER NOT NULL,
    reward_xp INTEGER NOT NULL,
    active_status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. User Achievements Table
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id TEXT REFERENCES public.achievements(id) ON DELETE CASCADE,
    current_count INTEGER DEFAULT 0,
    unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMPTZ,
    reward_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- 10. Favorites Table
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    machine_id TEXT REFERENCES public.machines(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, machine_id)
);

-- 11. Audit Logs Table (Admin Security)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    target_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Fast Query Performance
CREATE INDEX IF NOT EXISTS idx_machines_category ON public.machines(category);
CREATE INDEX IF NOT EXISTS idx_machines_qr ON public.machines(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON public.activity_records(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_user ON public.xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements ON public.user_achievements(user_id);
