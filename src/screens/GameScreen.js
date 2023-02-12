import {View, Text} from 'react-native';
import React from 'react';
import Chessboard from 'react-native-chessboard';
import Button from '../components/Button';
import Select from '../components/Select';
import {useState} from 'react';
import {useContext} from 'react';
import {WebsocketContext} from '../context/WebsocketContext';
import {GlobalStyles} from '../constants/globalStyles';

const GameScreen = () => {
  const {websocket, setDataToSend} = useContext(WebsocketContext);
  const [time, setTime] = useState('10');
  const [searchStarted, setSearchStarted] = useState(false);
  const intervals = [
    {label: '1 мин', value: '1'},
    {label: '3 мин', value: '3'},
    {label: '5 мин', value: '5'},
    {label: '10 мин', value: '10'},
    {label: '20 мин', value: '20'},
    {label: '30 мин', value: '30'},
    {label: '60 мин', alue: '60'},
  ];

  const handleSearchStart = () => {
    setDataToSend(
      JSON.stringify({
        type: 'search',
        content: JSON.stringify({time}),
      }),
    );
    setSearchStarted(true);
  };

  const handleSearchCancel = () => {
    setDataToSend(
      JSON.stringify({
        type: 'cancel',
      }),
    );
    setSearchStarted(false);
  };

  return (
    <View style={[GlobalStyles.container, GlobalStyles.flexJustifyCenter]}>
      <View style={[GlobalStyles.mb10, {alignSelf: 'center'}]}>
        <Chessboard />
      </View>
      <View style={[GlobalStyles.mb10]}>
        <Select
          items={intervals}
          value={time}
          handleChange={val => setTime(val)}
          placeholder="Время"
        />
      </View>
      <View>
        {searchStarted ? (
          <Button title="Отменить" handleClick={handleSearchCancel} />
        ) : (
          <Button title="Играть" handleClick={handleSearchStart} />
        )}
      </View>
    </View>
  );
};

export default GameScreen;
