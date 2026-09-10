const crypto = require("crypto");

const SECRET = "425074b960d37d5a46e707cf07db0c53";

const payload = JSON.stringify({
  object: "instagram",
  entry: [
    {
      time: Math.floor(Date.now() / 1000),
      id: "26928814340115341",
      changes: [
        {
          field: "comments",
          value: {
            id: "26928814340115341_comment_test3",
            text: "This is a dummy test comment injected directly to verify the system works! 🎉",
            from: {
              id: "8888888888888",
              username: "test_testerson"
            },
            media: {
              id: "7777777777777"
            }
          }
        }
      ]
    }
  ]
});

const hmac = crypto.createHmac("sha256", SECRET);
hmac.update(payload, "utf8");
const signature = hmac.digest("hex");

console.log("Payload:", payload);
console.log("Signature:", signature);

fetch("https://ghostal.vercel.app/api/webhook", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-hub-signature-256": `sha256=${signature}`
  },
  body: payload
})
.then(res => res.text().then(text => console.log("Status:", res.status, "Response:", text)))
.catch(console.error);
