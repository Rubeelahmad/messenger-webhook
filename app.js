// Import Express.js
const express = require('express');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// Route for GET requests
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route for POST requests
app.post('/', (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));
  res.status(200).end();
});

// WhatsApp webhook verification endpoint (GET)
app.get('/webhooks/whatsapp', (req, res) => {
    /**
     * Verifies the webhook with Meta WhatsApp Cloud API.
     * Meta sends a GET request with hub.mode, hub.verify_token, and hub.challenge
     */
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Check if a token and mode were sent
    if (mode && token) {
        // Check the mode and token sent are correct
        if (mode === 'subscribe' && token === verifyToken) {
            // Respond with 200 OK and challenge token from the request
            console.log('WHATSAPP_WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            console.log('Webhook verification failed - token mismatch');
            res.sendStatus(403);
        }
    } else {
        // Responds with '400 Bad Request' if required parameters are missing
        console.log('Webhook verification failed - missing parameters');
        res.sendStatus(400);
    }
});

// WhatsApp webhook endpoint for incoming messages (POST)
app.post('/webhooks/whatsapp', (req, res) => {
    /**
     * Listens for incoming WhatsApp messages from Meta Cloud API.
     */
    
    // NOTE: In production, you should validate the request signature for security.
    // See Meta docs for how to implement webhook security.
    
    const data = req.body;
    
    // Log the entire payload for debugging purposes
    console.log("Received webhook payload:");
    console.log(JSON.stringify(data, null, 2));
    
    // A simple check to ensure the payload has the expected structure
    try {
        // Extract the message text and sender's number
        const messageBody = data.entry[0].changes[0].value.messages[0].text.body;
        const senderPhone = data.entry[0].changes[0].value.messages[0].from;
        
        console.log(`Message: '${messageBody}' from ${senderPhone}`);
        
        // Here is where you would add your bot's logic.
        // For now, we'll just log it.
        
    } catch (error) {
        // Handle cases where the payload is not a standard text message
        console.log("Received a non-text message or unexpected payload format.");
    }
    
    res.status(200).json({ status: "ok" });
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});