// src/styles/fonts.js
import {Platform} from 'react-native';

// Get appropriate font family based on platform and language
export const getFontFamily = language => {
  // If you manually include these fonts in your project later,
  // you can uncomment and use this more specific code

  /*
  switch (language) {
    case 'zh':
      return {
        regular: 'NotoSansSC-Regular',
        medium: 'NotoSansSC-Medium',
        bold: 'NotoSansSC-Bold',
      };
    case 'ko':
      return {
        regular: 'NotoSansKR-Regular',
        medium: 'NotoSansKR-Medium',
        bold: 'NotoSansKR-Bold',
      };
    case 'es':
    case 'en':
    default:
      return {
        regular: 'NotoSans-Regular',
        medium: 'NotoSans-Medium',
        bold: 'NotoSans-Bold',
      };
  }
  */

  // For now, use system fonts
  if (Platform.OS === 'ios') {
    return {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    };
  } else {
    return {
      regular: 'Roboto',
      medium: 'Roboto-Medium',
      bold: 'Roboto-Bold',
    };
  }
};

// Text styles adjusted for each language
export const getTextStyle = (style, language) => {
  const fontFamily = getFontFamily(language);

  // Base styles
  const styles = {
    // Headers
    h1: {
      fontFamily: fontFamily.bold,
      fontSize: 32,
      lineHeight: 40,
      fontWeight: 'bold',
    },
    h2: {
      fontFamily: fontFamily.bold,
      fontSize: 24,
      lineHeight: 32,
      fontWeight: 'bold',
    },
    h3: {
      fontFamily: fontFamily.bold,
      fontSize: 20,
      lineHeight: 28,
      fontWeight: 'bold',
    },

    // Body text
    body1: {
      fontFamily: fontFamily.regular,
      fontSize: 16,
      lineHeight: 24,
    },
    body2: {
      fontFamily: fontFamily.regular,
      fontSize: 14,
      lineHeight: 20,
    },

    // Button text
    button: {
      fontFamily: fontFamily.medium,
      fontSize: 16,
      fontWeight: '600',
    },

    // Smaller text
    caption: {
      fontFamily: fontFamily.regular,
      fontSize: 12,
      lineHeight: 16,
    },
  };

  // Language-specific adjustments
  if (language === 'zh') {
    // Chinese typically needs more line height
    styles.body1.lineHeight = 26;
    styles.body2.lineHeight = 22;
  } else if (language === 'ko') {
    // Korean might need slight adjustments
    styles.body1.lineHeight = 25;
  }

  return styles[style] || styles.body1;
};
