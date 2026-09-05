
export const isPermissionDeniedError = (err: any): boolean => {
  if (!err) return false;
  const name = err.name || '';
  const message = err.message || '';
  return (
    name === 'NotAllowedError' || 
    name === 'PermissionDeniedError' || 
    message.toLowerCase().includes('denied') ||
    message.toLowerCase().includes('allowed')
  );
};

export const getMicErrorMessage = (err: any): string => {
  if (isPermissionDeniedError(err)) {
    return "L'accès au microphone est bloqué.\n\n" +
           "1. Assurez-vous d'utiliser une connexion sécurisée (HTTPS) ou localhost.\n" +
           "2. Cliquez sur le cadenas 🔒 (ou l'icône de réglages) à gauche de la barre d'adresse et autorisez le 'Microphone'.\n" +
           "3. Actualisez la page.\n\n" +
           "Si vous êtes dans une iframe, assurez-vous que l'attribut allow=\"microphone\" est présent. Sinon, ouvrez l'application dans un nouvel onglet.";
  }
  return "Impossible d'accéder au microphone. Vérifiez que votre micro est bien branché, que vous utilisez une connexion HTTPS, et qu'il n'est pas utilisé par une autre application.";
};

export const getGeoErrorMessage = (state: PermissionState | 'unknown'): string => {
  if (state === 'denied') {
    return "L'accès à votre position est bloqué.\n\n" +
           "1. Cliquez sur le cadenas 🔒 à gauche de la barre d'adresse.\n" +
           "2. Activez l'autorisation pour la 'Localisation'.\n" +
           "3. Rechargez la page.\n\n" +
           "Sans votre position, les secours ne pourront pas vous localiser précisément.";
  }
  return "Une erreur est survenue lors de la recherche de votre position.";
};
