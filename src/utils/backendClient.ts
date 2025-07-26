/**
 * Backend Client - Communicates with separate Python backend server
 * Runs on different port for realistic testing
 */

export interface BackendResponse {
  success: boolean;
  message: string;
  status: string;
  color?: string;
  number?: string;
  sequence?: any[];
  total_duration?: number;
  history?: string[];
  ready_to_send?: boolean;
  is_transmitting?: boolean;
}

class BackendClient {
  private static instance: BackendClient;
  private baseUrl: string;
  
  private constructor() {
    // Backend runs on port 8000, frontend on port 3000
    this.baseUrl = 'http://localhost:8000/api';
  }
  
  public static getInstance(): BackendClient {
    if (!BackendClient.instance) {
      BackendClient.instance = new BackendClient();
    }
    return BackendClient.instance;
  }
  
  /**
   * Make HTTP request to backend
   */
  private async makeRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any): Promise<BackendResponse> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      if (data && method === 'POST') {
        options.body = JSON.stringify(data);
      }
      
      console.log(`🔗 Backend Request: ${method} ${url}`, data || '');
      
      const response = await fetch(url, options);
      const result = await response.json();
      
      console.log(`✅ Backend Response:`, result);
      
      return result;
    } catch (error) {
      console.error(`❌ Backend Error:`, error);
      
      // Fallback to local simulation if backend is not available
      console.log('🔄 Falling back to local simulation...');
      return this.simulateBackendCall(endpoint, data);
    }
  }
  
  /**
   * Fallback simulation if backend is not running
   */
  private simulateBackendCall(endpoint: string, data?: any): BackendResponse {
    console.log('🎭 Simulating backend call:', endpoint, data);
    
    // Use the existing Python bridge logic as fallback
    const PythonBridge = require('./pythonBridge').default;
    const bridge = PythonBridge.getInstance();
    
    switch (endpoint) {
      case '/set-color':
        return bridge.setColor(data?.color || '');
      case '/set-number':
        return bridge.setNumber(data?.number || '');
      case '/prepare':
        return bridge.prepareTransmission(data?.color || '', data?.number || '');
      case '/complete':
        return bridge.completeTransmission(data?.color || '', data?.number || '');
      case '/clear':
        return bridge.clearSelection();
      default:
        return {
          success: false,
          message: 'Backend not available - using simulation',
          status: 'simulation'
        };
    }
  }
  
  /**
   * Check if backend is healthy
   */
  public async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const result = await response.json();
      console.log('🏥 Backend Health:', result);
      return result.status === 'healthy';
    } catch (error) {
      console.log('🏥 Backend not available:', error);
      return false;
    }
  }
  
  /**
   * Set color
   */
  public async setColor(color: string): Promise<BackendResponse> {
    return await this.makeRequest('/set-color', 'POST', { color });
  }
  
  /**
   * Set number
   */
  public async setNumber(number: string): Promise<BackendResponse> {
    return await this.makeRequest('/set-number', 'POST', { number });
  }
  
  /**
   * Prepare transmission
   */
  public async prepareTransmission(color: string, number: string): Promise<BackendResponse> {
    return await this.makeRequest('/prepare', 'POST', { color, number });
  }
  
  /**
   * Complete transmission
   */
  public async completeTransmission(color: string, number: string): Promise<BackendResponse> {
    return await this.makeRequest('/complete', 'POST', { color, number });
  }
  
  /**
   * Clear selection
   */
  public async clearSelection(): Promise<BackendResponse> {
    return await this.makeRequest('/clear', 'POST');
  }
  
  /**
   * Get status
   */
  public async getStatus(): Promise<BackendResponse> {
    return await this.makeRequest('/status');
  }
}

export default BackendClient;