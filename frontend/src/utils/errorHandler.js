/**
 * Analyse et formate les erreurs d'API Axios en français.
 * @param {any} error - L'objet d'erreur capturé (généralement une erreur Axios)
 * @returns {string} Le message d'erreur formaté et lisible par l'utilisateur
 */
export const getErrorMessage = (error) => {
  if (!error) return "Une erreur inconnue est survenue.";

  // Si l'erreur est déjà une chaîne de caractères
  if (typeof error === 'string') return error;

  // Erreur réseau ou pas de réponse du serveur
  if (error.message === 'Network Error' || !error.response) {
    return "Impossible de contacter le serveur. Veuillez vérifier votre connexion internet.";
  }

  const { status, data } = error.response;

  // Extraction des messages d'erreur de Django REST Framework
  if (data && typeof data === 'object') {
    // Si c'est un tableau de messages généraux
    if (Array.isArray(data)) {
      return data.join(' ');
    }
    
    // Si l'erreur contient un détail de DRF direct
    if (data.detail && typeof data.detail === 'string') {
      return data.detail;
    }

    // Si l'erreur contient une erreur directe
    if (data.error && typeof data.error === 'string') {
      return data.error;
    }

    // Gestion des erreurs par champ (ex: { email: ["Cet email est déjà utilisé."] })
    const fieldErrors = [];
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        
        // Traduction des champs courants en français pour un meilleur rendu
        const fieldName = {
          email: 'Email',
          username: 'Identifiant',
          password: 'Mot de passe',
          nom: 'Nom',
          prenom: 'Prénom',
          telephone: 'Téléphone',
          adresse: 'Adresse',
          poste: 'Poste',
          department: 'Département',
          start_date: 'Date de début',
          end_date: 'Date de fin',
          reason: 'Motif',
          description: 'Description',
        }[key] || key;

        if (Array.isArray(value)) {
          fieldErrors.push(`${fieldName} : ${value.join(' ')}`);
        } else if (typeof value === 'string') {
          fieldErrors.push(`${fieldName} : ${value}`);
        }
      }
    }

    if (fieldErrors.length > 0) {
      return fieldErrors.join(' | ');
    }
  }

  // Codes HTTP standard
  switch (status) {
    case 400:
      return "Requête invalide. Veuillez vérifier vos données.";
    case 401:
      return "Session expirée ou identifiants incorrects.";
    case 403:
      return "Vous n'avez pas l'autorisation d'effectuer cette action.";
    case 404:
      return "La ressource demandée est introuvable.";
    case 500:
      return "Erreur interne du serveur. Veuillez réessayer plus tard.";
    default:
      return `Une erreur serveur est survenue (Code ${status}).`;
  }
};

export default getErrorMessage;
