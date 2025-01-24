import { StyleSheet, Platform, StatusBar } from 'react-native';
import { theme } from './theme';

const { colors, spacing, radius, shadow } = theme;

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 47 : StatusBar.currentHeight || 0;

export const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    height: 44,
    paddingHorizontal: spacing.lg,
  },
  backButtonText: {
    color: colors.textSecondary,
    fontSize: 17,
    fontWeight: '500',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.textTertiary,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: colors.background,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 999,
  },
  content: {
    backgroundColor: colors.background,
    flex: 1,
    padding: spacing.xl,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    marginTop: 'auto',
    paddingVertical: spacing.xl,
  },
  footerDivider: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  footerLink: {
    color: colors.textSecondary,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flexDirection: 'row',
    height: STATUSBAR_HEIGHT + 44,
    justifyContent: 'space-between',
    paddingTop: STATUSBAR_HEIGHT,
  },
  helperText: {
    color: colors.textTertiary,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  inlineInputContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 15,
    height: 44,
    paddingHorizontal: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  logoutButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  picker: {
    backgroundColor: colors.transparent,
    color: colors.textPrimary,
    height: 44,
    width: 120,
  },
  pickerContainer: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    width: 120,
  },
  pickerItem: {
    color: colors.textPrimary,
    fontSize: 15,
    height: 44,
  },
  resetButton: {
    alignItems: 'center',
    backgroundColor: colors.warning,
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  resetButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: spacing.xs,
    height: 36,
    justifyContent: 'center',
    marginRight: spacing.lg,
    paddingHorizontal: spacing.lg,
    ...shadow.light,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  settingsGroup: {
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '600',
    marginBottom: spacing.xl,
  },
  toggleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 44,
    justifyContent: 'space-between',
  },
  toggleLabel: {
    flex: 1,
    marginRight: spacing.lg,
  },
  unitText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
});
