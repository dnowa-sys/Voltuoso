// src/services/openevseService.ts
export interface StationStatus {
  id: string;
  state: 'not_connected' | 'connected' | 'charging' | 'error';
  amp: number;
  voltage: number;
  power: number;
  energy: number; // Wh
  elapsed: number; // seconds
  temperature: number;
  pilot: number;
}

export interface ChargeCommand {
  stationId: string;
  chargeCurrent: number;
  maxCurrent?: number;
  energyLimit?: number; // kWh (0 = no limit)
  timeLimit?: number; // minutes (0 = no limit)
}

class OpenEVSEService {
  async getStationStatus(stationIp: string): Promise<StationStatus> {
    const response = await fetch(`http://${stationIp}/status`);
    const data = await response.json();
    
    return {
      id: stationIp,
      state: this.mapState(data.state),
      amp: data.amp,
      voltage: data.voltage, 
      power: data.power,
      energy: data.energy,
      elapsed: data.elapsed,
      temperature: data.temp1,
      pilot: data.pilot
    };
  }

  async startCharging(stationIp: string, command: ChargeCommand): Promise<boolean> {
    const payload = {
      state: "active",
      charge_current: command.chargeCurrent,
      max_current: command.maxCurrent || 40,
      energy_limit: command.energyLimit || 0,
      time_limit: command.timeLimit || 0,
      auto_release: false
    };

    const response = await fetch(`http://${stationIp}/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return response.ok;
  }

  async stopCharging(stationIp: string): Promise<boolean> {
    const response = await fetch(`http://${stationIp}/override`, {
      method: 'DELETE'
    });

    return response.ok;
  }

  // WebSocket connection for real-time updates
  connectWebSocket(stationIp: string, onUpdate: (status: StationStatus) => void): WebSocket {
    const ws = new WebSocket(`ws://${stationIp}/ws`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const status = this.parseWebSocketData(data);
      onUpdate(status);
    };

    return ws;
  }

  private mapState(state: number): StationStatus['state'] {
    switch(state) {
      case 1: return 'not_connected';
      case 2: return 'connected'; 
      case 3: return 'charging';
      case 4: 
      case 5: return 'error';
      default: return 'error';
    }
  }
}

export const openevseService = new OpenEVSEService();