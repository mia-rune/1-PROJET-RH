/**
 * BUILD SCHEMA - Script de construction du schema Prisma
 *
 * Ce script permet de gérer le schema Prisma de manière modulaire :
 * - Au lieu d'avoir un seul gros fichier schema.prisma
 * - On peut séparer chaque modèle dans prisma/models/
 * - Ce script assemble tous les fichiers en un seul schema.prisma
 *
 * Utilisation: npm run db:generate ou npm run db:migrate
 */

// Import des modules Node.js pour manipuler les fichiers
const fs = require('fs'); // File System - pour lire/écrire des fichiers
const path = require('path'); // Pour gérer les chemins de fichiers

/**
 * DÉFINITION DES CHEMINS
 */

// Chemin du dossier prisma (remonte d'un niveau depuis /scripts)
const prismaDir = path.join(__dirname, '..', 'prisma');

// Chemin du dossier contenant les modèles séparés
const modelsDir = path.join(prismaDir, 'models');

// Chemin du fichier schema.prisma final qui sera généré
const schemaFile = path.join(prismaDir, 'schema.prisma');

/**
 * EN-TÊTE DU SCHEMA
 * Cette partie est commune à tous les projets Prisma
 * Elle configure le générateur et la connexion à la base de données
 */
const schemaHeader = `// Schema Prisma pour l'application Big Boss RH
// Genere automatiquement - Ne pas modifier manuellement

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

`;

/**
 * FONCTION PRINCIPALE : Construire le schema complet
 *
 * Cette fonction :
 * 1. Lit tous les fichiers .prisma du dossier models/
 * 2. Les assemble dans un seul fichier schema.prisma
 * 3. Ajoute l'en-tête de configuration au début
 */
function buildSchema() {
  try {
    // Commencer avec l'en-tête (configuration generator + datasource)
    let schemaContent = schemaHeader;

    // ÉTAPE 1: Lire tous les fichiers .prisma dans le dossier models
    const modelFiles = fs.readdirSync(modelsDir)
      .filter(file => file.endsWith('.prisma')) // Ne garder que les fichiers .prisma
      .sort(); // Trier par ordre alphabétique pour la cohérence

    // Afficher les fichiers trouvés dans la console
    console.log('Fichiers de modeles trouves:', modelFiles);

    // ÉTAPE 2: Pour chaque fichier de modèle trouvé
    modelFiles.forEach(file => {
      // Construire le chemin complet du fichier
      const filePath = path.join(modelsDir, file);

      // Lire le contenu du fichier (modèle Prisma)
      const content = fs.readFileSync(filePath, 'utf8');

      // Ajouter ce contenu au schema final avec deux sauts de ligne
      schemaContent += content + '\n\n';

      // Afficher dans la console qu'on a ajouté ce fichier
      console.log('Ajoute:', file);
    });

    // ÉTAPE 3: Écrire le schema final dans schema.prisma
    fs.writeFileSync(schemaFile, schemaContent);

    // Message de succès
    console.log('Schema Prisma genere avec succes !');

  } catch (error) {
    // En cas d'erreur (fichier manquant, droits insuffisants, etc.)
    console.error('Erreur lors de la generation du schema:', error.message);

    // Arrêter le processus avec un code d'erreur
    // process.exit(1) signale à npm qu'il y a eu une erreur
    process.exit(1);
  }
}

/**
 * POINT D'ENTRÉE DU SCRIPT
 * Si ce fichier est exécuté directement (pas importé comme module)
 * alors lancer la fonction buildSchema
 */
if (require.main === module) {
  buildSchema();
}

// Exporter la fonction pour pouvoir l'utiliser dans d'autres scripts si nécessaire
module.exports = buildSchema;