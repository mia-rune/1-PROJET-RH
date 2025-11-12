// Import du service d'authentification qui contient la logique métier
const authService = require('../services/authService');

/**
 * Inscription d'une nouvelle entreprise
 * Route: POST /register
 */
exports.register = async (req, res) => {
  try {
    // Récupérer les données du formulaire d'inscription
    const { raisonSociale, siret, password, directeur } = req.body;

    // VALIDATION 1: Vérifier le format du SIRET (doit être 14 chiffres)
    const siretRegex = /^[0-9]{14}$/;
    if (!siretRegex.test(siret)) {
      // Si invalide, ré-afficher le formulaire avec un message d'erreur
      return res.render('pages/register', {
        error: 'Le SIRET doit contenir exactement 14 chiffres.'
      });
    }

    // VALIDATION 2: Vérifier le format du mot de passe (min 8 caractères dont 1 chiffre)
    const passwordRegex = /^(?=.*[0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.render('pages/register', {
        error: 'Le mot de passe doit contenir au moins 8 caractères dont 1 chiffre.'
      });
    }

    // VALIDATION 3: Vérifier si le SIRET existe déjà en base
    const existingCompany = await authService.findCompanyBySiret(siret);

    if (existingCompany) {
      // Si le SIRET existe déjà, empêcher l'inscription
      return res.render('pages/register', {
        error: 'Ce numéro SIRET est déjà enregistré.'
      });
    }

    // Toutes les validations sont OK : créer l'entreprise
    await authService.createCompany({
      raisonSociale,
      siret,
      password, // Le service va hasher le mot de passe
      directeur
    });

    // Rediriger vers la page de connexion avec un paramètre de succès
    // Le paramètre "registered=true" affichera un message de confirmation
    res.redirect('/login?registered=true');

  } catch (error) {
    // En cas d'erreur inattendue, logger l'erreur et afficher un message générique
    console.error('Erreur lors de l\'inscription:', error);
    res.render('pages/register', {
      error: 'Une erreur est survenue lors de l\'inscription.'
    });
  }
};

/**
 * Connexion d'une entreprise
 * Route: POST /login
 */
exports.login = async (req, res) => {
  try {
    // Récupérer les identifiants du formulaire de connexion
    const { siret, password } = req.body;

    // Appeler le service pour authentifier l'entreprise
    const result = await authService.authenticateCompany(siret, password);

    // Si l'authentification échoue
    if (!result.success) {
      // Ré-afficher le formulaire avec le message d'erreur
      return res.render('pages/login', {
        error: result.error
      });
    }

    // Authentification réussie : créer la session utilisateur
    // req.session permet de stocker des données côté serveur pour cet utilisateur
    req.session.companyId = result.company.id; // Stocker l'ID de l'entreprise
    req.session.raisonSociale = result.company.raisonSociale; // Stocker la raison sociale

    // Rediriger vers le tableau de bord
    res.redirect('/dashboard');

  } catch (error) {
    // En cas d'erreur inattendue, logger et afficher un message d'erreur
    console.error('Erreur lors de la connexion:', error);
    res.render('pages/login', {
      error: 'Une erreur est survenue lors de la connexion.'
    });
  }
};

/**
 * Déconnexion d'une entreprise
 * Route: GET /logout
 */
exports.logout = (req, res) => {
  // Détruire la session de l'utilisateur
  req.session.destroy((err) => {
    if (err) {
      // Logger l'erreur mais continuer la déconnexion
      console.error('Erreur lors de la déconnexion:', err);
    }
    // Rediriger vers la page d'accueil
    res.redirect('/');
  });
};
