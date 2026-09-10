import crypto from "crypto";

const ENCRYPTION_KEY = "";
const encryptedToken = "b39a1e1ccbbbe579cb498d66:06460d954d8564337707c404d19ec8a6:3a5ff4febcfdb05d870cae8be4742c490079181a5acdbf7d5c6d13800385007b10f7305ee2d36aca698d8913ecf53116232edb084d7c5fe0c1d6c3b55b4ede34616dc2b84d06eee53af693c4a3acb0ca25815bbf2ac8438852e196813bedd1d3b62a29c3dbe5b62b3d6fe0a74d2099d21d5faece4b4ac612755ce65b73c98ceea1bbe6a891f240beb4c69aaf097cd6a0e6b9e4fe120a52d5b263185541f8960c";

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
  console.log("Decrypted token starts with:", token.substring(0, 10));

  const appId = "871648842633489";
  const appSecret = "3d76378e90632551cf187ca5259441f7"; 
  const appToken = `${appId}|${appSecret}`;
  
  const debugUrl = `https://graph.instagram.com/debug_token?input_token=${token}&access_token=${appToken}`;
  console.log("Debugging token...");
  const debugData = await fetch(debugUrl).then(res => res.json());
  console.log(JSON.stringify(debugData, null, 2));

  if (debugData.data && debugData.data.scopes) {
    console.log("SCOPES:", debugData.data.scopes);
  }

  // Fetch comments
  const mediaUrl = `https://graph.instagram.com/v21.0/me/media?fields=id,comments_count&limit=1&access_token=${token}`;
  const mediaData = await fetch(mediaUrl).then(res => res.json());
  if (mediaData.data && mediaData.data.length > 0) {
    const mediaId = mediaData.data[0].id;
    console.log(`Checking comments for ${mediaId}... count is ${mediaData.data[0].comments_count}`);
    const commentsUrl = `https://graph.instagram.com/v21.0/${mediaId}/comments?fields=id,text,timestamp&limit=50&access_token=${token}`;
    const commentsData = await fetch(commentsUrl).then(res => res.json());
    console.log("Comments Response:", JSON.stringify(commentsData, null, 2));
  }
}

run().catch(console.error);
