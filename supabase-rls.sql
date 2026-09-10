-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE survival_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_inbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Table Policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 2. Vault Items Policies
CREATE POLICY "Users can view own vault items" 
ON vault_items FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vault items" 
ON vault_items FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vault items" 
ON vault_items FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vault items" 
ON vault_items FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Scheduled Posts Policies
CREATE POLICY "Users can view own scheduled posts" 
ON scheduled_posts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled posts" 
ON scheduled_posts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled posts" 
ON scheduled_posts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled posts" 
ON scheduled_posts FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Survival Logs Policies
CREATE POLICY "Users can view own survival logs" 
ON survival_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own survival logs" 
ON survival_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 5. Engagement Events Policies
CREATE POLICY "Users can view own engagement events" 
ON engagement_events FOR SELECT 
USING (auth.uid() = user_id);

-- 6. DM Inbox Policies
CREATE POLICY "Users can view own DMs" 
ON dm_inbox FOR SELECT 
USING (auth.uid() = user_id);

-- 7. Contact Messages (Public can insert, admin can read)
-- Assuming contact_messages doesn't have a user_id, or is for site admins
CREATE POLICY "Anyone can insert contact messages" 
ON contact_messages FOR INSERT 
WITH CHECK (true);

-- 8. Webhook Events (Only service role can insert/read, no public access)
-- By enabling RLS without policies, we restrict access to postgres/service_role only.

-- Storage Bucket Policies
-- (Assuming bucket 'profile-avatars' exists)
-- Note: Replace 'profile-avatars' with actual bucket id if different
-- CREATE POLICY "Avatar images are publicly accessible."
--   ON storage.objects FOR SELECT
--   USING ( bucket_id = 'profile-avatars' );
-- CREATE POLICY "Users can upload their own avatar."
--   ON storage.objects FOR INSERT
--   WITH CHECK ( bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1] );
