# Fiber Optic Transmitter - Perfect Timing

Simple fiber optic Morse code transmitter with perfect timing.
Now with OLA (Open Lighting Architecture) export for professional DMX lighting control on Raspberry Pi.

## Features

- **Perfect Timing**: Exact Morse code durations
- **Visual Light**: Flashes exact patterns
- **Simple Interface**: Keypad + Screen + Light
- **Loop Mode**: Continuous transmission
- **OLA Export**: Generate scripts for Raspberry Pi DMX control
- **Professional Integration**: Connect to DMX lighting systems

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
## OLA Integration (Raspberry Pi)

### Setup OLA on Raspberry Pi

```bash
# Install OLA
sudo apt update
sudo apt install ola

# Install Python OLA bindings
sudo apt install python3-ola

# Start OLA daemon
sudo systemctl enable olad
sudo systemctl start olad
```

### Usage

1. Click "Show OLA Export" in the web interface
2. Configure your DMX universe and channel settings
3. Set your Raspberry Pi IP address
4. Export either Bash or Python script
5. Transfer script to your Raspberry Pi
6. Run the script to control DMX lighting

### DMX Channel Mapping

- Channel N: Red (0-255)
- Channel N+1: Green (0-255) 
- Channel N+2: Blue (0-255)

### Example Usage

```bash
# On Raspberry Pi
chmod +x fiber_tester_Green_58.sh
./fiber_tester_Green_58.sh

# Or Python version
python3 fiber_tester_Green_58.py
```

The exported scripts will flash your DMX RGB fixtures with the exact same Morse code timing as the web interface, allowing professional lighting integration for fiber optic testing and demonstrations.
