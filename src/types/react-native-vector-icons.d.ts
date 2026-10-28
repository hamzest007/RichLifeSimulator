declare module 'react-native-vector-icons/Ionicons' {
  import React from 'react';
  import { TextStyle } from 'react-native';

  type Props = {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle;
  };
  const Ionicons: React.ComponentType<Props>;
  export default Ionicons;
}
