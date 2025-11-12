// Importation de bcrypt pour le hashage des mots de passe
const bcrypt = require('bcrypt');
// Importation de Prisma Client pour interagir avec la base de données
const { PrismaClient } = require('@prisma/client');
// Création d'une instance Prisma pour les requêtes SQL
const prisma = new PrismaClient();

/**
 * Service d'authentification
 * Gère toute la logique métier liée à l'authentification des entreprises
 */
class AuthService {
  /**
   * Hasher un mot de passe
   * @param {string} password - Le mot de passe en clair
   * @returns {string} Le mot de passe hashé
   * Utilise bcrypt avec un salt de 10 rounds pour sécuriser le mot de passe
   */
  async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  /**
   * Vérifier un mot de passe
   * @param {string} password - Le mot de passe en clair saisi par l'utilisateur
   * @param {string} hashedPassword - Le mot de passe hashé stocké en base
   * @returns {boolean} true si les mots de passe correspondent, false sinon
   */
  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Trouver une entreprise par SIRET
   * @param {string} siret - Le numéro SIRET (14 chiffres)
   * @returns {Object|null} L'entreprise trouvée ou null si elle n'existe pas
   */
  async findCompanyBySiret(siret) {
    return await prisma.company.findUnique({
      where: { siret } // Recherche par SIRET unique
    });
  }

  /**
   * Créer une nouvelle entreprise
   * @param {Object} data - Les données de l'entreprise
   * @param {string} data.raisonSociale - La raison sociale
   * @param {string} data.siret - Le numéro SIRET
   * @param {string} data.password - Le mot de passe en clair
   * @param {string} data.directeur - Le nom du directeur (optionnel)
   * @returns {Object} L'entreprise créée
   */
  async createCompany(data) {
    // Hasher le mot de passe avant de l'enregistrer en base
    const hashedPassword = await this.hashPassword(data.password);

    // Créer l'entreprise dans la base de données
    return await prisma.company.create({
      data: {
        raisonSociale: data.raisonSociale,
        siret: data.siret,
        password: hashedPassword, // Stockage du mot de passe hashé (jamais en clair)
        nomDirecteur: data.directeur || null // Si pas de directeur fourni, on met null
      }
    });
  }

  /**
   * Authentifier une entreprise
   * @param {string} siret - Le numéro SIRET
   * @param {string} password - Le mot de passe en clair
   * @returns {Object} Objet avec success: true/false et les données de l'entreprise ou une erreur
   */
  async authenticateCompany(siret, password) {
    // Rechercher l'entreprise par SIRET
    const company = await this.findCompanyBySiret(siret);

    // Si l'entreprise n'existe pas
    if (!company) {
      return { success: false, error: 'SIRET ou mot de passe incorrect.' };
    }

    // Vérifier si le mot de passe saisi correspond au mot de passe hashé en base
    const isPasswordValid = await this.verifyPassword(password, company.password);

    // Si le mot de passe est incorrect
    if (!isPasswordValid) {
      return { success: false, error: 'SIRET ou mot de passe incorrect.' };
    }

    // Authentification réussie : renvoyer les données de l'entreprise (sans le mot de passe)
    return {
      success: true,
      company: {
        id: company.id,
        raisonSociale: company.raisonSociale,
        siret: company.siret,
        nomDirecteur: company.nomDirecteur
      }
    };
  }
}

// Export d'une instance unique du service (pattern Singleton)
module.exports = new AuthService();
