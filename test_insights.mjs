import crypto from "crypto";

const ENCRYPTION_KEY = "4e58186004ab60c36fa28a73d37efa00b3c6f8c1a65a615074080554b6756afe";
const encryptedToken = "1cd0bdd3b842b5d3c109fa2f:f251f44776b7f92705f36d6a146f756f:4042454b2e01df5da254fece27ff6f68f0b1a995b3e58d6879433ffbe2011ea81a497418279b3a0834c746a58f58931d1d888b06a3bc2cdb24185af13b8a55178bcb01a7b47bba0c9b4a4a6212de802f78ac7875b58434faa96ddfad3f6136b79267547a8a676951e9837926ccd7f4ee07b5725f3216286dbabc877d414a68744a9dc44250f8c28fbb6c0274007e5be4aae734be5de44600368892a72a3a13c247ece87b8b";

function getKey() {
  if (ENCRYPTION_KEY.length === 64) {
    try {
      return Buffer.from(ENCRYPTION_KEY, "hex");
    } catch {}
  }
  return crypto.scryptSync(ENCRYPTION_KEY, "ghostflow-salt-key-derivation", 32);
}

function decrypt(encryptedText) {
  const parts = encryptedText.split(":");
  const ivHex = parts[0];
  const authTagHex = parts[1];
  const encryptedHex = parts[2];
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const key = getKey();

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, undefined, "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

async function run() {
  const token = decrypt(encryptedToken);
  const igUserId = "26928814340115341";
  console.log("Decrypted token...");

  const url = `https://graph.instagram.com/v21.0/${igUserId}/media?fields=id&limit=1&access_token=${token}`;
  
  console.log("Fetching media...");
  const res = await fetch(url);
  const data = await res.json();
  
  if (data.data && data.data.length > 0) {
    const mediaId = data.data[0].id;
    console.log("Got media ID:", mediaId);
    
    console.log("Fetching insights for media to trigger Meta's requirement...");
    const insightsUrl = `https://graph.instagram.com/v21.0/${mediaId}/insights?metric=impressions,reach,likes&access_token=${token}`;
    const insightsRes = await fetch(insightsUrl);
    const insightsData = await insightsRes.json();
    console.log("Insights Response:", JSON.stringify(insightsData, null, 2));
  } else {
    console.log("No media found for user.");
  }
}

run().catch(console.error);
