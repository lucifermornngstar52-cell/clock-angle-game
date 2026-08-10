-- Add coins and tournament tables
-- Run in Supabase SQL Editor

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_daily_bonus DATE;

CREATE TABLE IF NOT EXISTS public.tournament (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_key TEXT NOT NULL,
  user_email TEXT NOT NULL,
  display_name TEXT,
  total_score INTEGER DEFAULT 0,
  total_gears INTEGER DEFAULT 0,
  rank INTEGER,
  coins_rewarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(week_key, user_email)
);

ALTER TABLE public.tournament ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tournament_read" ON public.tournament FOR SELECT USING (true);
CREATE POLICY "tournament_insert" ON public.tournament FOR INSERT WITH CHECK (true);
CREATE POLICY "tournament_update" ON public.tournament FOR UPDATE USING (true);

-- Function to get or create weekly tournament entry
CREATE OR REPLACE FUNCTION public.update_tournament_score(p_mail TEXT, p_score INT DEFAULT 0, p_gears INT DEFAULT 0)
RETURNS JSON AS $$
DECLARE
  wk TEXT;
  u RECORD;
  existing RECORD;
  ns INT;
  ng INT;
BEGIN
  wk := to_char(now() AT TIME ZONE 'Asia/Almaty', 'IYYY-IW');

  SELECT * INTO u FROM public.users WHERE email = p_mail;
  IF u IS NULL THEN
    RETURN json_build_object('ok', false, 'error', 'user not found');
  END IF;

  SELECT * INTO existing FROM public.tournament WHERE week_key = wk AND user_email = p_mail;

  IF existing IS NULL THEN
    INSERT INTO public.tournament (week_key, user_email, display_name, total_score, total_gears)
    VALUES (wk, p_mail, COALESCE(u.full_name, split_part(p_mail, '@', 1)), p_score, p_gears)
    RETURNING * INTO existing;
  ELSE
    ns := existing.total_score + p_score;
    ng := existing.total_gears + p_gears;
    UPDATE public.tournament SET total_score = ns, total_gears = ng
    WHERE week_key = wk AND user_email = p_mail
    RETURNING * INTO existing;
  END IF;

  RETURN json_build_object('ok', true, 'week', wk, 'score', existing.total_score, 'gears', existing.total_gears);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to claim daily bonus
CREATE OR REPLACE FUNCTION public.claim_daily_bonus(p_mail TEXT)
RETURNS JSON AS $$
DECLARE
  u RECORD;
  new_coins INT;
BEGIN
  SELECT * INTO u FROM public.users WHERE email = p_mail;
  IF u IS NULL THEN
    RETURN json_build_object('ok', false, 'error', 'user not found');
  END IF;

  IF u.last_daily_bonus = CURRENT_DATE THEN
    RETURN json_build_object('ok', false, 'error', 'already claimed');
  END IF;

  new_coins := COALESCE(u.coins, 0) + 5;
  UPDATE public.users SET coins = new_coins, last_daily_bonus = CURRENT_DATE
  WHERE email = p_mail;

  RETURN json_build_object('ok', true, 'coins', new_coins, 'bonus', 5);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to claim ad reward
CREATE OR REPLACE FUNCTION public.claim_ad_reward(p_mail TEXT)
RETURNS JSON AS $$
DECLARE
  u RECORD;
  new_coins INT;
BEGIN
  SELECT * INTO u FROM public.users WHERE email = p_mail;
  IF u IS NULL THEN
    RETURN json_build_object('ok', false, 'error', 'user not found');
  END IF;

  new_coins := COALESCE(u.coins, 0) + 3;
  UPDATE public.users SET coins = new_coins WHERE email = p_mail;

  RETURN json_build_object('ok', true, 'coins', new_coins, 'reward', 3);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to spend coins
CREATE OR REPLACE FUNCTION public.spend_coins(p_mail TEXT, p_amount INT)
RETURNS JSON AS $$
DECLARE
  u RECORD;
  new_coins INT;
BEGIN
  SELECT * INTO u FROM public.users WHERE email = p_mail;
  IF u IS NULL THEN
    RETURN json_build_object('ok', false, 'error', 'user not found');
  END IF;

  IF COALESCE(u.coins, 0) < p_amount THEN
    RETURN json_build_object('ok', false, 'error', 'not enough coins', 'coins', COALESCE(u.coins, 0));
  END IF;

  new_coins := COALESCE(u.coins, 0) - p_amount;
  UPDATE public.users SET coins = new_coins WHERE email = p_mail;

  RETURN json_build_object('ok', true, 'coins', new_coins, 'spent', p_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get weekly tournament leaderboard
CREATE OR REPLACE FUNCTION public.get_tournament(p_limit INT DEFAULT 20)
RETURNS JSON AS $$
DECLARE
  result JSON;
  wk TEXT;
BEGIN
  wk := to_char(now() AT TIME ZONE 'Asia/Almaty', 'IYYY-IW');

  SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.total_score DESC), '[]'::json) INTO result
  FROM (
    SELECT user_email, display_name, total_score, total_gears,
           ROW_NUMBER() OVER (ORDER BY total_score DESC) as rank
    FROM public.tournament WHERE week_key = wk
    LIMIT p_limit
  ) t;

  RETURN json_build_object('ok', true, 'week', wk, 'leaderboard', result);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
