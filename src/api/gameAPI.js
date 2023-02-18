import AsyncStorage from '@react-native-async-storage/async-storage';
import {Constants} from '../constants/constants';

export const GameAPI = {
  opponentInfo: async id => {
    const token = (await AsyncStorage.getItem('token')) || '';
    const response = await fetch(
      `${Constants.SERVER_URL}/user/opponent/${id}`,
      {
        headers: {
          Authorization: token,
        },
      },
    );
    const json = await response.json();
    return json;
  },

  saveHistory: async data => {
    const token = (await AsyncStorage.getItem('token')) || '';
    const response = await fetch(`${Constants.SERVER_URL}/history/create`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });
    const json = await response.json();
    return json;
  },
};
