import crypto from 'crypto';

const APP_SECRET = "15a2879259313bc987ad9e4da82860ab";
const WEBHOOK_URL = "https://ghostal.vercel.app/api/webhook";

const payload = {
  "object": "instagram",
  "entry": [
    {
      "id": "1234567890",
      "time": Math.floor(Date.now() / 1000),
      "changes": [
        {
          "field": "comments",
          "value": {
            "id": "17894561230",
            "text": "This is a test comment!",
            "from": {
              "id": "987654321",
              "username": "test_user"
            },
            "media": {
              "id": "17901234567",
              "owner": {
                "id": "26928814340115341"
              }
            }
          }
        }
      ]
    }
  ]
};

const rawBody = JSON.stringify(payload);

const hmac = crypto.createHmac("sha256", APP_SECRET);
hmac.update(rawBody, "utf8");
const signature = `sha256=${hmac.digest("hex")}`;

console.log("Sending fake webhook to:", WEBHOOK_URL);

const res = await fetch(WEBHOOK_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-hub-signature-256": signature
  },
  body: rawBody
});

console.log("Status:", res.status);
const data = await res.json().catch(() => null);
console.log("Response:", data);
