// Translation dictionary for UI elements
export const translations = {
  en: {
    // Navbar
    'Social Media': 'Social Media',
    'Logout': 'Logout',
    
    // Navigation
    'Navigation': 'Navigation',
    'Home': 'Home',
    'My Profile': 'My Profile',
    'Create Post': 'Create Post',
    'Explore': 'Explore',
    'Settings': 'Settings',
    
    // Actions
    'Actions': 'Actions',
    'Create a Post': 'Create a Post',
    'Post title...': 'Post title...',
    'Write your news or information...': 'Write your news or information...',
    'Click to upload image or video': 'Click to upload image or video',
    'Max file size: 10MB': 'Max file size: 10MB',
    'Post': 'Post',
    
    // Feed
    'Feed': 'Feed',
    'just now': 'just now',
    'Show Original': 'Show Original',
    'Translating...': 'Translating...',
    'Add a comment...': 'Add a comment...',
    'Comment': 'Comment',
    'Comments': 'Comments',
    'No comments yet. Be the first to comment!': 'No comments yet. Be the first to comment!',
    
    // Profile
    'Back to Home': 'Back to Home',
    'Posts': 'Posts',
    "You haven't created any posts yet.": "You haven't created any posts yet.",
    'Start sharing your thoughts with the community!': 'Start sharing your thoughts with the community!',
    
    // Time
    'minute': 'minute',
    'minutes': 'minutes',
    'hour': 'hour',
    'hours': 'hours',
    'day': 'day',
    'days': 'days',
    'month': 'month',
    'months': 'months',
    'year': 'year',
    'years': 'years',
    'ago': 'ago'
  },
  
  hi: {
    // Navbar
    'Social Media': 'सोशल मीडिया',
    'Logout': 'लॉगआउट',
    
    // Navigation
    'Navigation': 'नेविगेशन',
    'Home': 'होम',
    'My Profile': 'मेरी प्रोफ़ाइल',
    'Create Post': 'पोस्ट बनाएं',
    'Explore': 'एक्सप्लोर',
    'Settings': 'सेटिंग्स',
    
    // Actions
    'Actions': 'क्रियाएं',
    'Create a Post': 'पोस्ट बनाएं',
    'Post title...': 'पोस्ट शीर्षक...',
    'Write your news or information...': 'अपनी खबर या जानकारी लिखें...',
    'Click to upload image or video': 'छवि या वीडियो अपलोड करने के लिए क्लिक करें',
    'Max file size: 10MB': 'अधिकतम फ़ाइल आकार: 10MB',
    'Post': 'पोस्ट करें',
    
    // Feed
    'Feed': 'फ़ीड',
    'just now': 'अभी',
    'Show Original': 'मूल दिखाएं',
    'Translating...': 'अनुवाद हो रहा है...',
    'Add a comment...': 'टिप्पणी जोड़ें...',
    'Comment': 'टिप्पणी',
    'Comments': 'टिप्पणियां',
    'No comments yet. Be the first to comment!': 'अभी तक कोई टिप्पणी नहीं। पहले टिप्पणी करें!',
    
    // Profile
    'Back to Home': 'होम पर वापस जाएं',
    'Posts': 'पोस्ट',
    "You haven't created any posts yet.": "आपने अभी तक कोई पोस्ट नहीं बनाई है।",
    'Start sharing your thoughts with the community!': 'समुदाय के साथ अपने विचार साझा करना शुरू करें!',
    
    // Time
    'minute': 'मिनट',
    'minutes': 'मिनट',
    'hour': 'घंटा',
    'hours': 'घंटे',
    'day': 'दिन',
    'days': 'दिन',
    'month': 'महीना',
    'months': 'महीने',
    'year': 'साल',
    'years': 'साल',
    'ago': 'पहले'
  },
  
  es: {
    'Social Media': 'Redes Sociales',
    'Logout': 'Cerrar Sesión',
    'Navigation': 'Navegación',
    'Home': 'Inicio',
    'My Profile': 'Mi Perfil',
    'Create Post': 'Crear Publicación',
    'Feed': 'Feed',
    'Actions': 'Acciones',
    'Post': 'Publicar',
    'Comment': 'Comentar',
    'Comments': 'Comentarios'
  },
  
  fr: {
    'Social Media': 'Médias Sociaux',
    'Logout': 'Déconnexion',
    'Navigation': 'Navigation',
    'Home': 'Accueil',
    'My Profile': 'Mon Profil',
    'Create Post': 'Créer une Publication',
    'Feed': 'Fil',
    'Actions': 'Actions',
    'Post': 'Publier',
    'Comment': 'Commenter',
    'Comments': 'Commentaires'
  }
};

// Translation helper function
export const t = (key, lang = 'en') => {
  return translations[lang]?.[key] || translations['en'][key] || key;
};
