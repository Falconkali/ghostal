require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

async function test() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data } = await supabase
    .from('profiles')
    .select('instagram_token, instagram_id')
    .eq('id', 'd41334f0-5fd9-437c-813f-8bfff930e9e2')
    .single();

  if (!data || !data.instagram_token) {
    console.log('No token found');
    return;
  }

  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  
  const textParts = data.instagram_token.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const authTag = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  let token = decipher.update(encryptedText, undefined, 'utf8');
  token += decipher.final('utf8');

  console.log('Token starts with:', token.substring(0, 10));

  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  console.log('Using Meta App ID:', appId);
  
  try {
    const debugUrl = "https://graph.facebook.com/debug_token?input_token=" + token + "&access_token=" + appId + "|" + appSecret;
    const debugRes = await fetch(debugUrl).then(r => r.json());
    console.log('FB Debug Token:', JSON.stringify(debugRes));
  } catch(e) {
    console.error('FB debug error:', e);
  }

  // test graph.facebook.com media edge
  const fbMediaUrl = "https://graph.facebook.com/v21.0/" + data.instagram_id + "/media?fields=id,comments_count&limit=1&access_token=" + token;
  console.log('Fetching FB Media:', fbMediaUrl);
  const fbMediaRes = await fetch(fbMediaUrl).then(r => r.json());
  console.log('FB Media:', JSON.stringify(fbMediaRes));

  if (fbMediaRes.data && fbMediaRes.data.length > 0) {
    const mediaId = fbMediaRes.data[0].id;
    const fbCommentsUrl = "https://graph.facebook.com/v21.0/" + mediaId + "/comments?access_token=" + token;
    console.log('FB Comments:', JSON.stringify(await fetch(fbCommentsUrl).then(r => r.json())));
  }
}

test().catch(console.error);
