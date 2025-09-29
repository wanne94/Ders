import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TestCleanApp() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Clean Test App - No External Dependencies</Text>
      <Text style={styles.subtext}>Testing basic React Native functionality</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#022C43',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});