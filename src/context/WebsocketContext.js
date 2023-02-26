import {createContext} from 'react';

export const WebsocketContext = createContext({
  websocket: null,
  setDataToSend: () => {},
  chessboard: null,
  time: null,
  opponentTimer: null,
  setOpponentTimer: () => {},
  userTimer: null,
  setUserTimer: () => [],
  handleUserTimerStart: () => {},
  handleOpponentTimerStart: () => {},
});
