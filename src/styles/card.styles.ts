import { StyleSheet } from 'react-native';

const colors = {
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
};

export const cardStyles = StyleSheet.create({
  authorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  authorInfo: {
    marginLeft: 12,
  },
  avatar: {
    borderRadius: 22,
    height: 44,
    width: 44,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    overflow: 'hidden',
    display: 'flex',
  },
  dateText: {
    color: colors.text.light,
    fontSize: 14,
  },
  displayName: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  handle: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  imageContainer: {
    borderRadius: 8,
    marginVertical: 8,
    overflow: 'hidden',
    position: 'relative',
    flex: 1,
    minHeight: 0,
    width: '100%',
  },
  postFooter: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 12,
  },
  postImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  postText: {
    color: colors.text.dark,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  renderCardContainer: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 15,
    borderWidth: 1,
    elevation: 3,
    flex: 1,
    height: '75%',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  statText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  repostIndicator: {
    color: colors.text.tertiary,
    fontSize: 13,
    position: 'absolute',
    right: 16,
    top: 16,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  linkText: {
    textDecorationLine: 'none',
  },
  quoteContainer: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 8,
    overflow: 'hidden',
    padding: 12,
  },
  quoteAuthorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  quoteAuthorAvatar: {
    borderRadius: 16,
    height: 32,
    width: 32,
  },
  quoteAuthorInfo: {
    marginLeft: 8,
  },
  quoteDisplayName: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  quoteHandle: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  quoteText: {
    color: colors.text.dark,
    fontSize: 14,
    lineHeight: 18,
  },
});
