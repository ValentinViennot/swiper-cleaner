import { StyleSheet } from 'react-native';
import { theme } from './theme';

const { spacing, radius, colors, shadow } = theme;

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
    flex: 1,
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
    borderRadius: radius.lg,
    flex: 1,
    marginVertical: spacing.md,
    minHeight: 0,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  linkText: {
    color: colors.secondary,
    textDecorationLine: 'none',
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
    marginTop: 'auto',
    paddingTop: spacing.md,
  },
  postImage: {
    bottom: 0,
    height: '100%',
    left: 0,
    position: 'absolute',
    resizeMode: 'cover',
    right: 0,
    top: 0,
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
    marginVertical: spacing.md,
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
