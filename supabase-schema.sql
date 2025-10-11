-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Create enum types
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE content_type AS ENUM ('video', 'text', 'game', 'exercise', 'vocabulary');
-- game_type enum removed: games table simplified to core metadata only
CREATE TYPE exercise_type AS ENUM ('fill_gaps', 'matching', 'dialogue');
CREATE TYPE activation_code_status AS ENUM ('active', 'used', 'expired');

-- Activation codes table
CREATE TABLE public.activation_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    max_uses INTEGER DEFAULT 1,
    used_count INTEGER DEFAULT 0,
    status activation_code_status DEFAULT 'active',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID, -- references admin who created it
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (standalone, not extending Supabase auth)
CREATE TABLE public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'student',
    selected_profession_id UUID,
    activation_code_id UUID REFERENCES activation_codes(id),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table for authentication
CREATE TABLE public.user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professions/Kierunki kształcenia
CREATE TABLE public.professions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vocabulary categories for each profession
CREATE TABLE public.vocabulary_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profession_id UUID REFERENCES professions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vocabulary entries
CREATE TABLE public.vocabulary (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES vocabulary_categories(id) ON DELETE CASCADE,
    term_en TEXT NOT NULL,
    term_pl TEXT NOT NULL,
    definition_en TEXT,
    definition_pl TEXT,
    pronunciation TEXT,
    audio_url TEXT,
    image_url TEXT,
    example_sentence_en TEXT,
    example_sentence_pl TEXT,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Educational videos
CREATE TABLE public.videos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profession_id UUID REFERENCES professions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description TEXT,
    description_en TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER, -- in seconds
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video vocabulary (key terms from videos)
CREATE TABLE public.video_vocabulary (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
    timestamp_start INTEGER, -- when term appears in video (seconds)
    timestamp_end INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games
-- Games: simplified schema to keep core metadata (id, title, description, difficulty_level)
CREATE TABLE public.games (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game vocabulary assignments
CREATE TABLE public.game_vocabulary (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interactive exercises
CREATE TABLE public.exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profession_id UUID REFERENCES professions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description TEXT,
    exercise_type exercise_type NOT NULL,
    content JSONB NOT NULL, -- exercise content and structure
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professional texts
CREATE TABLE public.professional_texts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profession_id UUID REFERENCES professions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    title_en TEXT NOT NULL,
    content TEXT NOT NULL,
    content_en TEXT NOT NULL,
    summary TEXT,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    reading_time INTEGER, -- estimated reading time in minutes
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Text exercises (comprehension questions, term translations, etc.)
CREATE TABLE public.text_exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    text_id UUID REFERENCES professional_texts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    questions JSONB NOT NULL, -- array of questions with answers
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress tracking
CREATE TABLE public.user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_type content_type NOT NULL,
    content_id UUID NOT NULL, -- references various content tables
    completed BOOLEAN DEFAULT FALSE,
    score INTEGER,
    time_spent INTEGER, -- in seconds
    attempts INTEGER DEFAULT 1,
    last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User vocabulary learning progress
CREATE TABLE public.user_vocabulary_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 5),
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    review_count INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, vocabulary_id)
);

-- Presentation materials for professions
CREATE TABLE public.profession_presentations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profession_id UUID REFERENCES professions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    title_en TEXT NOT NULL,
    presentation_url TEXT,
    slides_data JSONB, -- slide content if stored in DB
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial professions data
INSERT INTO public.professions (name, name_en, description) VALUES
('Technik informatyk', 'IT Technician', 'Specjalista ds. systemów informatycznych'),
('Technik programista', 'Programming Technician', 'Specjalista ds. programowania aplikacji'),
('Technik grafiki i poligrafii cyfrowej', 'Digital Graphics and Printing Technician', 'Specjalista ds. grafiki cyfrowej i druku'),
('Technik reklamy', 'Advertising Technician', 'Specjalista ds. reklamy i marketingu'),
('Technik fotografii i multimediów', 'Photography and Multimedia Technician', 'Specjalista ds. fotografii i multimediów'),
('Technik przemysłu mody', 'Fashion Industry Technician', 'Specjalista ds. przemysłu mody'),
('Technik logistyk', 'Logistics Technician', 'Specjalista ds. logistyki i magazynowania');

-- Create default admin user (password: admin123)
INSERT INTO public.users (username, email, password_hash, full_name, role, is_active) VALUES
('admin', 'admin@vocenglish.com', crypt('admin123', gen_salt('bf')), 'Administrator', 'admin', true);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_profession ON users(selected_profession_id);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_activation_codes_code ON activation_codes(code);
CREATE INDEX idx_activation_codes_status ON activation_codes(status);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_vocabulary_category ON vocabulary(category_id);
CREATE INDEX idx_vocabulary_terms ON vocabulary(term_en, term_pl);
CREATE INDEX idx_videos_profession ON videos(profession_id);
-- idx_games_profession removed: games no longer references profession_id
CREATE INDEX idx_exercises_profession ON exercises(profession_id);
CREATE INDEX idx_texts_profession ON professional_texts(profession_id);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_content ON user_progress(content_type, content_id);
CREATE INDEX idx_user_vocab_progress ON user_vocabulary_progress(user_id, vocabulary_id);

-- Functions for authentication and user management

-- Function to generate activation code
CREATE OR REPLACE FUNCTION public.generate_activation_code(
    p_description TEXT DEFAULT NULL,
    p_max_uses INTEGER DEFAULT 1,
    p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    v_code TEXT;
BEGIN
    -- Generate a random 8-character code
    v_code := UPPER(substring(md5(random()::text) from 1 for 8));
    
    -- Insert the code
    INSERT INTO public.activation_codes (code, description, max_uses, expires_at, created_by)
    VALUES (v_code, p_description, p_max_uses, p_expires_at, p_created_by);
    
    RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate activation code
CREATE OR REPLACE FUNCTION public.validate_activation_code(p_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_code_record RECORD;
BEGIN
    SELECT * INTO v_code_record
    FROM public.activation_codes
    WHERE code = p_code;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if code is active
    IF v_code_record.status != 'active' THEN
        RETURN FALSE;
    END IF;
    
    -- Check if code has expired
    IF v_code_record.expires_at IS NOT NULL AND v_code_record.expires_at < NOW() THEN
        UPDATE public.activation_codes SET status = 'expired' WHERE id = v_code_record.id;
        RETURN FALSE;
    END IF;
    
    -- Check if code has reached max uses
    IF v_code_record.used_count >= v_code_record.max_uses THEN
        UPDATE public.activation_codes SET status = 'used' WHERE id = v_code_record.id;
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to register new user with activation code
CREATE OR REPLACE FUNCTION public.register_user(
    p_username TEXT,
    p_email TEXT,
    p_password TEXT,
    p_full_name TEXT,
    p_activation_code TEXT
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_code_id UUID;
    v_password_hash TEXT;
BEGIN
    -- Validate activation code
    IF NOT public.validate_activation_code(p_activation_code) THEN
        RAISE EXCEPTION 'Invalid or expired activation code';
    END IF;
    
    -- Get activation code ID
    SELECT id INTO v_code_id
    FROM public.activation_codes
    WHERE code = p_activation_code;
    
    -- Hash password
    v_password_hash := crypt(p_password, gen_salt('bf'));
    
    -- Create user
    INSERT INTO public.users (username, email, password_hash, full_name, activation_code_id)
    VALUES (p_username, p_email, v_password_hash, p_full_name, v_code_id)
    RETURNING id INTO v_user_id;
    
    -- Update activation code usage
    UPDATE public.activation_codes
    SET used_count = used_count + 1,
        updated_at = NOW()
    WHERE id = v_code_id;
    
    -- Mark as used if max uses reached
    UPDATE public.activation_codes
    SET status = 'used'
    WHERE id = v_code_id AND used_count >= max_uses;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to authenticate user
CREATE OR REPLACE FUNCTION public.authenticate_user(
    p_username TEXT,
    p_password TEXT
)
RETURNS TABLE(user_id UUID, session_token TEXT) AS $$
DECLARE
    v_user_record RECORD;
    v_session_token TEXT;
    v_session_id UUID;
BEGIN
    -- Get user record
    SELECT * INTO v_user_record
    FROM public.users
    WHERE username = p_username AND is_active = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid username or password';
    END IF;
    
    -- Verify password
    IF v_user_record.password_hash != crypt(p_password, v_user_record.password_hash) THEN
        RAISE EXCEPTION 'Invalid username or password';
    END IF;
    
    -- Generate session token
    v_session_token := encode(gen_random_bytes(32), 'hex');
    
    -- Create session
    INSERT INTO public.user_sessions (user_id, session_token, expires_at)
    VALUES (v_user_record.id, v_session_token, NOW() + INTERVAL '30 days')
    RETURNING id INTO v_session_id;
    
    -- Update last login
    UPDATE public.users SET last_login = NOW() WHERE id = v_user_record.id;
    
    RETURN QUERY SELECT v_user_record.id, v_session_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user from session
CREATE OR REPLACE FUNCTION public.get_current_user(p_session_token TEXT)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT us.user_id INTO v_user_id
    FROM public.user_sessions us
    JOIN public.users u ON us.user_id = u.id
    WHERE us.session_token = p_session_token
    AND us.expires_at > NOW()
    AND u.is_active = true;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to logout user
CREATE OR REPLACE FUNCTION public.logout_user(p_session_token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM public.user_sessions WHERE session_token = p_session_token;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean expired sessions
CREATE OR REPLACE FUNCTION public.clean_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM public.user_sessions WHERE expires_at < NOW();
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activation_codes_updated_at BEFORE UPDATE ON public.activation_codes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_professions_updated_at BEFORE UPDATE ON public.professions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vocabulary_updated_at BEFORE UPDATE ON public.vocabulary
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON public.videos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON public.exercises
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_professional_texts_updated_at BEFORE UPDATE ON public.professional_texts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_vocabulary_progress_updated_at BEFORE UPDATE ON public.user_vocabulary_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profession_presentations_updated_at BEFORE UPDATE ON public.profession_presentations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.text_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_vocabulary_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profession_presentations ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own data
CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT USING (
        id = public.get_current_user(current_setting('request.headers', true)::json->>'authorization')
    );

-- Users can update their own data (except sensitive fields)
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (
        id = public.get_current_user(current_setting('request.headers', true)::json->>'authorization')
    );

-- Only authenticated users can access their sessions
CREATE POLICY "Users can manage own sessions" ON public.user_sessions
    FOR ALL USING (
        user_id = public.get_current_user(current_setting('request.headers', true)::json->>'authorization')
    );

-- Everyone can read active professions
CREATE POLICY "Everyone can read professions" ON public.professions
    FOR SELECT USING (is_active = true);

-- Everyone can read vocabulary and related content
CREATE POLICY "Everyone can read vocabulary_categories" ON public.vocabulary_categories
    FOR SELECT USING (true);

CREATE POLICY "Everyone can read vocabulary" ON public.vocabulary
    FOR SELECT USING (true);

CREATE POLICY "Everyone can read videos" ON public.videos
    FOR SELECT USING (is_active = true);

CREATE POLICY "Everyone can read video_vocabulary" ON public.video_vocabulary
    FOR SELECT USING (true);

CREATE POLICY "Everyone can read games" ON public.games
    FOR SELECT USING (is_active = true);

CREATE POLICY "Everyone can read game_vocabulary" ON public.game_vocabulary
    FOR SELECT USING (true);

CREATE POLICY "Everyone can read exercises" ON public.exercises
    FOR SELECT USING (is_active = true);

CREATE POLICY "Everyone can read professional_texts" ON public.professional_texts
    FOR SELECT USING (is_active = true);

CREATE POLICY "Everyone can read text_exercises" ON public.text_exercises
    FOR SELECT USING (true);

CREATE POLICY "Everyone can read profession_presentations" ON public.profession_presentations
    FOR SELECT USING (is_active = true);

-- Users can manage their own progress
CREATE POLICY "Users can manage own progress" ON public.user_progress
    FOR ALL USING (
        user_id = public.get_current_user(current_setting('request.headers', true)::json->>'authorization')
    );

CREATE POLICY "Users can manage own vocabulary progress" ON public.user_vocabulary_progress
    FOR ALL USING (
        user_id = public.get_current_user(current_setting('request.headers', true)::json->>'authorization')
    );

-- Admin policies (for CMS)
CREATE POLICY "Admins can manage all users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = public.get_current_user(current_setting('request.headers', true)::json->>'authorization')
            AND u.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage activation codes" ON public.activation_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = public.get_current_user(current_setting('request.headers', true)::json->>'authorization')
            AND u.role = 'admin'
        )
    );

-- Apply admin policies to all content tables
CREATE POLICY "Admins can manage all content" ON public.professions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = public.get_current_user(current_setting('request.headers', true)::json->>'authorization')
            AND u.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage vocabulary_categories" ON public.vocabulary_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = public.get_current_user(current_setting('request.headers', true)::json->>'authorization')
            AND u.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage vocabulary" ON public.vocabulary
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = public.get_current_user(current_setting('request.headers', true)::json->>'authorization')
            AND u.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage videos" ON public.videos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = public.get_current_user(current_setting('request.headers', true)::json->>'authorization')
            AND u.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage games" ON public.games
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = public.get_current_user(current_setting('request.headers', true)::json->>'authorization')
            AND u.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage exercises" ON public.exercises
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = public.get_current_user(current_setting('request.headers', true)::json->>'authorization')
            AND u.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage professional_texts" ON public.professional_texts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = public.get_current_user(current_setting('request.headers', true)::json->>'authorization')
            AND u.role = 'admin'
        )
    );

-- Create a scheduled job to clean expired sessions (run daily)
SELECT cron.schedule('clean-expired-sessions', '0 2 * * *', 'SELECT public.clean_expired_sessions();');