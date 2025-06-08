-- Main session tracking
CREATE TABLE simulation_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_fingerprint TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    device_info JSONB,
    ip_country TEXT,
    total_scenarios_completed INTEGER DEFAULT 0,
    final_score INTEGER
);

-- Detailed click tracking
CREATE TABLE click_events (
    event_id BIGSERIAL PRIMARY KEY,
    session_id UUID REFERENCES simulation_sessions(session_id),
    scenario_type TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    click_coordinates POINT NOT NULL,
    target_element TEXT NOT NULL,
    hover_duration_ms INTEGER,
    was_successful_attack BOOLEAN,
    user_realized_attack BOOLEAN DEFAULT FALSE
);

-- Form input capture for banking scenario
CREATE TABLE captured_credentials (
    capture_id BIGSERIAL PRIMARY KEY,
    session_id UUID REFERENCES simulation_sessions(session_id),
    scenario_id TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    field_name TEXT NOT NULL,
    captured_value TEXT NOT NULL,
    keystrokes_timing JSONB,
    time_to_complete_ms INTEGER
);

-- Learning analytics
CREATE TABLE learning_progress (
    progress_id BIGSERIAL PRIMARY KEY,
    session_id UUID REFERENCES simulation_sessions(session_id),
    scenario_type TEXT NOT NULL,
    attempt_number INTEGER NOT NULL,
    time_to_understand_ms INTEGER,
    replay_count INTEGER DEFAULT 0,
    used_transparency_slider BOOLEAN DEFAULT FALSE,
    checked_for_attacks_proactively BOOLEAN DEFAULT FALSE,
    reflection_answer TEXT
);

-- Attack revelation engagement
CREATE TABLE revelation_analytics (
    revelation_id BIGSERIAL PRIMARY KEY,
    session_id UUID REFERENCES simulation_sessions(session_id),
    scenario_type TEXT NOT NULL,
    revelation_phase TEXT NOT NULL,
    time_spent_ms INTEGER,
    interaction_type TEXT,
    understood_indicator BOOLEAN
);

-- Real-time attacker dashboard display
CREATE TABLE attacker_dashboard_view (
    entry_id BIGSERIAL PRIMARY KEY,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    victim_session TEXT,
    data_type TEXT,
    captured_data JSONB,
    estimated_value_usd DECIMAL(10,2),
    status TEXT DEFAULT 'fresh'
);

-- Indexes for performance
CREATE INDEX idx_click_events_session ON click_events(session_id);
CREATE INDEX idx_click_events_timestamp ON click_events(timestamp);
CREATE INDEX idx_captured_credentials_session ON captured_credentials(session_id);
CREATE INDEX idx_learning_progress_session ON learning_progress(session_id);

-- Row Level Security
ALTER TABLE simulation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE click_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE captured_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE revelation_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE attacker_dashboard_view ENABLE ROW LEVEL SECURITY;

-- Policies for anonymous access (educational purposes)
CREATE POLICY "Enable insert for all users" ON simulation_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for all users" ON simulation_sessions FOR SELECT USING (true);
CREATE POLICY "Enable update for all users" ON simulation_sessions FOR UPDATE USING (true);

CREATE POLICY "Enable insert for all users" ON click_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for all users" ON click_events FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON captured_credentials FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for all users" ON captured_credentials FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON learning_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for all users" ON learning_progress FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON revelation_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for all users" ON revelation_analytics FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON attacker_dashboard_view FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for all users" ON attacker_dashboard_view FOR SELECT USING (true);
CREATE POLICY "Enable update for all users" ON attacker_dashboard_view FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON attacker_dashboard_view FOR DELETE USING (true);