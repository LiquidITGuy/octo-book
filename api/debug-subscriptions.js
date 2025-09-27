const fetch = require('node-fetch');

async function debugSubscriptions() {
  console.log('🔍 Diagnostic des abonnements push\n');
  
  try {
    // 1. Vérifier les statistiques
    console.log('1. Vérification des statistiques...');
    const statsResponse = await fetch('http://localhost:3200/api/push/stats');
    const stats = await statsResponse.json();
    console.log('Stats:', JSON.stringify(stats, null, 2));
    
    // 2. Vérifier la clé VAPID
    console.log('\n2. Vérification de la clé VAPID...');
    const vapidResponse = await fetch('http://localhost:3200/api/push/vapid-public-key');
    const vapidData = await vapidResponse.json();
    console.log('Clé VAPID:', vapidData.publicKey ? 'OK' : 'MANQUANTE');
    
    // 3. Tester un abonnement factice
    console.log('\n3. Test d\'abonnement factice...');
    const fakeSubscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
      keys: {
        p256dh: 'test-p256dh-key',
        auth: 'test-auth-key'
      }
    };
    
    const subscribeResponse = await fetch('http://localhost:3200/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: fakeSubscription,
        userAgent: 'Debug Script',
        timestamp: new Date().toISOString()
      })
    });
    
    const subscribeResult = await subscribeResponse.json();
    console.log('Résultat abonnement:', JSON.stringify(subscribeResult, null, 2));
    
    // 4. Re-vérifier les statistiques
    console.log('\n4. Re-vérification des statistiques...');
    const newStatsResponse = await fetch('http://localhost:3200/api/push/stats');
    const newStats = await newStatsResponse.json();
    console.log('Nouvelles stats:', JSON.stringify(newStats, null, 2));
    
    // 5. Tester l'envoi de notification
    console.log('\n5. Test d\'envoi de notification...');
    const notifyResponse = await fetch('http://localhost:3200/api/push/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Debug',
        body: 'Notification de test depuis le script de debug',
        bookId: 'debug-123'
      })
    });
    
    const notifyResult = await notifyResponse.json();
    console.log('Résultat notification:', JSON.stringify(notifyResult, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message);
  }
}

debugSubscriptions();
