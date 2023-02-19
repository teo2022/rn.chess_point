import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {GameAPI} from '../../api/gameAPI';

const initialState = {
  start: false,
  orientation: '',
  room: '',
  loading: false,
  cancel: false,
  timer: 10,
  turn: false,
  opTurn: false,
  defeat: false,
  opponent: {},
  end: false,
  playing: false,
  userPieces: [],
  opponentPieces: [],
  userCount: 0,
  opponentCount: 0,
  status: '',
  game: null,
  history: [],
  userTimeout: false,
  opponentTimeout: false,
  quit: false,
  wantDraw: false,
  surrender: false,
  waitAnswer: false,
  drawCount: 0,
  chat: '',
  messages: [],
  newMessage: false,
  closed: false,
  disconnected: false,
  currentGame: null,
  fen: '',
  move: null,
  rerendering: false,
  firstTurn: false,
  opponentFirstTurn: false,
  changed: false,
  savedGame: {},
  userTime: 0,
  opponentTime: 0,
  isSync: false,
  timeToSendOp: 0,
  timeToSendUser: 0,
  dropSquareStyle: {},
  squareStyles: {},
  pieceSquare: '',
  square: '',
  history: [],
  recentlyChanged: true,
  connected: false,
  room: 0,
  orientation: '',
  move: {},
  draw: false,
  isUserTurn: false,
  pawn: '',
  reloaded: false,
  userPieces: [],
  opponentPieces: [],
};

export const getOpponentInfo = createAsyncThunk(
  'game/getOpponentInfo',
  async (id, thunkAPI) => {
    const response = await GameAPI.opponentInfo(id);
    console.log(response);
    return response;
  },
);

export const saveGameHistory = createAsyncThunk(
  'game/saveGameHistory',
  async (data, thunkAPI) => {
    const response = await GameAPI.saveHistory(data);
    console.log(response);
    return response;
  },
);

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setUserPieces: (state, action) => {
      state.userPieces = action.payload;
    },
    setOpponentPieces: (state, action) => {
      state.opponentPieces = action.payload;
    },
    isReloaded: (state, action) => {
      state.reloaded = action.payload;
    },
    startSearch: state => {
      state.loading = true;
      state.start = true;
    },
    resetMessages: state => {
      state.messages = [];
    },
    startEnd: state => {
      state.start = false;
      state.loading = false;
    },
    setOrientation: (state, payload) => {
      state.orientation = payload.payload;
    },
    setRoom: (state, payload) => {
      state.room = payload.payload;
    },
    isCancel: state => {
      state.cancel = true;
    },
    isNotCancel: state => {
      state.cancel = false;
    },
    userTurn: state => {
      state.turn = true;
    },
    userTurnStop: state => {
      state.turn = false;
    },
    opponentTurn: state => {
      state.opTurn = true;
    },
    opponentStopTurn: state => {
      state.opTurn = false;
    },
    isDefeat: state => {
      state.defeat = true;
      state.turn = false;
      state.opTurn = false;
    },
    setTimer: (state, data) => {
      state.timer = data.payload;
    },
    setOpponent: (state, data) => {
      state.opponent = data.payload;
    },
    isEnd: (state, data) => {
      state.end = true;
      state.game = data.payload;
    },
    reset: state => {
      if (state.game) state.game.reset();
      if (state.currentGame) state.currentGame.reset();
      state.end = false;
      state.opponent = {};
      state.turn = false;
      state.opTurn = false;
      state.userPieces = [];
      state.opponentPieces = [];
      state.opponentCount = 0;
      state.userCount = 0;
      state.defeat = false;
      state.status = '';
      state.game = null;
      state.history = [];
      state.userTimeout = false;
      state.opponentTimeout = false;
      state.orientation = '';
      state.waitAnswer = false;
      state.wantDraw = false;
      state.chat = '';
      state.messages = [];
      state.closed = false;
      state.rerendering = false;
    },
    isPlaying: state => {
      state.playing = true;
    },
    isNotPlaying: state => {
      state.playing = false;
    },
    userCaptured: (state, data) => {
      state.userPieces.push(data.payload);
    },
    opponentCaptured: (state, data) => {
      state.opponentPieces.push(data.payload);
    },
    setOpponentCount: (state, data) => {
      state.opponentCount += data.payload;
    },
    setUserCount: (state, data) => {
      state.userCount += data.payload;
    },
    setStatus: (state, data) => {
      state.status = data.payload;
    },
    setHistory: (state, data) => {
      state.history = data.payload;
    },
    setUserTimeout: state => {
      state.userTimeout = true;
    },
    setOpponentTimeout: state => {
      state.opponentTimeout = true;
    },
    setQuit: state => {
      state.quit = true;
      state.waitAnswer = true;
    },
    setNotQuit: state => {
      state.quit = false;
    },
    setSurrender: state => {
      state.surrender = true;
    },
    setNotSurrender: state => {
      state.surrender = false;
    },
    setWantDraw: state => {
      state.wantDraw = true;
    },
    notWantDraw: state => {
      state.wantDraw = false;
    },
    setDrawCount: (state, data) => {
      state.drawCount = data.payload;
    },
    setChat: (state, data) => {
      state.chat = data.payload;
    },
    setMessages: (state, data) => {
      state.messages.push(data.payload);
    },
    hasNewMessage: state => {
      state.newMessage = true;
    },
    hasNotNewMessage: state => {
      state.newMessage = false;
    },
    setClosed: state => {
      state.closed = true;
    },
    setNotClosed: state => {
      state.closed = false;
    },
    isDisconnected: state => {
      state.disconnected = true;
    },
    isNotDisconnected: state => {
      state.disconnected = false;
    },
    setCurrentGame: (state, data) => {
      state.currentGame = data.payload;
    },
    setFen: (state, data) => {
      state.fen = data.payload;
    },
    setMove: (state, data) => {
      state.move = data.payload;
    },
    needRerender: (state, data) => {
      state.rerendering = data.payload;
    },
    setFirstTurn: (state, data) => {
      state.firstTurn = data.payload;
    },
    setOpponentFirstTurn: (state, data) => {
      state.opponentFirstTurn = data.payload;
    },
    setChangedRoute: (state, data) => {
      state.changed = data.payload;
    },
    saveGame: (state, data) => {
      state.savedGame = data.payload;
    },
    setTimeUser: (state, data) => {
      state.userTime = data.payload;
    },
    setTimeOp: (state, data) => {
      state.opponentTime = data.payload;
    },
    setIsSync: state => {
      state.isSync = true;
    },
    setIsNotSync: state => {
      state.isSync = false;
    },
    setTimeToSendUser: (state, data) => {
      state.timeToSendUser = data.payload;
    },
    setTimeToSendOp: (state, data) => {
      state.timeToSendOp = data.payload;
    },
    setDropSquareStyles: (state, data) => {
      state.dropSquareStyle = data.payload;
    },
    setSquareStyles: (state, data) => {
      state.squareStyles = data.payload;
    },
    setPieceSquare: (state, data) => {
      state.pieceSquare = data.payload;
    },
    setSquare: (state, data) => {
      state.square = data.payload;
    },
    setRecentlyChanged: (state, data) => {
      state.recentlyChanged = data.payload;
    },
    setConnected: (state, data) => {
      state.connected = data.payload;
    },
    setDraw: (state, data) => {
      state.draw = data.payload;
    },
    setIsUserTurn: (state, data) => {
      state.isUserTurn = data.payload;
    },
    setPawn: (state, action) => {
      state.pawn = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(getOpponentInfo.fulfilled, (state, action) => {
      if (action.payload.status) {
        state.opponent = action.payload.data;
      }
    });
    builder.addCase(saveGameHistory.fulfilled, (state, action) => {
      if (action.payload.status) {
      }
    });
  },
});

// Action creators are generated for each case reducer function
export const {
  isReloaded,
  setSquareStyles,
  setPieceSquare,
  setSquare,
  setPawn,
  setConnected,
  setDraw,
  setDropSquareStyles,
  setIsUserTurn,
  setRecentlyChanged,
  startSearch,
  startEnd,
  setOrientation,
  setRoom,
  isCancel,
  isNotCancel,
  userTurn,
  opponentTurn,
  userTurnStop,
  opponentStopTurn,
  setTimer,
  isDefeat,
  setOpponent,
  isEnd,
  reset,
  isPlaying,
  isNotPlaying,
  userCaptured,
  opponentCaptured,
  setOpponentCount,
  setUserCount,
  setStatus,
  setHistory,
  setOpponentTimeout,
  setUserTimeout,
  setQuit,
  setNotQuit,
  setSurrender,
  setNotSurrender,
  setWantDraw,
  notWantDraw,
  setDrawCount,
  setChat,
  setMessages,
  hasNewMessage,
  hasNotNewMessage,
  setClosed,
  setNotClosed,
  isDisconnected,
  isNotDisconnected,
  setCurrentGame,
  setFen,
  setMove,
  needRerender,
  setFirstTurn,
  setOpponentFirstTurn,
  saveGame,
  setChangedRoute,
  setTimeUser,
  setTimeOp,
  setIsNotSync,
  setIsSync,
  setTimeToSendOp,
  setTimeToSendUser,
  resetMessages,
  setUserPieces,
  setOpponentPieces,
} = gameSlice.actions;

export default gameSlice.reducer;
