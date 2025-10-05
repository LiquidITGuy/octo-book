#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Mise à jour des URLs des images dans books.json...');

// Lire le fichier books.json
const booksPath = 'api/books.json';
const booksData = JSON.parse(fs.readFileSync(booksPath, 'utf8'));

console.log(`📚 ${booksData.length} livres trouvés`);

// Mettre à jour chaque livre
let updatedCount = 0;
booksData.forEach((book, index) => {
  if (book.thumbnail && book.thumbnail.includes('octo.com/assets/publications-categories-images/')) {
    const originalUrl = book.thumbnail;
    const filename = path.basename(originalUrl);
    const newUrl = `https://octo-books.ln1.eu/images/${filename}`;
    
    book.thumbnail = newUrl;
    updatedCount++;
    
    console.log(`  ✅ [${index + 1}] ${book.title}: ${filename}`);
  }
});

// Sauvegarder le fichier mis à jour
fs.writeFileSync(booksPath, JSON.stringify(booksData, null, 2), 'utf8');

console.log('');
console.log('🎉 Mise à jour terminée !');
console.log(`📊 ${updatedCount} URLs mises à jour`);
console.log('📁 Fichier sauvegardé: api/books.json');

// Créer aussi une copie de sauvegarde
const backupPath = 'api/books.json.backup-old-urls';
console.log(`💾 Copie de sauvegarde avec les anciennes URLs: ${backupPath}`);
