const express = require('express');
require('dotenv').config(); //process.env.NOMDELAVARIABLE pour appeler une variable
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT;

// Configuration Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration des sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret-key-default',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true en production avec HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
}));

// Configuration Twig
app.set('view engine', 'twig');
app.set('views', path.join(__dirname, 'views'));

// Désactiver le cache Twig en développement
app.set('twig options', {
  autoescape: true,
  cache: false, // Désactive le cache en développement
  strict_variables: false
});

// Fichiers statiques (CSS, JS, images)
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
const indexRouter = require('./routers/index');
app.use('/', indexRouter);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarre sur http://localhost:${PORT}`);
  console.log(`Page de test: http://localhost:${PORT}/test`);
});