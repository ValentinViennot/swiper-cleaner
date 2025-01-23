import { StyleSheet, Dimensions } from 'react-native';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

const colors = {
  primary: '#2196F3',
  secondary: '#3A3D45',
  danger: '#ff4444',
  text: {
    primary: '#000',
    secondary: '#666',
    tertiary: '#999',
    light: '#8E8E93',
    dark: '#2C2C2C',
  },
  border: '#E5E5E5',
  white: 'white',
  black: 'black',
  transparent: 'transparent',
};

export const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: colors.secondary,
    borderRadius: 40,
    elevation: 4,
    height: 50,
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    alignItems: 'center',
    bottom: 42,
    flexDirection: 'row',
    gap: 24,
    justifyContent: 'center',
  },
  cardStyle: {
    borderRadius: 15,
    height: '75%',
    marginVertical: 20,
    width: '95%',
  },
  completeContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  completeSubtext: {
    color: colors.text.secondary,
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  completeText: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  confirmButton: {
    backgroundColor: colors.danger,
    borderRadius: 20,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
    top: 50,
    zIndex: 1,
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    right: 16,
    top: 50,
    zIndex: 1,
  },
  hiddenStatText: {
    color: colors.transparent,
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.text.secondary,
    fontSize: 16,
    marginTop: 12,
  },
  overlayLabelAlignment: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayLabelContainer: {
    borderRadius: 15,
    height: '100%',
    width: '100%',
  },
  overlayText: {
    color: colors.white,
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  refreshButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  refreshButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  settingsIcon: {
    marginLeft: 6,
  },
  subContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  userInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  userInfoText: {
    color: colors.text.tertiary,
    fontSize: 13,
    fontWeight: '400',
  },
  donateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    position: 'absolute',
    left: 16,
    top: 50,
    zIndex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  donateButtonText: {
    color: colors.text.dark,
    fontSize: 12,
    fontWeight: '500',
  },
});

export { windowWidth, windowHeight };
