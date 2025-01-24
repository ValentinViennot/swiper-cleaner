import { Platform, StyleSheet } from 'react-native';
import { theme } from './theme';

const { spacing, radius, colors, shadow, layout, typography, opacity } = theme;

export const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    flex: 1,
    justifyContent: 'center',
    maxWidth: layout.bigButtonHeight,
    minWidth: layout.smallButtonHeight,
    ...shadow.base,
  },
  buttonDisabled: {
    backgroundColor: colors.textTertiary,
    opacity: opacity.high,
  },
  buttonText: {
    color: colors.textWhite,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  cardStyle: {
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    flex: 1,
    height: layout.windowHeight - layout.headerHeight - layout.bigButtonHeight,
    maxHeight: layout.windowHeight * 0.75,
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
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.base,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  completeText: {
    color: colors.primary,
    fontSize: typography.size.display,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.md,
  },
  confirmButton: {
    backgroundColor: colors.overlayNope,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  confirmButtonText: {
    color: colors.textWhite,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
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
    height: layout.headerHeight,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    width: '100%',
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    height: layout.headerHeight,
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
    maxWidth: '70%',
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
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
    marginTop: spacing.md,
  },
  mainContentContainer: {
    flex: 1,
    paddingBottom: spacing.xxxl * 2,
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
    fontSize: typography.size.hero,
    fontWeight: typography.weight.bold,
    letterSpacing: 2,
    opacity: opacity.overlay,
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
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
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
    flexShrink: 1,
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    marginRight: spacing.xs,
  },
});

export { layout };
