import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: webhooks, error: wErr } = await supabase
    .from('webhook_events')
    .select('*')
    .order('processed_at', { ascending: false })
    .limit(5);

  console.log("Latest Webhooks:");
  if (wErr) console.error(wErr);
  else console.log(JSON.stringify(webhooks, null, 2));

  const { data: engagements, error: eErr } = await supabase
    .from('engagement_events')
    .select('*')
    .order('occurred_at', { ascending: false })
    .limit(5);

  console.log("\nLatest Engagements:");
  if (eErr) console.error(eErr);
  else console.log(JSON.stringify(engagements, null, 2));
}

run();
