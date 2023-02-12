import {View, Text} from 'react-native';
import React from 'react';
import Chessboard from 'react-native-chessboard';
import Button from '../components/Button';

const GameScreen = () => {
  const handleSearchStart = () => {};

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Chessboard />
      <View>
        <Button title="Играть" handleClick={handleSearchStart} />
      </View>
    </View>
  );
};

export default GameScreen;
