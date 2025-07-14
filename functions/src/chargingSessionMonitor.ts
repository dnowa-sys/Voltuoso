// src/services/chargingSessionMonitor.ts
export class ChargingSessionMonitor {
  private websocket: WebSocket | null = null;
  private sessionId: string;
  private stationIp: string;

  constructor(sessionId: string, stationIp: string) {
    this.sessionId = sessionId;
    this.stationIp = stationIp;
  }

  startMonitoring(onUpdate: (data: any) => void) {
    this.websocket = new WebSocket(`ws://${this.stationIp}/ws`);
    
    this.websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Update local state
      onUpdate({
        power: data.power,
        energy: data.energy / 1000, // Convert to kWh
        elapsed: data.elapsed,
        state: data.state,
        amp: data.amp,
        voltage: data.voltage
      });
      
      // Update Firestore session record
      this.updateFirestoreSession(data);
    };

    this.websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.websocket.onclose = () => {
      // Attempt reconnection
      setTimeout(() => this.startMonitoring(onUpdate), 5000);
    };
  }

  private async updateFirestoreSession(data: any) {
    try {
      await firestore().collection('sessions').doc(this.sessionId).update({
        energyDelivered: data.energy / 1000,
        currentPower: data.power,
        lastUpdated: firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  }

  stopMonitoring() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }
}