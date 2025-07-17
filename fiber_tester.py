#!/usr/bin/env python3
"""
Fiber Tester Controller - Python Logic
Handles Morse code generation and transmission logic for fiber optic testing
"""

import time
import json
import sys
from typing import Dict, List, Tuple

class FiberTesterController:
    """Main controller class for fiber tester operations"""
    
    # Morse code patterns (dot = short pulse, dash = long pulse)
    MORSE_CODE = {
        'R': '·−·',
        'G': '−−·', 
        'B': '−···',
        '0': '−−−−−',
        '1': '·−−−−',
        '2': '··−−−',
        '3': '···−−',
        '4': '····−',
        '5': '·····',
        '6': '−····',
        '7': '−−···',
        '8': '−−−··',
        '9': '−−−−·'
    }
    
    # Precise Morse code timing constants (in milliseconds)
    # Visual Morse code timing constants (in milliseconds)
    # Based on 1 unit = 200ms for visual perception
    DOT_DURATION = 200       # 1 unit
    DASH_DURATION = 600      # 3 units
    INTRA_LETTER_GAP = 200   # 1 unit (between dots/dashes in same letter)
    INTER_LETTER_GAP = 600   # 3 units (between letters)
    WORD_GAP = 1400         # 7 units (between words)
    CONFIRMATION_FLASH = 1000
    
    def __init__(self):
        self.transmission_history = []
        self.current_color = None
        self.current_number = None
        self.is_transmitting = False
    
    def validate_color(self, color: str) -> bool:
        """Validate if the color is supported"""
        valid_colors = ['Red', 'Green', 'Blue']
        return color in valid_colors
    
    def validate_number(self, number: str) -> bool:
        """Validate if the number is within acceptable range (0-100)"""
        try:
            num = int(number)
            return 0 <= num <= 100
        except ValueError:
            return False
    
    def set_color(self, color: str) -> Dict:
        """Set the selected color for transmission"""
        if not self.validate_color(color):
            return {
                'success': False,
                'message': f'Invalid color: {color}. Must be Red, Green, or Blue.',
                'status': 'error'
            }
        
        self.current_color = color
        return {
            'success': True,
            'message': f'{color} selected - Enter number',
            'status': 'color_selected',
            'color': color
        }
    
    def set_number(self, number: str) -> Dict:
        """Set the number for transmission"""
        if not self.validate_number(number):
            return {
                'success': False,
                'message': f'Invalid number: {number}. Must be 0-100.',
                'status': 'error'
            }
        
        self.current_number = number
        return {
            'success': True,
            'message': f'{self.current_color} {number} ready' if self.current_color else f'Number {number} set - Select color',
            'status': 'number_set',
            'number': number
        }
    
    def clear_selection(self) -> Dict:
        """Clear current color and number selection"""
        self.current_color = None
        self.current_number = None
        return {
            'success': True,
            'message': 'Select color and number',
            'status': 'cleared'
        }
    
    def generate_morse_pattern(self, text: str) -> str:
        """Generate Morse code pattern for given text"""
        pattern = ''
        for char in text.upper():
            if char in self.MORSE_CODE:
                pattern += self.MORSE_CODE[char]
        return pattern
    
    def calculate_transmission_sequence(self) -> List[Dict]:
        """Calculate the complete transmission sequence with timing"""
        if not self.current_color or not self.current_number:
            return []
        
        sequence = []
        
        # Get color letter (R, G, or B)
        color_letter = self.current_color[0].upper()
        
        # Add color transmission
        color_pattern = self.MORSE_CODE[color_letter]
        sequence.extend(self._pattern_to_sequence(color_pattern, 'color'))
        
        # Add letter gap
        sequence.append({
            'type': 'gap',
            'duration': self.INTER_LETTER_GAP,
            'description': 'Inter-letter gap'
        })
        
        # Add number transmission
        for digit in self.current_number:
            digit_pattern = self.MORSE_CODE[digit]
            sequence.extend(self._pattern_to_sequence(digit_pattern, 'digit', digit))
            sequence.append({
                'type': 'gap',
                'duration': self.INTER_LETTER_GAP,
                'description': f'Inter-letter gap after digit {digit}'
            })
        
        # Add confirmation flash
        sequence.append({
            'type': 'confirmation',
            'duration': self.CONFIRMATION_FLASH,
            'description': 'Confirmation flash'
        })
        
        return sequence
    
    def _pattern_to_sequence(self, pattern: str, seq_type: str, value: str = '') -> List[Dict]:
        """Convert Morse pattern to timed sequence"""
        sequence = []
        
        for i, symbol in enumerate(pattern):
            if symbol == '·':
                sequence.append({
                    'type': 'dot',
                    'duration': self.DOT_DURATION,
                    'sequence_type': seq_type,
                    'value': value,
                    'description': f'Dot ({seq_type})'
                })
            elif symbol == '−':
                sequence.append({
                    'type': 'dash', 
                    'duration': self.DASH_DURATION,
                    'sequence_type': seq_type,
                    'value': value,
                    'description': f'Dash ({seq_type})'
                })
            
            # Add symbol gap (except after last symbol)
            if i < len(pattern) - 1:
                sequence.append({
                    'type': 'gap',
                    'duration': self.INTRA_LETTER_GAP,
                    'description': 'Intra-letter gap'
                })
        
        return sequence
    
    def prepare_transmission(self) -> Dict:
        """Prepare transmission and return sequence data"""
        if not self.current_color:
            return {
                'success': False,
                'message': 'No color selected',
                'status': 'error'
            }
        
        if not self.current_number:
            return {
                'success': False,
                'message': 'No number entered',
                'status': 'error'
            }
        
        if self.is_transmitting:
            return {
                'success': False,
                'message': 'Transmission already in progress',
                'status': 'error'
            }
        
        sequence = self.calculate_transmission_sequence()
        total_duration = sum(step['duration'] for step in sequence)
        
        return {
            'success': True,
            'message': f'Transmitting {self.current_color} {self.current_number}...',
            'status': 'transmitting',
            'color': self.current_color,
            'number': self.current_number,
            'sequence': sequence,
            'total_duration': total_duration
        }
    
    def complete_transmission(self) -> Dict:
        """Mark transmission as complete and update history"""
        if not self.current_color or not self.current_number:
            return {
                'success': False,
                'message': 'No transmission to complete',
                'status': 'error'
            }
        
        # Add to history
        transmission_record = {
            'color': self.current_color,
            'number': self.current_number,
            'timestamp': time.time(),
            'message': f'{self.current_color} {self.current_number} sent'
        }
        
        self.transmission_history.insert(0, transmission_record)
        
        # Keep only last 5 transmissions
        if len(self.transmission_history) > 5:
            self.transmission_history = self.transmission_history[:5]
        
        # Reset current selection
        color = self.current_color
        number = self.current_number
        self.current_color = None
        self.current_number = None
        self.is_transmitting = False
        
        return {
            'success': True,
            'message': f'{color} {number} sent',
            'status': 'completed',
            'history': [record['message'] for record in self.transmission_history]
        }
    
    def get_status(self) -> Dict:
        """Get current system status"""
        return {
            'color': self.current_color,
            'number': self.current_number,
            'is_transmitting': self.is_transmitting,
            'history': [record['message'] for record in self.transmission_history],
            'ready_to_send': bool(self.current_color and self.current_number and not self.is_transmitting)
        }

def main():
    """Main function to handle command line interface"""
    if len(sys.argv) < 2:
        print("Usage: python fiber_tester.py <command> [args...]")
        print("Commands:")
        print("  set_color <color>     - Set color (Red, Green, Blue)")
        print("  set_number <number>   - Set number (0-100)")
        print("  prepare              - Prepare transmission")
        print("  complete             - Complete transmission")
        print("  clear                - Clear selection")
        print("  status               - Get current status")
        return
    
    controller = FiberTesterController()
    command = sys.argv[1]
    
    try:
        if command == "set_color" and len(sys.argv) > 2:
            result = controller.set_color(sys.argv[2])
        elif command == "set_number" and len(sys.argv) > 2:
            result = controller.set_number(sys.argv[2])
        elif command == "prepare":
            result = controller.prepare_transmission()
        elif command == "complete":
            result = controller.complete_transmission()
        elif command == "clear":
            result = controller.clear_selection()
        elif command == "status":
            result = controller.get_status()
        else:
            result = {
                'success': False,
                'message': f'Unknown command: {command}',
                'status': 'error'
            }
        
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        error_result = {
            'success': False,
            'message': f'Error: {str(e)}',
            'status': 'error'
        }
        print(json.dumps(error_result, indent=2))

if __name__ == "__main__":
    main()