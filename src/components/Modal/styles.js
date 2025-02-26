// src/components/Modal/styles.js - Updated with lighter color
import {Dimensions} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const COLORS = {
  // Lighter version of #FF9500
  primary: '#FFC069',
  white: '#ffffff',
  separator: 'rgba(255,255,255,0.1)',
  indicator: 'rgba(255, 149, 0, 0.5)',
};

export const COMMON_STYLES = {
  sectionContent: {
    flexDirection: 'row',
    height: 130,
  },
  displaySide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.separator,
  },
  pickerSide: {
    flex: 1,
    justifyContent: 'center',
  },
  pickerItem: {
    fontSize: 20,
    color: COLORS.white,
  },
};

export const DIMENSIONS = {
  screenWidth: SCREEN_WIDTH,
  pickerWidth: '50%',
  pickerHeight: '100%',
};
