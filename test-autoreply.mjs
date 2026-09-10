import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, instagram_id, auto_reply_enabled, auto_reply_variations');
  
  if (error) console.error(error);
  else console.log("Profiles:", JSON.stringify(profiles, null, 2));

  const { data: events, error: err2 } = await supabase
    .from('webhook_events')
    .select('*')
    .order('processed_at', { ascending: false })
    .limit(3);
    
  if (err2) console.error(err2);
  else console.log("Webhook Events:", JSON.stringify(events, null, 2));
}

run();
