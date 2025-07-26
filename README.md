# Fiber Optic Transmitter - Perfect Timing

Simple fiber optic Morse code transmitter with perfect timing.

## Features

- **Perfect Timing**: Exact Morse code durations
- **Visual Light**: Flashes exact patterns
- **Simple Interface**: Keypad + Screen + Light
- **Loop Mode**: Continuous transmission

## Running

```bash
npm install
npm run dev
# Runs on http://localhost:3000
```

## Timing Specifications

- **Dot Duration**: 120ms exactly
- **Dash Duration**: 360ms exactly  
- **Symbol Gap**: 120ms exactly
- **Letter Gap**: 840ms exactly
- **Confirmation Flash**: 1000ms exactly

## Usage

1. Select color (Red/Green/Blue)
2. Enter number (0-100)
3. Click SEND - light flashes Morse code
4. Click LOOP for continuous transmission
5. STOP to halt transmission

The light flashes perfect Morse code timing for external decoders.