/**
 * JAVASCRIPT POUR LA PAGE DASHBOARD
 * Ce fichier gère toutes les interactions côté client sur le dashboard
 * - Ouverture/fermeture des modales
 * - Remplissage automatique des formulaires de modification
 * - Validation des formulaires
 */

/**
 * DONNÉES GLOBALES
 * Ces variables sont définies dans dashboard.twig via json_encode
 * et contiennent les listes d'employés et d'ordinateurs
 */
// employeesData et computersData sont définis dans dashboard.twig

/**
 * ==============================================
 * GESTION DES MODALES - EMPLOYÉS
 * ==============================================
 */

/**
 * Ouvrir le modal d'ajout d'employé
 */
const btnAddEmployee = document.getElementById('btn-add-employee');
const modalAddEmployee = document.getElementById('modal-add-employee');

// Si le bouton existe (vérification de sécurité)
if (btnAddEmployee) {
  // Ajouter un écouteur d'événement sur le clic
  btnAddEmployee.addEventListener('click', () => {
    // Ajouter la classe 'modal-open' pour afficher le modal
    modalAddEmployee.classList.add('modal-open');
  });
}

/**
 * Fermer toutes les modales
 * Fonctionne pour les boutons de fermeture (X) et les boutons "Annuler"
 */
const modalCloses = document.querySelectorAll('.modal-close, .modal-cancel');

// Pour chaque bouton de fermeture trouvé
modalCloses.forEach(btn => {
  btn.addEventListener('click', () => {
    // Trouver le modal parent le plus proche
    const modal = btn.closest('.modal');

    if (modal) {
      // Retirer la classe 'modal-open' pour cacher le modal
      modal.classList.remove('modal-open');
    }
  });
});

/**
 * Fermer le modal en cliquant en dehors (sur le fond sombre)
 */
window.addEventListener('click', (e) => {
  // Si on clique sur le fond du modal (pas sur le contenu)
  if (e.target.classList.contains('modal')) {
    // Fermer le modal
    e.target.classList.remove('modal-open');
  }
});

/**
 * Gestion de la modification d'employé
 * Lorsqu'on clique sur le bouton "Modifier" d'un employé
 */
const modalEditEmployee = document.getElementById('modal-edit-employee');
const formEditEmployee = document.getElementById('form-edit-employee');
const btnsEditEmployee = document.querySelectorAll('.btn-edit'); // Tous les boutons "Modifier" d'employés

// Pour chaque bouton "Modifier" d'employé
btnsEditEmployee.forEach(btn => {
  btn.addEventListener('click', () => {
    // Récupérer l'ID de l'employé depuis l'attribut data-employee-id
    const employeeId = parseInt(btn.getAttribute('data-employee-id'));

    // Trouver l'employé correspondant dans le tableau employeesData
    const employee = employeesData.find(emp => emp.id === employeeId);

    if (employee) {
      // PRÉ-REMPLIR LE FORMULAIRE avec les données de l'employé
      document.getElementById('edit-employee-id').value = employee.id;
      document.getElementById('edit-nom').value = employee.nom;
      document.getElementById('edit-prenom').value = employee.prenom;
      document.getElementById('edit-email').value = employee.email;
      document.getElementById('edit-age').value = employee.age || ''; // Vide si null
      document.getElementById('edit-genre').value = employee.genre || ''; // Vide si null
      document.getElementById('edit-password').value = ''; // Toujours vide (pour changer le mot de passe uniquement si rempli)

      // Modifier l'action du formulaire pour cibler le bon employé
      // Ex: /employees/5
      formEditEmployee.action = `/employees/${employee.id}`;

      // Ouvrir le modal de modification
      modalEditEmployee.classList.add('modal-open');
    }
  });
});

/**
 * ==============================================
 * GESTION DES MODALES - ORDINATEURS
 * ==============================================
 */

/**
 * Ouvrir le modal d'ajout d'ordinateur
 */
const btnAddComputer = document.getElementById('btn-add-computer');
const modalAddComputer = document.getElementById('modal-add-computer');

if (btnAddComputer) {
  btnAddComputer.addEventListener('click', () => {
    modalAddComputer.classList.add('modal-open');
  });
}

/**
 * Gestion de la modification d'ordinateur
 * Lorsqu'on clique sur le bouton "Modifier" d'un ordinateur
 */
const modalEditComputer = document.getElementById('modal-edit-computer');
const formEditComputer = document.getElementById('form-edit-computer');
const btnsEditComputer = document.querySelectorAll('.btn-edit-computer'); // Tous les boutons "Modifier" d'ordinateurs

// Pour chaque bouton "Modifier" d'ordinateur
btnsEditComputer.forEach(btn => {
  btn.addEventListener('click', () => {
    // Récupérer l'ID de l'ordinateur depuis l'attribut data-computer-id
    const computerId = parseInt(btn.getAttribute('data-computer-id'));

    // Trouver l'ordinateur correspondant dans le tableau computersData
    const computer = computersData.find(comp => comp.id === computerId);

    if (computer) {
      // PRÉ-REMPLIR LE FORMULAIRE avec les données de l'ordinateur
      document.getElementById('edit-computer-id').value = computer.id;
      document.getElementById('edit-macAddress').value = computer.macAddress;
      document.getElementById('edit-employeeId').value = computer.employeeId || ''; // Vide si non attribué
      document.getElementById('edit-statut').value = computer.statut || 'disponible'; // Par défaut : disponible

      // Modifier l'action du formulaire pour cibler le bon ordinateur
      // Ex: /computers/3
      formEditComputer.action = `/computers/${computer.id}`;

      // Ouvrir le modal de modification
      modalEditComputer.classList.add('modal-open');
    }
  });
});

/**
 * ==============================================
 * VALIDATION DU FORMULAIRE DE MODIFICATION D'ORDINATEUR
 * ==============================================
 */

/**
 * Vérifier la cohérence entre le statut et l'employé attribué
 * Si le statut est "attribué", un employé doit être sélectionné
 */
formEditComputer.addEventListener('submit', (e) => {
  // Récupérer les valeurs du formulaire
  const statut = document.getElementById('edit-statut').value;
  const employeeId = document.getElementById('edit-employeeId').value;

  // VALIDATION: Si le statut est "attribué" mais qu'aucun employé n'est sélectionné
  if (statut === 'attribué' && !employeeId) {
    // Empêcher la soumission du formulaire
    e.preventDefault();

    // Afficher un message d'alerte
    alert('Vous devez sélectionner un employé lorsque le statut est "attribué".');

    // Arrêter l'exécution
    return false;
  }

  // Si tout est OK, le formulaire sera soumis normalement
});
