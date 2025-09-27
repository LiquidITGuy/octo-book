const webpush = require('web-push');

// Générer les clés VAPID
const vapidKeys = webpush.generateVAPIDKeys();

console.log('Clés VAPID générées :');
console.log('');
console.log('Clé publique:', vapidKeys.publicKey);
console.log('Clé privée:', vapidKeys.privateKey);
console.log('');
console.log('Ajoutez ces clés dans votre fichier .env :');
console.log('');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('VAPID_EMAIL=mailto:admin@octobooks.com');
