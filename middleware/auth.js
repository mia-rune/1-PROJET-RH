/**
 * Middleware d'authentification
 * Les middlewares sont des fonctions qui s'exécutent AVANT les routes
 * Ils permettent de vérifier des conditions (ex: utilisateur connecté ou non)
 */

/**
 * requireAuth - Protéger les routes privées
 * Ce middleware vérifie si l'utilisateur est connecté
 * S'il ne l'est pas, il le redirige vers /login
 *
 * Utilisation: router.get('/dashboard', requireAuth, ...)
 *
 * @param {Object} req - L'objet requête Express
 * @param {Object} res - L'objet réponse Express
 * @param {Function} next - Fonction pour passer au middleware suivant
 */
exports.requireAuth = (req, res, next) => {
  // Vérifier si companyId existe dans la session
  if (!req.session.companyId) {
    // Si pas de session = utilisateur non connecté
    // Rediriger vers la page de connexion
    return res.redirect('/login');
  }

  // Si la session existe, passer au middleware suivant (ou à la route)
  next();
};

/**
 * redirectIfAuth - Empêcher l'accès aux pages de connexion/inscription si déjà connecté
 * Ce middleware redirige vers le dashboard si l'utilisateur est déjà connecté
 *
 * Utilisation: router.get('/login', redirectIfAuth, ...)
 *
 * @param {Object} req - L'objet requête Express
 * @param {Object} res - L'objet réponse Express
 * @param {Function} next - Fonction pour passer au middleware suivant
 */
exports.redirectIfAuth = (req, res, next) => {
  // Vérifier si companyId existe dans la session
  if (req.session.companyId) {
    // Si la session existe = utilisateur déjà connecté
    // Le rediriger vers le dashboard au lieu d'afficher login/register
    return res.redirect('/dashboard');
  }

  // Si pas de session, laisser l'utilisateur accéder à login/register
  next();
};
