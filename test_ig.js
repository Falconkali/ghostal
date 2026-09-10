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

  const mediaUrl = "https://graph.instagram.com/v21.0/" + data.instagram_id + "/media?fields=id,comments_count&limit=1&access_token=" + token;
  const mediaRes = await fetch(mediaUrl).then(r => r.json());
  console.log('Media:', JSON.stringify(mediaRes));

  if (mediaRes.data && mediaRes.data.length > 0) {
    const mediaId = mediaRes.data[0].id;
    
    const url1 = "https://graph.instagram.com/v21.0/" + mediaId + "/comments?fields=id,text,timestamp,username&access_token=" + token;
    console.log('Test Comments (username):', JSON.stringify(await fetch(url1).then(r => r.json())));
  }
}

test().catch(console.error);
