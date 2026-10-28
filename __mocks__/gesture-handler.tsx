import React from 'react';
import {View} from 'react-native';

export const GestureHandlerRootView = ({children, style}: {children?: React.ReactNode; style?: object}) => <View style={style}>{children}</View>;
