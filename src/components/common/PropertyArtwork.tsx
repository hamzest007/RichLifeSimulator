import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../../theme/colors';

export function PropertyArtwork({ category }: { category: string }) {
  const isCommercial = category === 'Commercial' || category === 'Retail';
  return (
    <Svg width="100%" height="100%" viewBox="0 0 320 120">
      <Rect width="320" height="120" fill="#142b40" />
      <Circle cx="260" cy="30" r="22" fill="#e7bd68" opacity=".2" />
      <Path
        d="M0 96c65-18 120 8 176-8 55-16 96-11 144 2v30H0z"
        fill="#0b1b2b"
      />
      {isCommercial ? (
        <>
          <Path
            d="M78 96V35h62v61M153 96V18h78v78"
            fill="#275064"
            stroke="#e7bd68"
            strokeWidth="2"
          />
          <Path
            d="M91 49h36M91 63h36M91 77h36M168 33h48M168 48h48M168 63h48M168 78h48"
            stroke="#78b7b6"
            strokeWidth="3"
          />
        </>
      ) : (
        <>
          <Path
            d="M62 95V57l72-42 98 42v38z"
            fill="#9a7548"
            stroke="#e7bd68"
            strokeWidth="2"
          />
          <Path
            d="m48 58 86-52 112 52"
            fill="none"
            stroke="#e7bd68"
            strokeWidth="4"
          />
          <Rect x="91" y="63" width="28" height="32" fill="#78b7b6" />
          <Rect x="153" y="55" width="44" height="40" fill="#294c62" />
          <Path d="M153 75h44M175 55v40" stroke="#78b7b6" strokeWidth="2" />
        </>
      )}
      <Path d="M22 100h276" stroke={colors.emerald} strokeWidth="3" />
    </Svg>
  );
}
