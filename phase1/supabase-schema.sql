-- Clash Market App Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read any profile"
  ON users FOR SELECT
  USING (true);

-- Simplified policy for testing - allows any updates to users
CREATE POLICY "Anyone can update users"
  ON users FOR UPDATE
  USING (true);

CREATE POLICY "Service role can insert users"
  ON users FOR INSERT
  WITH CHECK (true);

-- Sessions table (for encrypted private keys)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  encrypted_session_data TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable Row Level Security for sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions
CREATE POLICY "Users can only access their own sessions"
  ON sessions FOR ALL
  USING (auth.uid() = user_id);

-- Tournaments table
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  prize_pool NUMERIC NOT NULL DEFAULT 0,
  entry_fee NUMERIC NOT NULL DEFAULT 0,
  max_participants INTEGER DEFAULT 32,
  registration_open BOOLEAN DEFAULT true,
  is_private BOOLEAN DEFAULT false,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for tournaments
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tournaments
CREATE POLICY "Anyone can read tournaments"
  ON tournaments FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify tournaments"
  ON tournaments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Participants table
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('registered', 'active', 'eliminated', 'winner')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (tournament_id, user_id)
);

-- Enable Row Level Security for participants
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for participants
CREATE POLICY "Anyone can read participants"
  ON participants FOR SELECT
  USING (true);

CREATE POLICY "Users can register themselves"
  ON participants FOR INSERT
  USING (auth.uid() = user_id);

CREATE POLICY "Only tournament admins can update participants"
  ON participants FOR UPDATE DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- PVP Matches table
CREATE TABLE pvp_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  winner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  loser_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  winner_score INTEGER NOT NULL,
  loser_score INTEGER NOT NULL,
  match_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  match_data JSONB DEFAULT NULL, -- For storing additional match details
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for matches
ALTER TABLE pvp_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for matches
CREATE POLICY "Anyone can read matches"
  ON pvp_matches FOR SELECT
  USING (true);

CREATE POLICY "Users can record matches they participated in"
  ON pvp_matches FOR INSERT
  WITH CHECK (auth.uid() = winner_id OR auth.uid() = loser_id);

-- Weekly Rankings table
CREATE TABLE weekly_rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  points NUMERIC NOT NULL DEFAULT 0,
  rank_change INTEGER DEFAULT NULL, -- Positive means improved, negative means dropped
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, week_number, year)
);

-- Enable Row Level Security for weekly_rankings
ALTER TABLE weekly_rankings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for weekly_rankings
CREATE POLICY "Anyone can read rankings"
  ON weekly_rankings FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify rankings"
  ON weekly_rankings FOR INSERT UPDATE DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Function to get all-time top rankings
CREATE OR REPLACE FUNCTION get_all_time_top_rankings(row_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  wallet_address TEXT,
  avatar_url TEXT,
  total_points NUMERIC,
  best_rank INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.username,
    u.wallet_address,
    u.avatar_url,
    COALESCE(SUM(wr.points), 0) as total_points,
    COALESCE(MIN(wr.rank), NULL) as best_rank
  FROM 
    users u
  LEFT JOIN 
    weekly_rankings wr ON u.id = wr.user_id
  GROUP BY 
    u.id, u.username, u.wallet_address, u.avatar_url
  ORDER BY 
    total_points DESC, best_rank ASC NULLS LAST
  LIMIT row_limit;
END;
$$ LANGUAGE plpgsql;

-- Games table for PVP competitions
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_code VARCHAR(8) UNIQUE,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  opponent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  principal_amount NUMERIC NOT NULL DEFAULT 0,
  pot_amount NUMERIC NOT NULL DEFAULT 0,
  token VARCHAR(10) DEFAULT 'SOL',  -- Token type (e.g., SOL, USDC, etc.)
  duration INTEGER DEFAULT 300,      -- Game duration in seconds
  is_private BOOLEAN DEFAULT FALSE,  -- Whether the game is private or public
  status TEXT NOT NULL CHECK (status IN ('created', 'joined', 'active', 'completed', 'canceled')),
  winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  private_key_session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for games
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- RLS Policies for games
CREATE POLICY "Anyone can read games"
  ON games FOR SELECT
  USING (true);

-- Modified policy to allow game creation without auth.uid() validation
-- Instead, we'll rely on client-side and server-side validation
CREATE POLICY "Anyone can create games"
  ON games FOR INSERT
  WITH CHECK (true);

-- Modified policy to allow updates based on client-side validation
CREATE POLICY "Anyone can update games"
  ON games FOR UPDATE
  USING (true);
  
-- We'll rely on application logic to validate users

-- Function to generate a unique game code
CREATE OR REPLACE FUNCTION generate_unique_game_code() 
RETURNS VARCHAR(8) AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Removed similar looking characters
  result VARCHAR(8) := '';
  i INTEGER := 0;
  pos INTEGER := 0;
BEGIN
  -- Generate an 8 character code
  FOR i IN 1..8 LOOP
    pos := 1 + floor(random() * length(chars));
    result := result || substring(chars from pos for 1);
  END LOOP;
  
  -- Check if it exists and regenerate if needed
  WHILE EXISTS (SELECT 1 FROM games WHERE game_code = result) LOOP
    result := '';
    FOR i IN 1..8 LOOP
      pos := 1 + floor(random() * length(chars));
      result := result || substring(chars from pos for 1);
    END LOOP;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Trigger to automatically generate game code on insert
CREATE OR REPLACE FUNCTION set_game_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.game_code IS NULL THEN
    NEW.game_code := generate_unique_game_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER games_set_game_code
BEFORE INSERT ON games
FOR EACH ROW
EXECUTE FUNCTION set_game_code();

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER games_set_updated_at
BEFORE UPDATE ON games
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Index for game lookups
CREATE INDEX idx_games_game_code ON games(game_code);
CREATE INDEX idx_games_creator ON games(creator_id);
CREATE INDEX idx_games_opponent ON games(opponent_id);
CREATE INDEX idx_games_status ON games(status);
