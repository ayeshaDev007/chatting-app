import express, { Request, Response } from 'express';
import cors from 'cors';
import Pusher from 'pusher';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Types
interface Message {
  id: number;
  username: string;
  message: string;
  timestamp: string;
  isSystem?: boolean;
}

interface UserRequest {
  username: string;
}

interface MessageRequest {
  username: string;
  message: string;
}

// Initialize Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || 'YOUR_APP_ID',
  key: process.env.PUSHER_KEY || 'YOUR_KEY',
  secret: process.env.PUSHER_SECRET || 'YOUR_SECRET',
  cluster: process.env.PUSHER_CLUSTER || 'YOUR_CLUSTER',
  useTLS: true
});

// Store messages in memory (in production, use a database)
let messages: Message[] = [];

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Chatting App Server is running!' });
});

// Get all messages
app.get('/api/messages', (req: Request, res: Response) => {
  res.json(messages);
});

// Send a new message
app.post('/api/messages', (req: Request<{}, {}, MessageRequest>, res: Response) => {
  const { username, message } = req.body;
  
  if (!username || !message) {
    return res.status(400).json({ error: 'Username and message are required' });
  }

  const newMessage: Message = {
    id: Date.now(),
    username,
    message,
    timestamp: new Date().toISOString()
  };

  // Add message to local storage
  messages.push(newMessage);

  // Trigger Pusher event
  pusher.trigger('chat-room', 'new-message', newMessage);

  return res.json(newMessage);
});

// User joined notification
app.post('/api/user-joined', (req: Request<{}, {}, UserRequest>, res: Response) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const joinMessage: Message = {
    id: Date.now(),
    username: 'System',
    message: `${username} joined the chat`,
    timestamp: new Date().toISOString(),
    isSystem: true
  };

  messages.push(joinMessage);
  pusher.trigger('chat-room', 'new-message', joinMessage);

  return res.json(joinMessage);
});

// User left notification
app.post('/api/user-left', (req: Request<{}, {}, UserRequest>, res: Response) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const leaveMessage: Message = {
    id: Date.now(),
    username: 'System',
    message: `${username} left the chat`,
    timestamp: new Date().toISOString(),
    isSystem: true
  };

  messages.push(leaveMessage);
  pusher.trigger('chat-room', 'new-message', leaveMessage);

  return res.json(leaveMessage);
});

// Clear messages (for testing)
app.delete('/api/messages', (req: Request, res: Response) => {
  messages = [];
  res.json({ message: 'All messages cleared' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to test the server`);
}); 