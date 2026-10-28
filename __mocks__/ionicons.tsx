import React from 'react';
import {Text} from 'react-native';

export default function Ionicons({name, ...props}: {name: string; size?: number; color?: string}) {
  return <Text {...props}>{name}</Text>;
}
