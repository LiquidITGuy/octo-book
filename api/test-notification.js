const fetch = require('node-fetch');

// Script pour tester l'envoi d'une notification push
async function testNotification() {
  try {
    console.log('🧪 Test d\'envoi de notification push...');
    
    const response = await fetch('http://localhost:3200/api/push/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Nouveau livre disponible !',
        body: 'Le livre "Refcard PWA" vient d\'être ajouté à la bibliothèque.',
        bookId: '41'
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Résultat:', JSON.stringify(result, null, 2));
    
    if (result.results.successful > 0) {
      console.log(`🎉 ${result.results.successful} notification(s) envoyée(s) avec succès !`);
    } else {
      console.log('⚠️ Aucune notification envoyée. Vérifiez qu\'il y a des abonnements actifs.');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Vérifier les statistiques d'abonnement
async function checkStats() {
  try {
    console.log('📊 Vérification des statistiques d\'abonnement...');
    
    const response = await fetch('http://localhost:3200/api/push/stats');
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const stats = await response.json();
    console.log('📈 Statistiques:', JSON.stringify(stats, null, 2));
    
    if (stats.totalSubscriptions === 0) {
      console.log('⚠️ Aucun abonnement trouvé. Abonnez-vous d\'abord via l\'interface web.');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des stats:', error.message);
  }
}

// Exécuter les tests
async function runTests() {
  console.log('🚀 Démarrage des tests de notifications push\n');
  
  await checkStats();
  console.log('');
  await testNotification();
  
  console.log('\n✨ Tests terminés !');
  console.log('\nPour tester complètement :');
  console.log('1. Ouvrez http://localhost:3200 dans votre navigateur');
  console.log('2. Cliquez sur "Recevoir les notifications" et acceptez les permissions');
  console.log('3. Relancez ce script avec: node test-notification.js');
}

runTests();
