# Fiber Optic Communication System

Professional fiber tester controller with Morse code transmission and decoding capabilities.

## Architecture

- **Frontend**: React + TypeScript (Port 3000)
- **Backend**: Python HTTP Server (Port 8000)
- **Communication**: REST API between frontend and backend

## Running the System

### Option 1: Separate Ports (Realistic Testing)

**Terminal 1 - Backend Server:**
```bash
python backend-server.py
# Runs on http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Runs on http://localhost:3000
```

### Option 2: Single Development Server
```bash
npm run dev
# Frontend only with simulation fallback
```

## API Endpoints

- `GET /api/health` - Backend health check
- `POST /api/set-color` - Set transmission color
- `POST /api/set-number` - Set transmission number
- `POST /api/prepare` - Prepare transmission sequence
- `POST /api/complete` - Complete transmission
- `POST /api/clear` - Clear selection
- `GET /api/status` - Get system status

## Features

- **Split Screen Interface**: Transmitter and Decoder views
- **Professional Timecode Sync**: Frame-accurate timing display
- **Morse Code Transmission**: Color + Number encoding
- **Real-time Decoding**: Signal analysis and pattern matching
- **Retro Digital Displays**: LCD/LED style number displays
- **Work-Ready Interface**: Large buttons for industrial use
