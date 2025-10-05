const fetch = require('node-fetch');

// Charger les variables d'environnement
require('dotenv').config();

// Test sans authentification (doit échouer)
async function testNotificationWithoutAuth() {
  try {
    console.log('🔒 Test sans authentification (doit échouer)...');
    
    const response = await fetch('http://localhost:3200/api/push/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test sans auth',
        body: 'Ce test doit échouer.',
        bookId: '41'
      })
    });

    const result = await response.json();
    console.log(`❌ Status: ${response.status}`);
    console.log('📄 Réponse:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Test avec mauvais mot de passe (doit échouer)
async function testNotificationWithWrongPassword() {
  try {
    console.log('🔒 Test avec mauvais mot de passe (doit échouer)...');
    
    const response = await fetch('http://localhost:3200/api/push/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Notification-Password': 'mauvais-mot-de-passe'
      },
      body: JSON.stringify({
        title: 'Test mauvais mot de passe',
        body: 'Ce test doit échouer.',
        bookId: '41'
      })
    });

    const result = await response.json();
    console.log(`❌ Status: ${response.status}`);
    console.log('📄 Réponse:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Test avec le bon mot de passe (doit réussir)
async function testNotificationWithCorrectPassword() {
  try {
    console.log('✅ Test avec le bon mot de passe (doit réussir)...');
    
    const password = process.env.NOTIFICATION_PASSWORD;
    if (!password) {
      console.error('❌ NOTIFICATION_PASSWORD non défini dans .env');
      return;
    }
    
    const response = await fetch('http://localhost:3200/api/push/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Notification-Password': password
      },
      body: JSON.stringify({
        title: 'Nouveau livre disponible !',
        body: 'Le livre "Refcard PWA" vient d\'être ajouté à la bibliothèque.',
        bookId: '41'
      })
    });

    if (!response.ok) {
      const errorResult = await response.json();
      console.log(`❌ Status: ${response.status}`);
      console.log('📄 Erreur:', JSON.stringify(errorResult, null, 2));
      return;
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

// Test avec format Bearer (doit réussir)
async function testNotificationWithBearerFormat() {
  try {
    console.log('🔑 Test avec format Bearer (doit réussir)...');
    
    const password = process.env.NOTIFICATION_PASSWORD;
    if (!password) {
      console.error('❌ NOTIFICATION_PASSWORD non défini dans .env');
      return;
    }
    
    const response = await fetch('http://localhost:3200/api/push/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${password}`
      },
      body: JSON.stringify({
        title: 'Test Bearer format',
        body: 'Test avec le format Bearer dans Authorization.',
        bookId: '41'
      })
    });

    if (!response.ok) {
      const errorResult = await response.json();
      console.log(`❌ Status: ${response.status}`);
      console.log('📄 Erreur:', JSON.stringify(errorResult, null, 2));
      return;
    }

    const result = await response.json();
    console.log('✅ Résultat Bearer:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur lors du test Bearer:', error.message);
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

// Exécuter les tests de sécurité
async function runSecurityTests() {
  console.log('🚀 Démarrage des tests de sécurité pour les notifications push\n');
  
  await checkStats();
  console.log('\n===========================================');
  
  await testNotificationWithoutAuth();
  console.log('\n===========================================');
  
  await testNotificationWithWrongPassword();
  console.log('\n===========================================');
  
  await testNotificationWithCorrectPassword();
  console.log('\n===========================================');
  
  await testNotificationWithBearerFormat();
  console.log('\n===========================================');
  
  console.log('\n✨ Tests de sécurité terminés !');
  console.log('\n📋 Résumé des tests :');
  console.log('1. ❌ Sans authentification → Doit échouer (401)');
  console.log('2. ❌ Mauvais mot de passe → Doit échouer (401)');
  console.log('3. ✅ Bon mot de passe (X-Notification-Password) → Doit réussir');
  console.log('4. ✅ Format Bearer (Authorization) → Doit réussir');
  console.log('\n💡 Pour tester complètement avec de vrais abonnements :');
  console.log('1. Ouvrez http://localhost:3200 dans votre navigateur');
  console.log('2. Cliquez sur "Recevoir les notifications" et acceptez les permissions');
  console.log('3. Relancez ce script avec: node test-notification.js');
}

runSecurityTests();
