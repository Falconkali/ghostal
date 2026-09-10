const { createClient } = require("@supabase/supabase-js");

const url = "https://gizrjjhevdewikevklmc.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpenJqamhldmRld2lrZXZrbG1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcyNjAwNSwiZXhwIjoyMDk1MzAyMDA1fQ.YnTtixm8d5BAHCBiQJ4uVkdrFq70vCstHhEKCiAG-W8";

const supabase = createClient(url, serviceKey);

async function run() {
  const res = await supabase.from("webhook_events").upsert(
    {
      event_type: "comment",
      instagram_media_id: "7777777777777",
      instagram_object_id: "26928814340115341_comment_test",
      idempotency_key: "26928814340115341_comment_test",
      payload: { test: true },
      processed_at: new Date().toISOString(),
      user_id: "b3060d6a-166e-4d14-ba66-68d8edadce79",
    },
    { onConflict: "idempotency_key", ignoreDuplicates: true }
  );

  console.log("Supabase response:", res);
}

run();
