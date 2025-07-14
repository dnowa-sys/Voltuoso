// functions/src/openevse.ts
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { openevseService } from './services/openevseService';

export const startChargingSession = onCall(async (request) => {
  const { stationId, userId, paymentIntentId, chargeCurrent } = request.data;
  
  try {
    // 1. Verify payment authorization
    await verifyPaymentIntent(paymentIntentId);
    
    // 2. Get station IP from Firestore
    const stationDoc = await admin.firestore()
      .collection('stations')
      .doc(stationId)
      .get();
    
    const stationIp = stationDoc.data()?.ipAddress;
    
    // 3. Start charging via OpenEVSE API
    const success = await openevseService.startCharging(stationIp, {
      stationId,
      chargeCurrent: chargeCurrent || 32
    });
    
    if (!success) {
      throw new HttpsError('internal', 'Failed to start charging station');
    }
    
    // 4. Create session record
    const sessionId = `session_${Date.now()}`;
    await admin.firestore().collection('sessions').doc(sessionId).set({
      sessionId,
      userId,
      stationId,
      paymentIntentId,
      status: 'active',
      startTime: admin.firestore.FieldValue.serverTimestamp(),
      chargeCurrent,
      energyDelivered: 0,
      cost: 0
    });
    
    return { sessionId, status: 'started' };
    
  } catch (error) {
    console.error('Start charging error:', error);
    throw new HttpsError('internal', 'Failed to start charging session');
  }
});

export const stopChargingSession = onCall(async (request) => {
  const { sessionId } = request.data;
  
  try {
    // 1. Get session info
    const sessionDoc = await admin.firestore()
      .collection('sessions')
      .doc(sessionId)
      .get();
    
    if (!sessionDoc.exists) {
      throw new HttpsError('not-found', 'Session not found');
    }
    
    const sessionData = sessionDoc.data();
    const stationId = sessionData?.stationId;
    
    // 2. Get station IP
    const stationDoc = await admin.firestore()
      .collection('stations')
      .doc(stationId)
      .get();
    
    const stationIp = stationDoc.data()?.ipAddress;
    
    // 3. Stop charging via OpenEVSE API
    const success = await openevseService.stopCharging(stationIp);
    
    if (!success) {
      throw new HttpsError('internal', 'Failed to stop charging station');
    }
    
    // 4. Get final status and update session
    const finalStatus = await openevseService.getStationStatus(stationIp);
    
    await sessionDoc.ref.update({
      status: 'completed',
      endTime: admin.firestore.FieldValue.serverTimestamp(),
      energyDelivered: finalStatus.energy / 1000, // Convert Wh to kWh
      finalCost: (finalStatus.energy / 1000) * sessionData.pricePerKwh
    });
    
    return { status: 'stopped', energyDelivered: finalStatus.energy };
    
  } catch (error) {
    console.error('Stop charging error:', error);
    throw new HttpsError('internal', 'Failed to stop charging session');
  }
});