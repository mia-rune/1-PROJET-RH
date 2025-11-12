// Import du service ordinateur qui contient la logique métier
const computerService = require('../services/computerService');

/**
 * Créer un nouvel ordinateur
 * Route: POST /computers
 */
exports.create = async (req, res) => {
  try {
    // Récupérer l'ID de l'entreprise depuis la session
    const companyId = req.session.companyId;

    // Récupérer l'adresse MAC du formulaire d'ajout
    const { macAddress } = req.body;

    // VALIDATION: Vérifier le format de l'adresse MAC
    // Format attendu: AA:BB:CC:DD:EE:FF ou AA-BB-CC-DD-EE-FF
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(macAddress)) {
      // Si le format est invalide, rediriger avec une erreur
      return res.redirect('/dashboard?error=invalid_mac_address');
    }

    // Appeler le service pour créer l'ordinateur en base
    await computerService.create({ macAddress }, companyId);

    // Rediriger vers le dashboard avec un message de succès
    res.redirect('/dashboard?success=computer_created');

  } catch (error) {
    // En cas d'erreur, logger et rediriger avec un message d'erreur
    console.error('Erreur lors de la création de l\'ordinateur:', error);
    res.redirect('/dashboard?error=computer_creation_failed');
  }
};

/**
 * Mettre à jour un ordinateur existant
 * Route: POST /computers/:id
 */
exports.update = async (req, res) => {
  try {
    // Récupérer l'ID de l'entreprise depuis la session
    const companyId = req.session.companyId;

    // Récupérer l'ID de l'ordinateur depuis l'URL
    const computerId = parseInt(req.params.id);

    // Récupérer les nouvelles données du formulaire de modification
    const { macAddress, employeeId, statut } = req.body;

    // VALIDATION: Vérifier le format de l'adresse MAC
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(macAddress)) {
      return res.redirect('/dashboard?error=invalid_mac_address');
    }

    // Appeler le service pour mettre à jour l'ordinateur
    await computerService.update(computerId, {
      macAddress,
      employeeId, // Peut être vide pour désattribuer
      statut // disponible, attribué, ou en panne
    }, companyId);

    // Rediriger vers le dashboard avec un message de succès
    res.redirect('/dashboard?success=computer_updated');

  } catch (error) {
    // Logger l'erreur
    console.error('Erreur lors de la modification de l\'ordinateur:', error);

    // Gérer les erreurs métier spécifiques
    if (error.message === 'Cet employé a déjà un ordinateur attribué') {
      // Si l'employé a déjà un ordinateur, rediriger avec cette erreur précise
      res.redirect('/dashboard?error=employee_already_has_computer');
    } else {
      // Sinon, message d'erreur générique
      res.redirect('/dashboard?error=computer_update_failed');
    }
  }
};

/**
 * Supprimer un ordinateur
 * Route: POST /computers/:id/delete
 */
exports.delete = async (req, res) => {
  try {
    // Récupérer l'ID de l'entreprise depuis la session
    const companyId = req.session.companyId;

    // Récupérer l'ID de l'ordinateur depuis l'URL
    const computerId = parseInt(req.params.id);

    // Appeler le service pour supprimer l'ordinateur
    await computerService.delete(computerId, companyId);

    // Rediriger vers le dashboard avec un message de succès
    res.redirect('/dashboard?success=computer_deleted');

  } catch (error) {
    // En cas d'erreur, logger et rediriger avec un message d'erreur
    console.error('Erreur lors de la suppression de l\'ordinateur:', error);
    res.redirect('/dashboard?error=computer_deletion_failed');
  }
};
