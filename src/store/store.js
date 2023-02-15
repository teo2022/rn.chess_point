import {configureStore} from '@reduxjs/toolkit';
import gameReducer from './reducers/gameReducer';
import userReducer from './reducers/userReducer';

export const store = configureStore({
  reducer: {
    user: userReducer,
    game: gameReducer,
  },
});
