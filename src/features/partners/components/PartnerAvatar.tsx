import { useMemo } from 'react';
import { Image, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme/use-theme';

type PartnerAvatarProps = {
  uri: string | null | undefined;
  name: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function PartnerAvatar({ uri, name, size = 56, style }: PartnerAvatarProps) {
  const { colors } = useTheme();
  const initial = name.trim().slice(0, 1).toUpperCase() || '?';
  const textSize = Math.max(12, Math.round(size * 0.32));

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.surfaceAlt,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        image: {
          width: '100%',
          height: '100%',
        },
        text: {
          color: colors.textPrimary,
          fontSize: textSize,
          lineHeight: textSize + 2,
          fontWeight: '700',
        },
      }),
    [colors, size, textSize],
  );

  return (
    <View style={[styles.wrap, style]}>
      {uri ? <Image source={{ uri }} style={styles.image} resizeMode="cover" /> : <Text style={styles.text}>{initial}</Text>}
    </View>
  );
}
