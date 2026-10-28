import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../../theme/colors';

export function LifestyleArtwork({
  type,
}: {
  type:
    | 'car'
    | 'home'
    | 'yacht'
    | 'jet'
    | 'island'
    | 'watch'
    | 'clothing'
    | 'office'
    | 'travel'
    | 'security'
    | 'staff';
}) {
  const common = {
    width: '100%',
    height: '100%',
    viewBox: '0 0 320 150',
  } as const;
  if (type === 'car')
    return (
      <Svg {...common}>
        <Rect width="320" height="150" fill="#162a3e" />
        <Circle cx="250" cy="35" r="26" fill="#28445e" />
        <Path d="M42 105h220l-20-32-48-20H112L78 72 50 82z" fill="#b78b43" />
        <Path d="M112 58h72l32 24H91z" fill="#85b5c4" />
        <Circle
          cx="91"
          cy="107"
          r="18"
          fill="#08111f"
          stroke={colors.gold}
          strokeWidth="5"
        />
        <Circle
          cx="221"
          cy="107"
          r="18"
          fill="#08111f"
          stroke={colors.gold}
          strokeWidth="5"
        />
        <Path
          d="M58 93h28M237 91h20"
          stroke={colors.emerald}
          strokeWidth="5"
          strokeLinecap="round"
        />
      </Svg>
    );
  if (type === 'home')
    return (
      <Svg {...common}>
        <Rect width="320" height="150" fill="#172d42" />
        <Circle cx="250" cy="36" r="24" fill="#d1a963" />
        <Path d="M48 128V72l78-45 126 45v56z" fill="#b38955" />
        <Path d="M40 75l86-55 134 55-10 14-124-51L51 89z" fill="#e6bd6b" />
        <Rect x="80" y="85" width="42" height="43" fill="#78b5c0" />
        <Rect x="151" y="75" width="58" height="53" fill="#294b61" />
        <Path d="M209 76v52M151 101h58" stroke="#6cb5b2" strokeWidth="3" />
        <Path d="M30 128h260" stroke={colors.emerald} strokeWidth="4" />
      </Svg>
    );
  if (type === 'yacht')
    return (
      <Svg {...common}>
        <Rect width="320" height="150" fill="#122b43" />
        <Path d="M0 116c60-17 120 17 180 0s92 10 140-2v36H0z" fill="#1e5970" />
        <Path d="M72 99h178l-25 22H92z" fill="#e5b961" />
        <Path d="M104 96V45h4v51zM108 49l64 40h-64z" fill="#f2d89b" />
        <Path d="M172 89l55-26v37z" fill="#f8e8b7" />
        <Circle cx="238" cy="31" r="20" fill="#b9e7e2" opacity=".35" />
      </Svg>
    );
  if (type === 'jet')
    return (
      <Svg {...common}>
        <Rect width="320" height="150" fill="#182b43" />
        <Circle cx="252" cy="34" r="26" fill="#294763" />
        <Path d="M36 78h156l53 18-53 13H36l-31-15z" fill="#d2a75e" />
        <Path
          d="M130 79l46-42 18 3-20 39zM132 93l42 35 17-3-20-33z"
          fill="#b98747"
        />
        <Path
          d="M196 87h60"
          stroke={colors.emerald}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <Circle cx="81" cy="88" r="5" fill="#6faab7" />
        <Circle cx="102" cy="88" r="5" fill="#6faab7" />
        <Circle cx="123" cy="88" r="5" fill="#6faab7" />
      </Svg>
    );
  if (type === 'watch')
    return (
      <Svg {...common}>
        <Rect width="320" height="150" fill="#172d42" />
        <Rect x="130" y="10" width="60" height="130" rx="28" fill="#8c673d" />
        <Circle
          cx="160"
          cy="75"
          r="38"
          fill="#0c1726"
          stroke={colors.gold}
          strokeWidth="6"
        />
        <Path
          d="M160 75V49M160 75l18 12"
          stroke={colors.emerald}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </Svg>
    );
  if (type === 'clothing')
    return (
      <Svg {...common}>
        <Rect width="320" height="150" fill="#1b3044" />
        <Path
          d="M118 35 145 22h30l27 13 35 23-23 28-19-12v58H125V74l-19 12-23-28z"
          fill="#b58a52"
        />
        <Path
          d="M145 22c2 18 28 18 30 0"
          fill="none"
          stroke="#e7bd68"
          strokeWidth="4"
        />
      </Svg>
    );
  if (type === 'office')
    return (
      <Svg {...common}>
        <Rect width="320" height="150" fill="#172d42" />
        <Rect x="57" y="35" width="206" height="95" fill="#9f7c4e" />
        <Rect x="78" y="52" width="42" height="36" fill="#73aebb" />
        <Rect x="136" y="52" width="42" height="36" fill="#73aebb" />
        <Rect x="194" y="52" width="42" height="36" fill="#73aebb" />
        <Path d="M35 130h250" stroke={colors.emerald} strokeWidth="4" />
      </Svg>
    );
  if (type === 'travel')
    return (
      <Svg {...common}>
        <Rect width="320" height="150" fill="#122b43" />
        <Circle cx="245" cy="38" r="26" fill="#d8b568" />
        <Path
          d="M55 112 155 28l104 84"
          fill="none"
          stroke="#b58a52"
          strokeWidth="12"
        />
        <Path
          d="M88 112h140"
          stroke={colors.emerald}
          strokeWidth="5"
          strokeLinecap="round"
        />
      </Svg>
    );
  if (type === 'security')
    return (
      <Svg {...common}>
        <Rect width="320" height="150" fill="#17283b" />
        <Path
          d="M160 20 235 48v39c0 36-32 48-75 58-43-10-75-22-75-58V48z"
          fill="#243d56"
          stroke={colors.gold}
          strokeWidth="5"
        />
        <Path
          d="m128 78 20 20 45-48"
          fill="none"
          stroke={colors.emerald}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  if (type === 'staff')
    return (
      <Svg {...common}>
        <Rect width="320" height="150" fill="#172d42" />
        <Circle cx="126" cy="57" r="25" fill="#b58a52" />
        <Circle cx="194" cy="57" r="25" fill="#d3aa64" />
        <Path
          d="M72 132c5-38 35-49 54-49s49 11 54 49M140 132c5-38 35-49 54-49s49 11 54 49"
          fill="#294b61"
          stroke={colors.emerald}
          strokeWidth="4"
        />
      </Svg>
    );
  return (
    <Svg {...common}>
      <Rect width="320" height="150" fill="#193047" />
      <Circle cx="238" cy="34" r="27" fill="#e2bd6b" />
      <Path
        d="M0 115c70-30 137-2 202-17 45-10 76-9 118 3v49H0z"
        fill="#1e6b64"
      />
      <Path d="M49 111c41-49 92-49 135 0z" fill="#c2a06a" />
      <Path d="M92 77h44v34H92z" fill="#83b6b6" />
      <Path
        d="M80 111h74"
        stroke={colors.gold}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <Path
        d="M0 126c85-17 153 17 320-3"
        stroke="#5dc9bd"
        strokeWidth="3"
        fill="none"
      />
    </Svg>
  );
}
