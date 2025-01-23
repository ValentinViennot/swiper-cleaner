import React from 'react';
import { TouchableOpacity, type TouchableOpacityProps } from 'react-native';

type ActionButtonProps = TouchableOpacityProps & {
  onTap?: () => void;
};

const ActionButton = React.memo(
  ({ onTap, style, children, ...rest }: ActionButtonProps) => {
    return (
      <TouchableOpacity onPress={onTap} {...rest} style={style}>
        {children}
      </TouchableOpacity>
    );
  }
);

export default ActionButton;
