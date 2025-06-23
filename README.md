# Chatting App

A real-time chatting application built with React Native (Expo) and Pusher for real-time messaging, now with TypeScript support, modern Expo Router, and NativeWind styling.

## Features

- Real-time messaging using Pusher
- Simple and clean UI
- User join/leave notifications
- Message timestamps
- Responsive design
- Cross-platform (iOS, Android, Web)
- **Full TypeScript support** for both client and server
- **Modern Expo Router** with file-based routing
- **NativeWind styling** with Tailwind CSS classes
- **Modular architecture** with separate client and server folders

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Pusher account

## Project Structure

```
chatting-app/
├── client/                 # React Native Expo app (TypeScript + Expo Router + NativeWind)
│   ├── app/                # File-based routing (Expo Router)
│   │   ├── _layout.tsx     # Root layout with navigation
│   │   ├── index.tsx       # Login screen (home page)
│   │   └── chat.tsx        # Chat screen
│   ├── assets/             # App assets
│   ├── package.json        # Client dependencies
│   ├── tsconfig.json       # TypeScript config
│   ├── tailwind.config.js  # Tailwind CSS config
│   ├── global.d.ts         # NativeWind types
│   ├── app.json           # Expo configuration
│   └── babel.config.js    # Babel configuration
├── server/                 # Express backend (TypeScript)
│   ├── src/
│   │   └── server.ts       # Main server file
│   ├── package.json        # Server dependencies
│   ├── tsconfig.json       # TypeScript config
│   ├── nodemon.json        # Development configuration
│   └── env.example         # Environment variables template
├── README.md              # This file
└── .gitignore             # Git ignore rules
```

## Setup Instructions

### 1. Install Dependencies

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
cd ..
```

### 2. Pusher Configuration

1. Create a free account at [Pusher](https://pusher.com/)
2. Create a new Channels app
3. Get your app credentials (App ID, Key, Secret, Cluster)
4. Copy `server/env.example` to `server/.env` and fill in your Pusher credentials:

```env
PUSHER_APP_ID=your_app_id_here
PUSHER_KEY=your_key_here
PUSHER_SECRET=your_secret_here
PUSHER_CLUSTER=your_cluster_here
PORT=3000
```

### 3. Update Pusher Configuration in Client

Update the Pusher configuration in `client/app/chat.tsx`:

```typescript
pusherRef.current = new Pusher('YOUR_PUSHER_KEY', {
  cluster: 'YOUR_PUSHER_CLUSTER',
});
```

Replace `YOUR_PUSHER_KEY` and `YOUR_PUSHER_CLUSTER` with your actual Pusher credentials.

### 4. Start the Backend Server

```bash
cd server

# Development mode (with auto-restart)
npm run dev

# Or build and run production
npm run build
npm start
```

The server will run on `http://localhost:3000`

### 5. Start the React Native App

```bash
# In a new terminal, from the client directory
cd client
npm start
```

This will start the Expo development server. You can then:
- Press `i` to open in iOS simulator
- Press `a` to open in Android emulator
- Press `w` to open in web browser
- Scan the QR code with Expo Go app on your phone

## TypeScript Features

### Client (React Native + Expo Router + NativeWind)
- **Strict type checking** for all components
- **File-based routing** with Expo Router
- **Type-safe navigation** with useLocalSearchParams
- **Tailwind CSS styling** with NativeWind
- **Generic types** for API responses
- **Proper typing** for Pusher events

### Server (Express)
- **Request/Response typing** for all endpoints
- **Interface definitions** for data models
- **Type-safe Pusher integration**
- **Environment variable typing**

## API Endpoints

The backend server provides the following endpoints:

- `GET /api/messages` - Get all messages
- `POST /api/messages` - Send a new message
- `POST /api/user-joined` - Notify when user joins
- `POST /api/user-left` - Notify when user leaves
- `DELETE /api/messages` - Clear all messages (for testing)

## Development Scripts

### Client
```bash
cd client
npm start          # Start Expo development server
npm run build      # Build TypeScript
npm run type-check # Type check without building
```

### Server
```bash
cd server
npm run dev        # Start with nodemon (auto-restart)
npm run build      # Build TypeScript to dist/
npm start          # Start production server
npm run watch      # Watch mode for TypeScript compilation
```

## How It Works

1. **User Login**: Users enter their username on the login screen (`/`)
2. **Chat Room**: Users join a single chat room where all messages are shared (`/chat`)
3. **Real-time Messaging**: Messages are sent to the server, which triggers Pusher events
4. **Live Updates**: All connected users receive messages in real-time via Pusher
5. **User Notifications**: System messages notify when users join or leave

## Expo Router Features

- **File-based routing**: Routes are based on file structure in `app/`
- **Type-safe navigation**: Use `useLocalSearchParams` for route parameters
- **Automatic navigation**: No need to manually configure navigation
- **Deep linking**: Built-in support for deep links
- **Web support**: Works seamlessly on web, iOS, and Android

## NativeWind Features

- **Tailwind CSS classes**: Use familiar Tailwind classes in React Native
- **Type-safe styling**: Full TypeScript support for styling
- **Performance optimized**: Compiled to native styles at build time
- **Responsive design**: Easy responsive layouts with Tailwind utilities
- **Custom themes**: Extend Tailwind with custom colors and spacing

## Customization

### Styling with NativeWind
The app uses Tailwind CSS classes for styling:
- `bg-blue-500` for primary blue color
- `bg-gray-50` for light backgrounds
- `rounded-xl` for rounded corners
- `shadow-lg` for shadows
- `text-white` for white text

### Features to Add
- Multiple chat rooms
- User authentication
- Message persistence (database)
- File/image sharing
- Typing indicators
- Read receipts
- User profiles

## Troubleshooting

### Common Issues

1. **TypeScript Errors**
   - Run `npm run type-check` in client directory
   - Ensure all dependencies are installed
   - Check TypeScript configuration

2. **NativeWind Issues**
   - Make sure `nativewind` and `tailwindcss` are installed
   - Check that `nativewind/babel` is in babel.config.js
   - Verify `global.d.ts` has the NativeWind types reference

3. **Expo Router Issues**
   - Make sure `expo-router` is installed
   - Check that `main` in package.json is set to `"expo-router/entry"`
   - Verify app.json has the `expo-router` plugin

4. **Pusher Connection Failed**
   - Check your Pusher credentials
   - Ensure your cluster is correct
   - Verify your app is enabled

5. **Server Not Starting**
   - Check if port 3000 is available
   - Ensure all dependencies are installed
   - Verify your `.env` file is properly configured

6. **Messages Not Sending**
   - Check if the server is running
   - Verify the API_BASE_URL in chat.tsx
   - Check network connectivity

### Development Tips

- Use `npm run dev` in the server directory for auto-restart on changes
- Use Expo's hot reload for instant app updates
- Check the browser console and Metro bundler for error messages
- Use TypeScript strict mode for better code quality
- NativeWind classes work just like regular Tailwind CSS

## License

This project is open source and available under the MIT License.

