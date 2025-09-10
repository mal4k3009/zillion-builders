const express = require('express');
const cors = require('cors');
const sendPushNotification = require('./send-push-notification');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.post('/api/send-push-notification', sendPushNotification);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Push notification server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Push notification server running on http://localhost:${PORT}`);
  console.log(`📱 Ready to send real phone notifications!`);
});

module.exports = app;
