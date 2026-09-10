import crypto from "crypto";
import https from "https";

const ENCRYPTION_KEY = "4e58186004ab60c36fa28a73d37efa00b3c6f8c1a65a615074080554b6756afe";
const encryptedToken = "623883bc848d3699f82b0f97:68b773f8fec8efcd4636c991d7f60c16:a353946e7677bcacec6f9749a85a3042994707e32131aae45812153f47e6ece6a01c9211b18868ec1579fab0981a8d78fbfd9033342cbef22fd77b0fd967ecd7b13643e84867b9a7fc476d55c17568ad1e45d2f86689604eae31cd2da18381f299e2b6f5fa7c87f1feda278840009f328be84b76a165ca3775cc26a76dc68fd9ae31257c4fdb6387bd093de8f1ec9e76dec68a48a4bc2d047b43d20bb232bda8dc";

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

const fetchUrl = (url) => new Promise((resolve, reject) => {
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        resolve({ raw: data, error: e.message });
      }
    });
  }).on('error', reject);
});

async function run() {
  try {
    const token = decrypt(encryptedToken);
    console.log("Decrypted token starts with:", token.substring(0, 15) + "...");

    const appId = "26019410861066129"; // META_APP_ID from .env.local
    const appSecret = "15a2879259313bc987ad9e4da82860ab"; // META_APP_SECRET from .env.local
    const appToken = `${appId}|${appSecret}`;
    
    console.log("\n--- 1. Debugging Token via debug_token ---");
    const debugUrl = `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${appToken}`;
    const debugData = await fetchUrl(debugUrl);
    console.log(JSON.stringify(debugData, null, 2));

    console.log("\n--- 1b. Checking Permissions via graph.facebook.com/me/permissions ---");
    const fbPermissionsUrl = `https://graph.facebook.com/v21.0/me/permissions?access_token=${token}`;
    const fbPermissionsData = await fetchUrl(fbPermissionsUrl);
    console.log(JSON.stringify(fbPermissionsData, null, 2));

    console.log("\n--- 2. Fetching /me profile details ---");
    const meUrl = `https://graph.instagram.com/v21.0/me?fields=id,username,account_type&access_token=${token}`;
    const meData = await fetchUrl(meUrl);
    console.log(JSON.stringify(meData, null, 2));

    console.log("\n--- 3. Fetching /me/media ---");
    const mediaUrl = `https://graph.instagram.com/v21.0/me/media?fields=id,caption,media_type,comments_count&limit=5&access_token=${token}`;
    const mediaData = await fetchUrl(mediaUrl);
    console.log(JSON.stringify(mediaData, null, 2));

    if (mediaData.data && mediaData.data.length > 0) {
      for (const item of mediaData.data) {
        console.log(`\n--- 4. Fetching comments for media ${item.id} (comments_count: ${item.comments_count}) ---`);
        const commentsUrl = `https://graph.instagram.com/v21.0/${item.id}/comments?fields=id,text,timestamp,username&access_token=${token}`;
        const commentsData = await fetchUrl(commentsUrl);
        console.log(JSON.stringify(commentsData, null, 2));
      }

      // Try posting a comment programmatically on the first media item to test permission
      const firstMedia = mediaData.data[0];
      console.log(`\n--- 5. Attempting to programmatically post a comment to media ${firstMedia.id} ---`);
      let postedCommentId = null;
      try {
        const postUrl = `https://graph.instagram.com/v21.0/${firstMedia.id}/comments`;
        const postRes = await fetch(postUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'Diagnostic test comment from GhostFlow API! 🤖',
            access_token: token
          })
        });
        const postResult = await postRes.json();
        console.log("Post Comment Result:", JSON.stringify(postResult, null, 2));
        postedCommentId = postResult.id;
      } catch (postErr) {
        console.error("Failed to post comment:", postErr);
      }

      if (postedCommentId) {
        console.log(`\n--- 6. Fetching the newly posted comment directly (ID: ${postedCommentId}) ---`);
        const commentDirectUrl = `https://graph.instagram.com/v21.0/${postedCommentId}?fields=id,text,timestamp,username&access_token=${token}`;
        const commentDirectData = await fetchUrl(commentDirectUrl);
        console.log("Direct Comment Response:", JSON.stringify(commentDirectData, null, 2));

        console.log(`\n--- 7. Fetching comments with different field queries ---`);
        const commentsNoFieldsUrl = `https://graph.instagram.com/v21.0/${firstMedia.id}/comments?access_token=${token}`;
        const commentsNoFieldsData = await fetchUrl(commentsNoFieldsUrl);
        console.log("Comments (No fields parameter) Response:", JSON.stringify(commentsNoFieldsData, null, 2));

        const commentsIdOnlyUrl = `https://graph.instagram.com/v21.0/${firstMedia.id}/comments?fields=id&access_token=${token}`;
        const commentsIdOnlyData = await fetchUrl(commentsIdOnlyUrl);
        console.log("Comments (fields=id) Response:", JSON.stringify(commentsIdOnlyData, null, 2));
      }
    } else {
      console.log("\nNo media found to fetch comments for.");
    }

  } catch (err) {
    console.error("Error in execution:", err);
  }
}

run();
