// Importation de bcrypt pour hasher les mots de passe des employés
const bcrypt = require('bcrypt');
// Importation de Prisma pour interagir avec la base de données
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Service de gestion des employés
 * Contient toute la logique métier pour les opérations CRUD sur les employés
 */
class EmployeeService {
  /**
   * Récupérer tous les employés d'une entreprise
   * @param {number} companyId - L'ID de l'entreprise
   * @returns {Array} Liste des employés avec leur ordinateur s'ils en ont un
   */
  async getAllByCompany(companyId) {
    return await prisma.employee.findMany({
      where: { companyId }, // Filtrer par entreprise
      include: {
        computer: true // Inclure l'ordinateur attribué (relation 1-1)
      },
      orderBy: {
        nom: 'asc' // Trier par nom alphabétique
      }
    });
  }

  /**
   * Récupérer un employé par ID
   * @param {number} id - L'ID de l'employé
   * @param {number} companyId - L'ID de l'entreprise (pour sécurité)
   * @returns {Object|null} L'employé trouvé ou null
   */
  async getById(id, companyId) {
    return await prisma.employee.findFirst({
      where: {
        id,
        companyId // Double vérification : l'employé doit appartenir à cette entreprise
      },
      include: {
        computer: true // Inclure l'ordinateur attribué
      }
    });
  }

  /**
   * Créer un nouvel employé
   * @param {Object} data - Les données de l'employé
   * @param {string} data.nom - Le nom
   * @param {string} data.prenom - Le prénom
   * @param {string} data.email - L'email
   * @param {string} data.password - Le mot de passe en clair
   * @param {number} data.age - L'âge (optionnel)
   * @param {string} data.genre - Le genre (optionnel)
   * @param {number} companyId - L'ID de l'entreprise
   * @returns {Object} L'employé créé
   */
  async create(data, companyId) {
    // Hasher le mot de passe de l'employé avant stockage
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return await prisma.employee.create({
      data: {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        password: hashedPassword, // Stockage sécurisé du mot de passe
        age: data.age ? parseInt(data.age) : null, // Conversion en nombre ou null
        genre: data.genre || null, // Genre optionnel
        companyId // Lier l'employé à son entreprise
      }
    });
  }

  /**
   * Mettre à jour un employé
   * @param {number} id - L'ID de l'employé à modifier
   * @param {Object} data - Les nouvelles données
   * @param {number} companyId - L'ID de l'entreprise (pour sécurité)
   * @returns {Object} L'employé mis à jour
   */
  async update(id, data, companyId) {
    // Vérifier que l'employé existe et appartient à cette entreprise
    const employee = await this.getById(id, companyId);
    if (!employee) {
      throw new Error('Employé non trouvé');
    }

    // Préparer les données à mettre à jour
    const updateData = {
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      age: data.age ? parseInt(data.age) : null,
      genre: data.genre || null
    };

    // Si un nouveau mot de passe est fourni, le hasher et l'ajouter aux données
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // Mettre à jour l'employé en base
    return await prisma.employee.update({
      where: { id },
      data: updateData
    });
  }

  /**
   * Supprimer un employé
   * @param {number} id - L'ID de l'employé à supprimer
   * @param {number} companyId - L'ID de l'entreprise (pour sécurité)
   * @returns {Object} L'employé supprimé
   */
  async delete(id, companyId) {
    // Vérifier que l'employé existe et appartient à cette entreprise
    const employee = await this.getById(id, companyId);
    if (!employee) {
      throw new Error('Employé non trouvé');
    }

    // Supprimer l'employé (l'ordinateur sera automatiquement désattribué grâce à onDelete: SetNull)
    return await prisma.employee.delete({
      where: { id }
    });
  }
}

// Export d'une instance unique du service
module.exports = new EmployeeService();
