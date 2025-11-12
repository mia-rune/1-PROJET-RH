// Importation de Prisma pour interagir avec la base de données
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Service de gestion des ordinateurs
 * Contient toute la logique métier pour les opérations CRUD sur les ordinateurs
 */
class ComputerService {
  /**
   * Récupérer tous les ordinateurs d'une entreprise
   * @param {number} companyId - L'ID de l'entreprise
   * @returns {Array} Liste des ordinateurs avec l'employé attribué s'il y en a un
   */
  async getAllByCompany(companyId) {
    return await prisma.computer.findMany({
      where: { companyId }, // Filtrer par entreprise
      include: {
        employee: true // Inclure l'employé attribué (relation 1-1)
      },
      orderBy: {
        macAddress: 'asc' // Trier par adresse MAC alphabétique
      }
    });
  }

  /**
   * Récupérer un ordinateur par ID
   * @param {number} id - L'ID de l'ordinateur
   * @param {number} companyId - L'ID de l'entreprise (pour sécurité)
   * @returns {Object|null} L'ordinateur trouvé ou null
   */
  async getById(id, companyId) {
    return await prisma.computer.findFirst({
      where: {
        id,
        companyId // Double vérification : l'ordinateur doit appartenir à cette entreprise
      },
      include: {
        employee: true // Inclure l'employé attribué s'il y en a un
      }
    });
  }

  /**
   * Créer un nouvel ordinateur
   * @param {Object} data - Les données de l'ordinateur
   * @param {string} data.macAddress - L'adresse MAC
   * @param {number} companyId - L'ID de l'entreprise
   * @returns {Object} L'ordinateur créé
   */
  async create(data, companyId) {
    return await prisma.computer.create({
      data: {
        macAddress: data.macAddress,
        companyId // Lier l'ordinateur à son entreprise
      }
    });
  }

  /**
   * Mettre à jour un ordinateur
   * @param {number} id - L'ID de l'ordinateur à modifier
   * @param {Object} data - Les nouvelles données
   * @param {string} data.macAddress - La nouvelle adresse MAC
   * @param {string} data.employeeId - L'ID de l'employé à attribuer (ou '' pour désattribuer)
   * @param {string} data.statut - Le statut (disponible, attribué, en panne)
   * @param {number} companyId - L'ID de l'entreprise (pour sécurité)
   * @returns {Object} L'ordinateur mis à jour
   */
  async update(id, data, companyId) {
    // Vérifier que l'ordinateur existe et appartient à cette entreprise
    const computer = await this.getById(id, companyId);
    if (!computer) {
      throw new Error('Ordinateur non trouvé');
    }

    // Préparer les données à mettre à jour
    const updateData = {
      macAddress: data.macAddress,
      statut: data.statut || 'disponible' // Par défaut : disponible
    };

    // Gérer l'attribution à un employé
    if (data.employeeId === '') {
      // Si chaîne vide = désattribuer l'ordinateur
      updateData.employeeId = null;
    } else if (data.employeeId) {
      // Convertir l'ID en nombre
      const employeeIdInt = parseInt(data.employeeId);

      // Vérifier uniquement si on change d'employé (pas le même qu'avant)
      if (computer.employeeId !== employeeIdInt) {
        // Vérifier si cet employé a déjà un ordinateur attribué
        const existingComputer = await prisma.computer.findFirst({
          where: {
            employeeId: employeeIdInt,
            companyId
          }
        });

        // Si oui, empêcher l'attribution (un employé ne peut avoir qu'un seul ordinateur)
        if (existingComputer) {
          throw new Error('Cet employé a déjà un ordinateur attribué');
        }
      }

      // Attribuer l'ordinateur à l'employé
      updateData.employeeId = employeeIdInt;
    }

    // Mettre à jour l'ordinateur en base
    return await prisma.computer.update({
      where: { id },
      data: updateData
    });
  }

  /**
   * Supprimer un ordinateur
   * @param {number} id - L'ID de l'ordinateur à supprimer
   * @param {number} companyId - L'ID de l'entreprise (pour sécurité)
   * @returns {Object} L'ordinateur supprimé
   */
  async delete(id, companyId) {
    // Vérifier que l'ordinateur existe et appartient à cette entreprise
    const computer = await this.getById(id, companyId);
    if (!computer) {
      throw new Error('Ordinateur non trouvé');
    }

    // Supprimer l'ordinateur
    return await prisma.computer.delete({
      where: { id }
    });
  }

  /**
   * Obtenir le statut d'un ordinateur (méthode utilitaire - non utilisée actuellement)
   * @param {Object} computer - L'objet ordinateur
   * @returns {string} 'assigned' si attribué, 'available' sinon
   */
  getStatus(computer) {
    if (computer.employee) {
      return 'assigned';
    }
    return 'available';
  }
}

// Export d'une instance unique du service
module.exports = new ComputerService();
