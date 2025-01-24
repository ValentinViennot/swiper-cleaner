import { Platform, StyleSheet } from 'react-native';
import { theme } from './theme';

const { spacing, radius, colors, shadow, layout } = theme;

export const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    flex: 1,
    justifyContent: 'center',
    maxWidth: 56,
    minWidth: 48,
    ...shadow.base,
  },
  buttonDisabled: {
    backgroundColor: colors.textTertiary,
    opacity: 0.5,
  },
  buttonText: {
    color: colors.textWhite,
    fontSize: 24,
    fontWeight: '600',
  },
  buttonsContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    bottom: spacing.xl,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    left: spacing.xl,
    position: 'absolute',
    right: spacing.xl,
  },
  cardContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginTop: -spacing.md,
    paddingHorizontal: spacing.lg,
  },
  cardStyle: {
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    height: layout.windowHeight * 0.75,
    width: layout.windowWidth - spacing.xl * 2,
    ...shadow.base,
  },
  completeContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  completeSubtext: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  completeText: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  confirmButton: {
    backgroundColor: colors.overlayNope,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  confirmButtonText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  donateButton: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderRadius: radius.full,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadow.light,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flexDirection: 'row',
    height: 44,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    width: '100%',
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 44,
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'ios' ? 0 : 4,
    paddingHorizontal: spacing.lg,
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
    marginTop: spacing.md,
  },
  overlayHidden: {
    display: 'none',
  },
  overlayLabelAlignment: {
    alignItems: 'center',
    backgroundColor: colors.overlayDark,
    justifyContent: 'center',
  },
  overlayLabelContainer: {
    borderRadius: radius.lg,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  overlayText: {
    color: colors.textWhite,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 2,
    opacity: 0.95,
    textTransform: 'uppercase',
  },
  refreshButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.light,
  },
  refreshButtonText: {
    color: colors.textWhite,
    fontSize: 18,
    fontWeight: '600',
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  settingsIcon: {
    opacity: 0.7,
  },
  subContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginBottom: 80,
    paddingHorizontal: spacing.lg,
  },
  userInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.sm,
  },
  userInfoText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
});

export { layout };
