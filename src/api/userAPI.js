import AsyncStorage from '@react-native-async-storage/async-storage';
import {Constants} from '../constants/constants';

export const UserAPI = {
  login: async (login, password_hash) => {
    const response = await fetch(`${Constants.SERVER_URL}/user/login`, {
      method: 'POST',
      body: JSON.stringify({
        login,
        password_hash,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await response.json();
    return json;
  },
  register: async (login, password_hash, name, type) => {
    const response = await fetch(`${Constants.SERVER_URL}/user/create`, {
      method: 'POST',
      body: JSON.stringify({
        login,
        password_hash,
        name,
        type,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await response.json();
    return json;
  },
  telegramLogin: async () => {},
  vkLogin: async () => {},
  updateUser: async () => {},
  validateName: async () => {},
  validateLogin: async () => {},
  currentUser: async () => {
    const token = (await AsyncStorage.getItem('token')) || '';
    const response = await fetch(`${Constants.SERVER_URL}/user/me`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });
    const json = await response.json();
    return json;
  },
};
