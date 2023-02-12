import {createContext} from 'react';

export const WebsocketContext = createContext({
  websocket: null,
  setDataToSend: () => {},
});
