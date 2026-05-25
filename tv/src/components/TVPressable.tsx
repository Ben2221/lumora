import React, { useState } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle, View } from 'react-native';

interface TVPressableProps extends Omit<PressableProps, 'style' | 'children'> {
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean; focused: boolean }) => StyleProp<ViewStyle>);
  children?: React.ReactNode | ((state: { pressed: boolean; focused: boolean }) => React.ReactNode);
}

export const TVPressable = React.forwardRef<View, TVPressableProps>(
  ({ style, children, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <Pressable
        ref={ref}
        focusable={true}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        style={(state: any) => {
          const resolvedStyle = typeof style === 'function'
            ? style({ ...state, focused: isFocused })
            : style;
          return resolvedStyle;
        }}
        {...props}
      >
        {(state: any) => {
          const resolvedChildren = typeof children === 'function'
            ? children({ ...state, focused: isFocused })
            : children;
          return resolvedChildren;
        }}
      </Pressable>
    );
  }
);
