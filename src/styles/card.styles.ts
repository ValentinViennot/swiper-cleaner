import { StyleSheet } from 'react-native';
import { theme } from './theme';

const { spacing, radius, colors } = theme;

export const cardStyles = StyleSheet.create({
  authorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  authorInfo: {
    marginLeft: spacing.md,
  },
  avatar: {
    borderRadius: radius.full,
    height: 44,
    width: 44,
  },
  cardContent: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    padding: spacing.lg,
  },
  dateText: {
    color: colors.textTertiary,
    fontSize: 14,
  },
  displayName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  handle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  imageContainer: {
    alignItems: 'center',
    borderRadius: radius.lg,
    flexShrink: 1,
    flex: 1,
    justifyContent: 'center',
    marginVertical: spacing.md,
    minHeight: 200,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  linkText: {
    color: colors.secondary,
    textDecorationLine: 'none',
  },
  mediaCounter: {
    backgroundColor: colors.overlayDark,
    borderRadius: radius.md,
    bottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    position: 'absolute',
    right: spacing.sm,
  },
  mediaCounterText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  overlayLabelContainer: {
    borderRadius: radius.xl,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  postFooter: {
    alignItems: 'flex-start',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  postImage: {
    flex: 1,
    height: '100%',
    minHeight: 150,
    width: '100%',
  },
  postText: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  quoteAuthorAvatar: {
    borderRadius: radius.sm,
    height: 32,
    width: 32,
  },
  quoteAuthorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  quoteAuthorInfo: {
    marginLeft: spacing.sm,
  },
  quoteContainer: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    display: 'flex',
    flex: 1,
    marginVertical: spacing.md,
    minHeight: 0,
    overflow: 'hidden',
    padding: spacing.md,
  },
  quoteDisplayName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  quoteHandle: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  quoteText: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 18,
  },
  renderCardContainer: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    display: 'flex',
    height: '100%',
    marginBottom: spacing.xl,
    overflow: 'hidden',
    width: '100%',
  },
  repostIndicator: {
    color: colors.textTertiary,
    fontSize: 13,
    position: 'absolute',
    right: spacing.lg,
    top: spacing.lg,
  },
  scrollableContent: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  statText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  statsContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  videoOverlay: {
    alignItems: 'center',
    backgroundColor: colors.overlayDark,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
