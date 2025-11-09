const WebSocket = require("ws");
const http = require("http");
const { connectYouTube, connectTwitch, connectKick } = require("./chat");

const server = http.createServer();
const wss = new WebSocket.Server({ server });

function sendMessage(platform, user, message) {
  const data = JSON.stringify({ platform, user, message });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

wss.on("connection", () => console.log("Overlay connected"));

// ===== 在這裡填入你的帳號資訊 =====
connectYouTube("YOUR_YOUTUBE_API_KEY", "YOUR_LIVECHAT_ID", sendMessage);
connectTwitch("YOUR_TWITCH_USERNAME", "YOUR_TWITCH_OAUTH_TOKEN", "YOUR_CHANNEL", sendMessage);
connectKick("YOUR_KICK_CHANNEL", sendMessage);

server.listen(8080, () => console.log("Server running on port 8080"));
