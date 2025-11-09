const { google } = require("googleapis");
const tmi = require("tmi.js");
const WebSocket = require("ws");

// ========== YouTube ==========
async function connectYouTube(apiKey, liveChatId, sendMessage) {
  const youtube = google.youtube("v3");
  async function poll() {
    try {
      const res = await youtube.liveChatMessages.list({
        liveChatId,
        part: "snippet,authorDetails",
        key: apiKey
      });
      res.data.items.forEach(item => {
        sendMessage("YouTube", item.authorDetails.displayName, item.snippet.displayMessage);
      });
    } catch (err) {
      console.error("YouTube API Error:", err.message);
    }
    setTimeout(poll, 5000);
  }
  poll();
}

// ========== Twitch ==========
function connectTwitch(username, token, channel, sendMessage) {
  const client = new tmi.Client({
    identity: { username, password: token },
    channels: [channel]
  });
  client.connect().catch(console.error);
  client.on("message", (channel, tags, message) => {
    sendMessage("Twitch", tags["display-name"], message);
  });
}

// ========== Kick ==========
function connectKick(channel, sendMessage) {
  const ws = new WebSocket(`wss://chat.kick.com/${channel}`);
  ws.on("open", () => console.log("Connected to Kick chat"));
  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.type === "message") {
        sendMessage("Kick", msg.sender.username, msg.content);
      }
    } catch (e) {
      console.error("Kick parse error", e);
    }
  });
  ws.on("error", (err) => console.error("Kick WebSocket Error:", err.message));
}

module.exports = { connectYouTube, connectTwitch, connectKick };
