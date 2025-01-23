import React from 'react';
import { TouchableOpacity, type TouchableOpacityProps } from 'react-native';

type ActionButtonProps = TouchableOpacityProps & {
  onTap?: () => void;
};

const ActionButton = React.memo(({ onTap, style, children, ...rest }: ActionButtonProps) => {
  return (
    <TouchableOpacity onPress={onTap} {...rest} style={style}>
      {children}
    </TouchableOpacity>
  );
});

ActionButton.displayName = 'ActionButton';

export default ActionButton;
