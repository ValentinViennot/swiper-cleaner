import { StyleSheet } from 'react-native';
import { theme } from './theme';

const { colors, spacing, radius, shadow, layout, typography } = theme;

export const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    height: layout.headerHeight,
    paddingHorizontal: spacing.lg,
  },
  backButtonText: {
    color: colors.textSecondary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.normal,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: layout.buttonHeight,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.textTertiary,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
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
    fontSize: typography.size.xs,
  },
  footerLink: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,
    textDecorationLine: 'underline',
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  helperText: {
    color: colors.textTertiary,
    fontSize: typography.size.sm,
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
    fontSize: typography.size.md,
    height: layout.headerHeight,
    paddingHorizontal: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textPrimary,
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    marginBottom: spacing.xs,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    height: layout.smallButtonHeight,
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  logoutButtonText: {
    color: colors.white,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
  },
  picker: {
    backgroundColor: colors.transparent,
    color: colors.textPrimary,
    height: layout.headerHeight,
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
    fontSize: typography.size.md,
    height: layout.headerHeight,
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
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: spacing.xs,
    height: layout.smallButtonHeight,
    justifyContent: 'center',
    marginRight: spacing.lg,
    paddingHorizontal: spacing.lg,
    ...shadow.light,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    letterSpacing: -0.2,
  },
  settingsGroup: {
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.medium,
    marginBottom: spacing.xl,
  },
  toggleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    height: layout.headerHeight,
    justifyContent: 'space-between',
  },
  toggleLabel: {
    flex: 1,
    marginRight: spacing.lg,
  },
  unitText: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
  },
});
