// API Configuration utility
// Handles different environments and provides fallback mechanisms

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

class ApiConfigManager {
  private config: ApiConfig;

  constructor() {
    this.config = this.initializeConfig();
  }

  private initializeConfig(): ApiConfig {
    // Get base URL from environment variables with fallback logic
    const envBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const environment = process.env.REACT_APP_ENVIRONMENT || 'development';
    
    let baseUrl: string;
    
    if (envBaseUrl) {
      baseUrl = envBaseUrl;
    } else {
      // Fallback logic based on environment detection
      if (this.isRunningInDocker()) {
        baseUrl = 'http://localhost:53124';
      } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        baseUrl = 'http://localhost:5001';
      } else {
        // Production fallback
        baseUrl = `${window.location.protocol}//${window.location.hostname}:5001`;
      }
    }

    return {
      baseUrl: baseUrl.replace(/\/$/, ''), // Remove trailing slash
      timeout: 30000, // 30 seconds timeout for video processing
      retryAttempts: 3
    };
  }

  private isRunningInDocker(): boolean {
    // Check if we're running inside a Docker container
    // This is a heuristic approach
    return (
      process.env.REACT_APP_ENVIRONMENT === 'docker' ||
      window.location.hostname === 'frontend' ||
      document.cookie.includes('docker=true')
    );
  }

  public getBaseUrl(): string {
    return this.config.baseUrl;
  }

  public getTimeout(): number {
    return this.config.timeout;
  }

  public getRetryAttempts(): number {
    return this.config.retryAttempts;
  }

  public getFullUrl(endpoint: string): string {
    // Ensure endpoint starts with /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.config.baseUrl}${cleanEndpoint}`;
  }

  // Method to test connectivity and provide debugging info
  public async testConnection(): Promise<{
    success: boolean;
    baseUrl: string;
    error?: string;
    responseTime?: number;
  }> {
    const startTime = Date.now();
    
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(this.getFullUrl('/'), {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      return {
        success: response.ok,
        baseUrl: this.config.baseUrl,
        responseTime
      };
    } catch (error) {
      return {
        success: false,
        baseUrl: this.config.baseUrl,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Create singleton instance
export const apiConfig = new ApiConfigManager();

// Export utility functions
export const getApiUrl = (endpoint: string): string => {
  return apiConfig.getFullUrl(endpoint);
};

export const getBaseUrl = (): string => {
  return apiConfig.getBaseUrl();
};

// Export for debugging
export const debugApiConfig = () => {
  console.log('API Configuration:', {
    baseUrl: apiConfig.getBaseUrl(),
    timeout: apiConfig.getTimeout(),
    environment: process.env.REACT_APP_ENVIRONMENT,
    hostname: window.location.hostname,
    isDocker: process.env.REACT_APP_ENVIRONMENT === 'docker'
  });
};