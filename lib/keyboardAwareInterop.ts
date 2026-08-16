import { cssInterop } from 'nativewind';
import { KeyboardAwareScrollView, KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';

/**
 * NativeWind only wires up `className` for React Native's own core components
 * out of the box (see react-native-css-interop's components.js) — third-party
 * components like these need to opt in explicitly via cssInterop, mirroring
 * exactly how NativeWind registers the built-in ScrollView/FlatList
 * (className -> style, contentContainerClassName -> contentContainerStyle).
 * Imported once for its side effect from the root layout, before anything
 * using these components renders.
 */
cssInterop(KeyboardAwareScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

cssInterop(KeyboardAwareFlatList, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
