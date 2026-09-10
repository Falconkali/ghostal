// Quick debug script - tests Instagram API with the stored token
import crypto from "crypto";

const ENCRYPTION_KEY = "4e58186004ab60c36fa28a73d37efa00b3c6f8c1a65a615074080554b6756afe";
const encryptedToken = "a0642441fbf442042e1812d0:19a9b19f4b2a9e837812f71d3e534aa3:0d516bd924a5405711b0f750fffd966e21250df664e71933a269a9970c9a6509e003382741d229a4dee2af1302295369759eccf90b519e8472f5cd71fcb981b4fb3544b24da350e8e5f1385db23a1141e90eb3501cbbaf7535619c2ca9600b48a88f74885b7f1e7a8110e59b28341eb968972f48eb894e872317ff6c9f6ff7bb7240338ceeb424a120920420018c5946d98643088e90484d3d1b421ec42b8989";
const igUserId = "26928814340115341";

function decrypt(encryptedText) {
  const key = Buffer.from(ENCRYPTION_KEY, "hex");
  const parts = encryptedText.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const encrypted = Buffer.from(parts[2], "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, undefined, "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

async function test() {
  const token = decrypt(encryptedToken);
  console.log("Token prefix:", token.substring(0, 20) + "...");

  // 1. Test media fetch
  console.log("\n--- Fetching media ---");
  const mediaRes = await fetch(
    `https://graph.instagram.com/v21.0/${igUserId}/media?fields=id,timestamp,media_type&limit=5&access_token=${token}`
  );
  const mediaData = await mediaRes.json();
  console.log("Media response:", JSON.stringify(mediaData, null, 2));

  if (mediaData.error) {
    console.error("Media fetch failed:", mediaData.error);
    return;
  }

  const firstMedia = mediaData.data?.[0];
  if (!firstMedia) {
    console.log("No media found");
    return;
  }

  // 2. Test comments fetch on first media
  console.log(`\n--- Fetching comments for media ${firstMedia.id} ---`);
  const commentsRes = await fetch(
    `https://graph.instagram.com/v21.0/${firstMedia.id}/comments?fields=id,text,timestamp,from&access_token=${token}`
  );
  const commentsData = await commentsRes.json();
  console.log("Comments response:", JSON.stringify(commentsData, null, 2));

  // 3. Test with instagram_manage_comments scope check
  console.log(`\n--- Checking token scopes ---`);
  const scopeRes = await fetch(
    `https://graph.instagram.com/v21.0/me?fields=id,username&access_token=${token}`
  );
  const scopeData = await scopeRes.json();
  console.log("Me response:", JSON.stringify(scopeData, null, 2));
}

test().catch(console.error);
