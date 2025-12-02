# Pulsify - Suno Web Radio 🎵

A web-based radio platform for streaming and sharing AI-generated music from [Suno](https://suno.ai). Pulsify provides a continuous radio experience where users can submit, listen to, and discover Suno-generated music tracks in real-time.

![Pulsify Radio](frontend/public/NOW2.png)

## 🌟 Features

- **Live Radio Streaming**: Continuous playback of Suno-generated music tracks
- **Real-time Updates**: Server-Sent Events (SSE) for instant track updates
- **User Authentication**: Secure login system with JWT tokens and account activation
- **Music Submission**: Submit your Suno songs directly to the radio queue
- **Interactive Audio Player**: Custom-built audio player with waveform visualization
- **User Profiles**: Personalized profiles with avatars and statistics
- **Track Information**: View detailed information about currently playing, previous, and upcoming tracks
- **Vote System**: Upvote your favorite tracks
- **Discord Integration**: Join the community through the integrated Discord link

## 🏗️ Architecture

Pulsify is a modern web application built with:

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v6
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios with automatic token refresh
- **Notifications**: Notistack for user feedback
- **Audio Player**: Custom audio player with wavesurfer.js integration

### Backend (Expected)
The application expects a backend API running on `http://localhost:3000` with the following endpoints:
- `/player/connection` - SSE endpoint for real-time track updates
- `/player/status` - Get current player status
- `/player/next-track-info` - Get upcoming track information
- `/suno-api/submit-link` - Submit a new Suno track
- `/suno-api/get-suno-clip/:id` - Get track details
- `/users/*` - User authentication and profile endpoints

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A running backend server (not included in this repository)

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Heymow/suno-webradio.git
cd suno-webradio
```

2. Navigate to the frontend directory:
```bash
cd frontend
```

3. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Linting

Run ESLint to check code quality:
```bash
npm run lint
```

## 🔧 Configuration

### Backend API URL

The default backend URL is set to `http://localhost:3000`. To change this, update the `baseURL` in:
- `frontend/src/utils/Axios.ts`
- `frontend/src/App.tsx` (SSE_URL constant)
- `frontend/src/AudioPlayer.tsx` (fetch URLs)

### Environment Variables

Create a `.env` file in the frontend directory for any environment-specific configuration (currently not required for basic setup).

## 📱 Usage

### Submitting a Track

1. Sign up or log in to your account
2. Click the "+" button at the bottom of the page
3. Paste a Suno song link (format: `https://suno.ai/song/[id]` or `https://suno.com/song/[id]`)
4. Click "+" to submit

### Navigating the Radio

- **Live Button**: Shows the currently playing track
- **Hits/New Buttons**: Filter tracks by category (coming soon)
- **Previous/Next Song**: Preview the previous and upcoming tracks
- **Audio Controls**: Play, pause, seek, and adjust volume in the audio player

### User Profile

- Click on your avatar (top right) to access your profile
- View your submitted tracks
- Check your statistics
- Update your Suno username and avatar

## 🎨 Customization

The application uses a custom color scheme defined in the styled components. You can modify the theme by editing the color constants in `frontend/src/App.tsx`:
- `blue` - Blue color palette
- `custom` - Primary custom colors
- `grey` - Grey scale colors

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. Follow the existing code style
2. Use TypeScript for type safety
3. Write meaningful commit messages
4. Test your changes thoroughly
5. Update documentation as needed

## 📝 Project Structure

```
suno-webradio/
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API service functions
│   │   ├── store/           # Redux store configuration
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions
│   │   ├── styles/          # CSS modules
│   │   ├── App.tsx          # Main application component
│   │   └── main.tsx         # Application entry point
│   ├── package.json         # Dependencies and scripts
│   ├── vite.config.js       # Vite configuration
│   └── tsconfig.json        # TypeScript configuration
└── README.md                # This file
```

## 🐛 Known Issues

- The application requires a backend server to function properly
- Backend API endpoints are hardcoded to `localhost:3000`
- Some features (Hits/New filters) are not yet implemented

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- **Discord Community**: [Join our Discord](https://discord.gg/DnXUDCuFCD)
- **Suno AI**: [https://suno.ai](https://suno.ai)

## 👥 Authors

- **Heymow** - [GitHub Profile](https://github.com/Heymow)

## 🙏 Acknowledgments

- [Suno AI](https://suno.ai) for providing the AI music generation platform
- [React Modern Audio Player](https://github.com/slash9494/react-modern-audio-player) for audio player components
- [Material-UI](https://mui.com) for the UI component library
- All contributors and users of the Pulsify community

---

**Note**: This is a frontend-only repository. A compatible backend server is required for full functionality. The backend should implement the API endpoints referenced in the architecture section.
