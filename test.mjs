import fs from "fs";

// Create a fake 1x1 GIF to test image upload
const gifData = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
const file = new Blob([gifData], { type: "image/gif" });

const form = new FormData();
form.append("upload_preset", "ghostal");
form.append("file", file, "test.gif");

const res = await fetch("https://ghostal.vercel.app/api/vault/upload", {
  method: "POST",
  body: form
});

const data = await res.json();
console.log("Status:", res.status);
console.log("Response:", data);
