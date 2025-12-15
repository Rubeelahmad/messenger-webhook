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

// WhatsApp webhook endpoint for SendZen
app.post('/webhooks/whatsapp', (req, res) => {
    /**
     * Listens for incoming WhatsApp messages from SendZen.
     */
    
    // NOTE: In production, you should validate the request signature for security.
    // See SendZen docs for how to implement webhook security.
    
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