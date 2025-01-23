import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#2196F3',
  white: 'white',
  gray: '#cccccc',
  lightGray: '#999',
  border: '#ccc',
  text: '#333',
  danger: '#ff4444',
  warning: '#ff9800',
  switchTrackOff: '#767577',
  switchTrackOn: '#81b0ff',
  switchThumbOff: '#f4f3f4',
};

export const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginTop: 20,
    padding: 15,
  },
  buttonDisabled: {
    backgroundColor: colors.gray,
  },
  buttonGroup: {
    gap: 12,
    marginTop: 20,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 16,
    padding: 8,
  },
  cancelButtonText: {
    color: colors.lightGray,
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  container: {
    backgroundColor: colors.white,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    padding: 20,
    paddingBottom: 60,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  inlineInputContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    padding: 12,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: colors.danger,
    borderRadius: 8,
    marginTop: 12,
    padding: 15,
  },
  logoutButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  numberInput: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    padding: 8,
    textAlign: 'center',
    width: 50,
  },
  resetButton: {
    backgroundColor: colors.warning,
    borderRadius: 8,
    marginBottom: 24,
    padding: 15,
    width: '100%',
  },
  resetButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  toggleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  footerLink: {
    color: colors.lightGray,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  footerDivider: {
    color: colors.lightGray,
    fontSize: 12,
  },
});
