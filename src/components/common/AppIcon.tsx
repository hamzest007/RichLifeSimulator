import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../../theme/colors';

/** Local SVG icon set: avoids simulator font registration issues and works offline. */
export function AppIcon({
  name,
  size = 20,
  color = colors.gold,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const key = name.replace('-outline', '');
  const common = {
    stroke: color,
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  let body: React.ReactNode;
  if (key.includes('home'))
    body = (
      <>
        <Path
          d="M3 10.5 12 3l9 7.5v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"
          {...common}
        />
        <Path d="M9 21v-6h6v6" {...common} />
      </>
    );
  else if (key.includes('business'))
    body = (
      <>
        <Rect x="4" y="4" width="6" height="16" rx="1" {...common} />
        <Rect x="14" y="8" width="6" height="12" rx="1" {...common} />
        <Path d="M6 8h2M6 12h2M16 12h2M16 16h2" {...common} />
      </>
    );
  else if (key.includes('briefcase'))
    body = (
      <>
        <Rect x="3" y="7" width="18" height="13" rx="2" {...common} />
        <Path
          d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"
          {...common}
        />
      </>
    );
  else if (key.includes('trending') || key.includes('bar-chart'))
    body = (
      <>
        <Path d="M4 17l5-5 3 3 7-8" {...common} />
        <Path d="M15 7h4v4" {...common} />
        <Path d="M4 20h16" {...common} />
      </>
    );
  else if (key.includes('wallet'))
    body = (
      <>
        <Path
          d="M4 6.5h14a2 2 0 0 1 2 2V19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"
          {...common}
        />
        <Path d="M3 8V6a2 2 0 0 1 2-2h11" {...common} />
        <Path d="M20 12h-5a2 2 0 0 0 0 4h5" {...common} />
      </>
    );
  else if (key.includes('person'))
    body = (
      <>
        <Circle cx="12" cy="8" r="3.5" {...common} />
        <Path d="M5 21a7 7 0 0 1 14 0" {...common} />
      </>
    );
  else if (key.includes('flash'))
    body = (
      <Path
        d="M13 2 4 13h6l-1 9 9-12h-6z"
        fill={color}
        stroke={color}
        strokeLinejoin="round"
      />
    );
  else if (key.includes('arrow-forward'))
    body = <Path d="M4 12h15M13 6l6 6-6 6" {...common} />;
  else if (key.includes('arrow-back'))
    body = <Path d="M20 12H5M11 6l-6 6 6 6" {...common} />;
  else if (key.includes('chevron-forward'))
    body = <Path d="m9 5 7 7-7 7" {...common} />;
  else if (key.includes('car'))
    body = (
      <>
        <Path d="M4 15h16l-2-6H7z" {...common} />
        <Path d="M7 9 9 5h6l2 4" {...common} />
        <Circle cx="8" cy="17" r="1.5" {...common} />
        <Circle cx="17" cy="17" r="1.5" {...common} />
      </>
    );
  else if (key.includes('swap'))
    body = (
      <>
        <Path d="M7 7h12l-3-3M17 17H5l3 3" {...common} />
      </>
    );
  else if (key.includes('chevron-up'))
    body = <Path d="m6 15 6-6 6 6" {...common} />;
  else if (key.includes('chevron-down'))
    body = <Path d="m6 9 6 6 6-6" {...common} />;
  else if (key.includes('cart'))
    body = (
      <>
        <Path d="M3 4h2l2 11h10l3-8H6" {...common} />
        <Circle cx="9" cy="19" r="1" fill={color} />
        <Circle cx="18" cy="19" r="1" fill={color} />
      </>
    );
  else if (key.includes('rocket'))
    body = (
      <>
        <Path d="M14 4c3-2 6-2 6-2s0 3-2 6l-6 6-4-4z" {...common} />
        <Path d="M8 14 5 17M7 17l-1 3M10 7 7 4" {...common} />
        <Circle cx="16" cy="7" r="1.5" {...common} />
      </>
    );
  else if (key.includes('construct'))
    body = (
      <>
        <Path d="m5 19 9-9" {...common} />
        <Path d="m4 20 3-1-2-2zM13 5l6 6M16 3l5 5-3 3-5-5z" {...common} />
      </>
    );
  else if (key.includes('trophy'))
    body = (
      <>
        <Path d="M8 4h8v5a4 4 0 0 1-8 0z" {...common} />
        <Path
          d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v5M8 21h8M9 18h6"
          {...common}
        />
      </>
    );
  else if (key.includes('diamond'))
    body = (
      <Path d="m12 3 8 7-8 11-8-11zM4 10h16M12 3l-4 7 4 11 4-11z" {...common} />
    );
  else if (key.includes('sparkles'))
    body = (
      <>
        <Path
          d="m12 3 1.2 4.8L18 9l-4.8 1.2L12 15l-1.2-4.8L6 9l4.8-1.2z"
          {...common}
        />
        <Path
          d="m19 15 .6 2.4L22 18l-2.4.6L19 21l-.6-2.4L16 18l2.4-.6z"
          {...common}
        />
      </>
    );
  else if (key.includes('settings'))
    body = (
      <>
        <Circle cx="12" cy="12" r="3" {...common} />
        <Path
          d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.5-1H6.4v-2.6h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.1H15v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1V14h-.1a1.7 1.7 0 0 0-1.5 1z"
          {...common}
        />
      </>
    );
  else if (key.includes('bitcoin') || key.includes('logo'))
    body = (
      <>
        <Circle cx="12" cy="12" r="8.5" {...common} />
        <Path
          d="M10 7v10M14 7v10M8 9h5a2 2 0 0 1 0 4H8h6a2 2 0 0 1 0 4H8"
          {...common}
        />
      </>
    );
  else if (
    key.includes('hardware') ||
    key.includes('medkit') ||
    key.includes('flash')
  )
    body = (
      <>
        <Rect x="5" y="5" width="14" height="14" rx="3" {...common} />
        <Path d="M9 12h6M12 9v6" {...common} />
      </>
    );
  else
    body = (
      <>
        <Circle cx="12" cy="12" r="8" {...common} />
        <Path d="M12 8v5M12 16v.1" {...common} />
      </>
    );
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {body}
    </Svg>
  );
}
