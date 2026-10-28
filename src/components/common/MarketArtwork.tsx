import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../../theme/colors';

export function MarketArtwork({
  crypto,
  positive = true,
}: {
  crypto?: boolean;
  positive?: boolean;
}) {
  const accent = crypto ? '#a98aff' : colors.gold;
  return (
    <Svg width="100%" height="100%" viewBox="0 0 320 100">
      <Rect width="320" height="100" fill={crypto ? '#211c3f' : '#172d3e'} />
      <Circle cx="262" cy="24" r="35" fill={accent} opacity=".12" />
      <Circle cx="260" cy="50" r="25" fill={accent} opacity=".18" />
      <Circle
        cx="260"
        cy="50"
        r="16"
        fill="none"
        stroke={accent}
        strokeWidth="3"
      />
      <Path
        d="M253 42h12M253 50h12M253 58h12"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d={
          positive
            ? 'M22 78 72 62l38 12 45-30 40 16 54-37'
            : 'M22 45l52 26 36-18 46 24 42-37 53 21'
        }
        fill="none"
        stroke={positive ? colors.emerald : colors.red}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M20 86h270" stroke="#456176" strokeWidth="1" />
    </Svg>
  );
}
