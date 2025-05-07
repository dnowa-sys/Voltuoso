// app/[...not-found].tsx
import React from 'react';
import { Button, Text, View } from 'react-native';

const NotFound = () => (
  <View>
    <Text>Page not found</Text>
    <Button title="Go Home" onPress={() => {}} />
  </View>
);

export default NotFound;
