import { useEffect, useState, type ReactNode } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, View, type StyleProp, type ViewStyle } from 'react-native';

/** Height of the on-screen keyboard (0 when hidden). */
export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', (e) => setHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return height;
}

/**
 * Keeps content above the keyboard. Android apps are edge-to-edge, so the window does not
 * resize when the keyboard opens; we pad the container by the keyboard height instead.
 */
export function KeyboardSafe({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const keyboard = useKeyboardHeight();
  if (Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView style={style} behavior="padding">
        {children}
      </KeyboardAvoidingView>
    );
  }
  return <View style={[style, { paddingBottom: keyboard }]}>{children}</View>;
}
