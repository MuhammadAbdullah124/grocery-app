import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

interface ScannerFrameProps {
  size?: number;
  active?: boolean;
}

const CORNER_SIZE = 32;
const CORNER_THICKNESS = 4;

export function ScannerFrame({ size = 260, active = true }: ScannerFrameProps) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, { toValue: size - 24, duration: 1600, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, size, translateY]);

  const cornerBase = 'absolute';
  const corners = [
    { style: { top: 0, left: 0, borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderTopLeftRadius: 16 } },
    { style: { top: 0, right: 0, borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderTopRightRadius: 16 } },
    { style: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderBottomLeftRadius: 16 } },
    { style: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderBottomRightRadius: 16 } },
  ];

  return (
    <View style={{ width: size, height: size }}>
      <View className="absolute inset-0 rounded-2xl border border-white/20" />
      {corners.map((corner, index) => (
        <View
          key={index}
          className={cornerBase}
          style={[{ width: CORNER_SIZE, height: CORNER_SIZE, borderColor: '#1db567' }, corner.style]}
        />
      ))}
      {active ? (
        <Animated.View
          className="absolute left-2 right-2 h-0.5 rounded-full bg-primary-500"
          style={{ transform: [{ translateY }] }}
        />
      ) : null}
    </View>
  );
}
