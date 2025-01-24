import React from 'react';
import { styles } from '../styles/app.styles';
import { Text, View } from 'react-native';

const OverlayLabel = React.memo(({ text, color }: { text: string; color: string }) => (
  <View
    style={[
      styles.overlayLabelContainer,
      styles.overlayLabelAlignment,
      { backgroundColor: color },
    ]}>
    <Text style={styles.overlayText}>{text}</Text>
  </View>
));
OverlayLabel.displayName = 'OverlayLabel';

export default OverlayLabel;
