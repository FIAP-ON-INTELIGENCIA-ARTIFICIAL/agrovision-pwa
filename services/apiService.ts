interface StatsRequest {
  valores: number[];
}

interface StatsResponse {
  n: number;
  media: number;
  desvio: number;
  min: number;
  max: number;
}

interface WeatherRequest {
  lat: number;
  lon: number;
  dias: number;
}

interface WeatherResponse {
  precipitacao_total_mm: number;
  temperatura_media_c: number;
  umidade_media_pct: number;
  dias: number;
}

// Mock data
const mockWeatherData: WeatherResponse = {
  precipitacao_total_mm: 85,
  temperatura_media_c: 24.5,
  umidade_media_pct: 68,
  dias: 7
};

const mockStatsData = (valores: number[]): StatsResponse => ({
  n: valores.length,
  media: valores.reduce((a, b) => a + b, 0) / valores.length,
  desvio: Math.sqrt(valores.reduce((sq, n, _, arr) => sq + Math.pow(n - arr.reduce((a, b) => a + b) / arr.length, 2), 0) / valores.length),
  min: Math.min(...valores),
  max: Math.max(...valores)
});

class ApiService {
  private baseUrl: string;
  private useMock: boolean;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    this.useMock = !this.baseUrl || process.env.USE_MOCK !== 'false';
  }

  async getStats(data: StatsRequest): Promise<StatsResponse> {
    if (this.useMock) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockStatsData(data.valores);
    }

    try {
      const response = await fetch(`${this.baseUrl}/analytics/stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('API call failed, falling back to mock data:', error);
      return mockStatsData(data.valores);
    }
  }

  async getWeatherSummary(data: WeatherRequest): Promise<WeatherResponse> {
    if (this.useMock) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...mockWeatherData, dias: data.dias };
    }

    try {
      const response = await fetch(`${this.baseUrl}/weather/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('API call failed, falling back to mock data:', error);
      return { ...mockWeatherData, dias: data.dias };
    }
  }

  isMockMode(): boolean {
    return this.useMock;
  }
}

export const apiService = new ApiService();
export type { StatsRequest, StatsResponse, WeatherRequest, WeatherResponse };