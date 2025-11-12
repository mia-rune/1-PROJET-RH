// Import du service employé qui contient la logique métier
const employeeService = require('../services/employeeService');

/**
 * Créer un nouvel employé
 * Route: POST /employees
 */
exports.create = async (req, res) => {
  try {
    // Récupérer l'ID de l'entreprise depuis la session
    // req.session contient les données stockées lors de la connexion
    const companyId = req.session.companyId;

    // Récupérer les données du formulaire d'ajout d'employé
    const { nom, prenom, email, password, age, genre } = req.body;

    // Appeler le service pour créer l'employé en base
    await employeeService.create({
      nom,
      prenom,
      email,
      password, // Le service va hasher ce mot de passe
      age,
      genre
    }, companyId);

    // Rediriger vers le dashboard avec un message de succès
    // Le paramètre ?success=employee_created sera utilisé pour afficher un message
    res.redirect('/dashboard?success=employee_created');

  } catch (error) {
    // En cas d'erreur, logger et rediriger avec un message d'erreur
    console.error('Erreur lors de la création de l\'employé:', error);
    res.redirect('/dashboard?error=employee_creation_failed');
  }
};

/**
 * Mettre à jour un employé existant
 * Route: POST /employees/:id
 */
exports.update = async (req, res) => {
  try {
    // Récupérer l'ID de l'entreprise depuis la session
    const companyId = req.session.companyId;

    // Récupérer l'ID de l'employé depuis l'URL (req.params.id)
    // parseInt() convertit la chaîne en nombre
    const employeeId = parseInt(req.params.id);

    // Récupérer les nouvelles données du formulaire de modification
    const { nom, prenom, email, password, age, genre } = req.body;

    // Appeler le service pour mettre à jour l'employé
    await employeeService.update(employeeId, {
      nom,
      prenom,
      email,
      password, // Si vide, le service ne modifiera pas le mot de passe
      age,
      genre
    }, companyId);

    // Rediriger vers le dashboard avec un message de succès
    res.redirect('/dashboard?success=employee_updated');

  } catch (error) {
    // En cas d'erreur, logger et rediriger avec un message d'erreur
    console.error('Erreur lors de la modification de l\'employé:', error);
    res.redirect('/dashboard?error=employee_update_failed');
  }
};

/**
 * Supprimer un employé
 * Route: POST /employees/:id/delete
 */
exports.delete = async (req, res) => {
  try {
    // Récupérer l'ID de l'entreprise depuis la session
    const companyId = req.session.companyId;

    // Récupérer l'ID de l'employé depuis l'URL
    const employeeId = parseInt(req.params.id);

    // Appeler le service pour supprimer l'employé
    // L'ordinateur attribué sera automatiquement désattribué grâce à la relation onDelete: SetNull
    await employeeService.delete(employeeId, companyId);

    // Rediriger vers le dashboard avec un message de succès
    res.redirect('/dashboard?success=employee_deleted');

  } catch (error) {
    // En cas d'erreur, logger et rediriger avec un message d'erreur
    console.error('Erreur lors de la suppression de l\'employé:', error);
    res.redirect('/dashboard?error=employee_deletion_failed');
  }
};
