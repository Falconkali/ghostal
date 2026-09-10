import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

function decrypt(encryptedText) {
  const [ivHex, authTagHex, encryptedDataHex] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encryptedData = Buffer.from(encryptedDataHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedData, undefined, 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

async function testPublish() {
  const postId = 'c240745b-0237-4308-ad1e-5c2f6c31672f';
  const userId = '9ef55914-50b2-4883-9056-f54fcc6ef6f4';

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
  const accessToken = decrypt(profile.instagram_token);
  
  const { data: post } = await supabase.from("scheduled_posts").select("*").eq("id", postId).single();
  const { data: vaultItem } = await supabase.from("vault_items").select("*").eq("id", post.vault_item_id).single();

  const containerParams = {
    caption: post.caption || "",
    access_token: accessToken,
    image_url: vaultItem.media_url,
  };

  console.log("Sending to Instagram...");
  const containerRes = await fetch(
    `https://graph.instagram.com/v21.0/${profile.instagram_id}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(containerParams),
    }
  );
  
  const containerData = await containerRes.json();
  console.log("Response:", containerData);
}

testPublish().catch(console.error);
