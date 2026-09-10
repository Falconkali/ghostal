import crypto from "crypto";
import https from "https";

const ENCRYPTION_KEY = "4e58186004ab60c36fa28a73d37efa00b3c6f8c1a65a615074080554b6756afe";
const encryptedToken = "a0642441fbf442042e1812d0:19a9b19f4b2a9e837812f71d3e534aa3:0d516bd924a5405711b0f750fffd966e21250df664e71933a269a9970c9a6509e003382741d229a4dee2af1302295369759eccf90b519e8472f5cd71fcb981b4fb3544b24da350e8e5f1385db23a1141e90eb3501cbbaf7535619c2ca9600b48a88f74885b7f1e7a8110e59b28341eb968972f48eb894e872317ff6c9f6ff7bb7240338ceeb424a120920420018c5946d98643088e90484d3d1b421ec42b8989";
const igUserId = "26928814340115341";

function getKey() {
  try {
    return Buffer.from(ENCRYPTION_KEY, "hex");
  } catch {
    return crypto.scryptSync(ENCRYPTION_KEY, "ghostflow-salt-key-derivation", 32);
  }
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

const fetchUrl = (url) => new Promise((resolve, reject) => {
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => resolve(JSON.parse(data)));
  }).on('error', reject);
});

async function run() {
  try {
    const token = decrypt(encryptedToken);
    console.log("Token decrypted successfully. First 10 chars:", token.substring(0, 10));

    const mediaUrl = `https://graph.instagram.com/v21.0/${igUserId}/media?fields=id,timestamp&limit=10&access_token=${token}`;
    console.log("Fetching media...");
    const mediaData = await fetchUrl(mediaUrl);
    console.log("Media response:", JSON.stringify(mediaData, null, 2));

    if (mediaData.data && mediaData.data.length > 0) {
      const mediaId = mediaData.data[0].id;
      const commentsUrl = `https://graph.instagram.com/v21.0/${mediaId}/comments?fields=id,text,timestamp,from&limit=50&access_token=${token}`;
      console.log("Fetching comments for media", mediaId);
      const commentsData = await fetchUrl(commentsUrl);
      console.log("Comments response:", JSON.stringify(commentsData, null, 2));
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
