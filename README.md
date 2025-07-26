# Fiber Optic Communication System - Separated Projects

Two separate applications that communicate over different ports for real signal transmission.

## Architecture

- **Transmitter**: React app on Port 3000
- **Receiver**: React app on Port 3001  
- **Communication**: Real HTTP requests between ports

## Running the System

### Terminal 1 - Transmitter:
```bash
cd transmitter
npm install
npm run dev
# Runs on http://localhost:3000
```

### Terminal 2 - Receiver:
```bash
cd receiver
npm install  
npm run dev
# Runs on http://localhost:3001
```

## How It Works

1. **Transmitter (Port 3000)**:
   - Select color and number
   - Click SEND to transmit
   - Sends HTTP POST to `http://localhost:3001/api/receive-signal`

2. **Receiver (Port 3001)**:
   - Listens for incoming signals
   - Displays received transmissions
   - Shows real-time signal history

## Real Communication

- Actual HTTP requests between ports
- Real network communication
- True client-server architecture
- Demonstrates fiber optic concept with separate endpoints

## Features

- **Professional Interface**: Industrial-grade controls
- **Real Transmission**: HTTP communication between ports
- **Signal History**: Track all received transmissions
- **Status Indicators**: Connection and server status
- **Loop Mode**: Continuous transmission capability

This setup allows for genuine signal transmission between separate applications, demonstrating the fiber optic communication concept with real network protocols.