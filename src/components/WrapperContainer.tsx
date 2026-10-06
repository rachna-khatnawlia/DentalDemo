import React, { Children, Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import colors from '../constants/colors';

interface WrapperContainerProps {
  children?: React.ReactNode;
  style?: any;
}

// create a component
const WrapperContainer: React.FC<WrapperContainerProps> = ({ children, style }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }, style]}>
      <StatusBar style="dark" />
      {children}
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});

//make this component available to the app
export default WrapperContainer;
