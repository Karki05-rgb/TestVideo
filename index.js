// const WebSocket = require('ws');

// const wss = new WebSocket.Server({ port: 3000 });

// wss.on('connection', function connection(ws) {
//   console.log('Client connected');

//   ws.on('message', function incoming(message) {
//     console.log('Received:', message);
//     ws.send(`Server received: ${message}`);
//   });

//   ws.on('close', () => {
//     console.log('Client disconnected');
//   });
// });

// console.log('WebSocket server started on ws://localhost:3000');


const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const wss = new WebSocket.Server({ port: 3001 });
let counter = 0;

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    // Convert incoming buffer to string
    const base64String = message.toString();

    // Remove the data URL prefix if present
    const base64Data = base64String.replace(/^data:image\/jpeg;base64,/, '');

    const buffer = Buffer.from(base64Data, 'base64');

    // Ensure 'images' folder exists
    const imagesDir = path.join(__dirname, 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // Create a unique filename
    const filename = `webcam_${Date.now()}_${counter++}.jpg`;
    const filePath = path.join(imagesDir, filename);

    // Save the image to disk
    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        console.error('Failed to save image:', err);
      } else {
        console.log(`Image saved: ${filename}`);
      }
    });

    // Broadcast frame to all other clients except the sender
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});


