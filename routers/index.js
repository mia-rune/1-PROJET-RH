/**
 * Fichier de routes principal
 * Ce fichier définit toutes les routes (URL) de l'application
 * et les associe aux controllers et middlewares appropriés
 */

// Import d'Express pour créer le routeur
const express = require('express');
const router = express.Router();

// Import des controllers qui gèrent la logique des routes
const authController = require('../controllers/authController');
const employeeController = require('../controllers/employeeController');
const computerController = require('../controllers/computerController');

// Import des services pour la route dashboard
const employeeService = require('../services/employeeService');
const computerService = require('../services/computerService');

// Import des middlewares d'authentification
const { requireAuth, redirectIfAuth } = require('../middleware/auth');

/**
 * ROUTES PUBLIQUES (accessibles sans être connecté)
 */

// Page d'accueil - GET /
router.get('/', (req, res) => {
  // Afficher la page d'accueil
  res.render('pages/index', {
    title: 'ManageRH - Accueil',
    message: 'Application de gestion RH en cours de développement'
  });
});

// Page d'inscription - GET /register
// redirectIfAuth : si déjà connecté, redirige vers /dashboard
router.get('/register', redirectIfAuth, (req, res) => {
  res.render('pages/register');
});

// Traitement du formulaire d'inscription - POST /register
router.post('/register', authController.register);

// Page de connexion - GET /login
// redirectIfAuth : si déjà connecté, redirige vers /dashboard
router.get('/login', redirectIfAuth, (req, res) => {
  res.render('pages/login', {
    // Afficher un message de succès si l'inscription vient de réussir
    registered: req.query.registered === 'true'
  });
});

// Traitement du formulaire de connexion - POST /login
router.post('/login', authController.login);

/**
 * ROUTES PROTÉGÉES (nécessitent d'être connecté)
 */

// Page dashboard - GET /dashboard
// requireAuth : si non connecté, redirige vers /login
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    // Récupérer tous les employés de l'entreprise connectée
    const employees = await employeeService.getAllByCompany(req.session.companyId);

    // Récupérer tous les ordinateurs de l'entreprise connectée
    const computers = await computerService.getAllByCompany(req.session.companyId);

    // Afficher le dashboard avec toutes les données
    res.render('pages/dashboard', {
      raisonSociale: req.session.raisonSociale, // Nom de l'entreprise
      employees: employees, // Liste des employés
      computers: computers, // Liste des ordinateurs
      error: req.query.error, // Message d'erreur éventuel (ex: ?error=invalid_mac_address)
      success: req.query.success // Message de succès éventuel (ex: ?success=employee_created)
    });
  } catch (error) {
    // En cas d'erreur lors du chargement des données
    console.error('Erreur lors du chargement du dashboard:', error);

    // Afficher quand même le dashboard avec des listes vides
    res.render('pages/dashboard', {
      raisonSociale: req.session.raisonSociale,
      employees: [],
      computers: [],
      error: req.query.error,
      success: req.query.success
    });
  }
});

// Déconnexion - GET /logout
router.get('/logout', authController.logout);

/**
 * ROUTES EMPLOYÉS (protégées)
 */

// Créer un employé - POST /employees
router.post('/employees', requireAuth, employeeController.create);

// Modifier un employé - POST /employees/:id
// :id est un paramètre dynamique (ex: /employees/5)
router.post('/employees/:id', requireAuth, employeeController.update);

// Supprimer un employé - POST /employees/:id/delete
router.post('/employees/:id/delete', requireAuth, employeeController.delete);

/**
 * ROUTES ORDINATEURS (protégées)
 */

// Créer un ordinateur - POST /computers
router.post('/computers', requireAuth, computerController.create);

// Modifier un ordinateur - POST /computers/:id
// :id est un paramètre dynamique (ex: /computers/3)
router.post('/computers/:id', requireAuth, computerController.update);

// Supprimer un ordinateur - POST /computers/:id/delete
router.post('/computers/:id/delete', requireAuth, computerController.delete);

/**
 * ROUTE DE TEST
 */

// Route de test pour vérifier que le serveur fonctionne - GET /test
router.get('/test', (req, res) => {
  // Renvoyer un JSON avec des infos sur le serveur
  res.json({
    message: 'Serveur Express fonctionnel !',
    port: process.env.PORT,
    timestamp: new Date().toISOString()
  });
});

// Exporter le routeur pour l'utiliser dans server.js
module.exports = router;
