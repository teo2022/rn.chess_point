import {View, Text, Alert} from 'react-native';
import React from 'react';
import {useRef} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Constants} from '../constants/constants';
import {useState} from 'react';
import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  getOpponentInfo,
  isDisconnected,
  isNotDisconnected,
  isNotPlaying,
  isPlaying,
  isReloaded,
  needRerender,
  opponentStopTurn,
  opponentTurn,
  saveGameHistory,
  setClosed,
  setFen,
  setFirstTurn,
  setHistory,
  setIsSync,
  setIsUserTurn,
  setMessages,
  setMove,
  setOpponentFirstTurn,
  setOpponentPieces,
  setOrientation,
  setRoom,
  setStatus,
  setUserPieces,
  setWantDraw,
  startEnd,
  userTurn,
  userTurnStop,
} from '../store/reducers/gameReducer';
import {useCallback} from 'react';

export const useWebsocket = () => {
  const websocket = useRef(null);
  const chessboard = useRef(null);
  const [data, setData] = useState(null);
  const [dataToSend, setDataToSend] = useState(null);
  const [userTimer, setUserTimer] = useState({minute: 10, second: 0});
  const [opponentTimer, setOpponentTimer] = useState({
    minute: 10,
    second: 0,
  });
  const dispatch = useDispatch();
  const auth = useSelector(state => state.user.auth);
  const fen = useSelector(state => state.game.fen);
  const orientation = useSelector(state => state.game.orientation);
  const history = useSelector(state => state.game.history);
  const room = useSelector(state => state.game.room);
  const move = useSelector(state => state.game.move);
  const opponent = useSelector(state => state.game.opponent);
  const userTimerInterval = useRef(null);
  const opponentTimerInterval = useRef(null);

  const time = useRef();

  const connect = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    websocket.current = new WebSocket(`${Constants.WEBSOCKET_URL}${token}`);
    websocket.current.onopen = event => {
      console.log(event);
    };
    websocket.current.onmessage = event => {
      try {
        setData(JSON.parse(event.data));
      } catch (error) {
        setData(event.data);
      }
    };
    websocket.current.onerror = event => {
      console.log(event);
    };
  }, []);

  const handleClosing = useCallback(async () => {
    dispatch(
      saveGameHistory({orientir: orientation, status: 'win connect', history}),
    );
    clearTimeout(userTimerInterval.current);
    clearTimeout(opponentTimerInterval.current);
    dispatch(isNotDisconnected());
    dispatch(userTurnStop());
    dispatch(opponentStopTurn());
    chessboard.current.resetBoard();
    dispatch(setStatus('win connect'));
    dispatch(setFen(''));
    dispatch(setHistory([]));
    dispatch(setRoom(0));
    dispatch(setOrientation(''));
    dispatch(setMove({}));
    dispatch(isNotPlaying());
    dispatch(setClosed());
    await AsyncStorage.removeItem('move');
    await AsyncStorage.removeItem('fen');
    await AsyncStorage.removeItem('room');
    await AsyncStorage.removeItem('opponent');
  }, []);

  //объявление проигрыша/победы в зависимости от того, чье время закончилось
  const handleTimeout = async () => {
    if (userTimer.minute === 0 && userTimer.minute === 0) {
      dispatch(setStatus('user timeout'));
      dispatch(
        saveGameHistory({
          status: 'user timeout',
          history,
          orientir: orientation,
        }),
      );
    } else {
      dispatch(setStatus('opponent timeout'));
      dispatch(
        saveGameHistory({
          status: 'opponent timeout',
          history,
          orientir: orientation,
        }),
      );
    }
    clearTimeout(userTimerInterval.current);
    clearTimeout(opponentTimerInterval.current);
    dispatch(isNotDisconnected());
    dispatch(userTurnStop());
    dispatch(opponentStopTurn());
    chessboard.current.resetBoard();
    dispatch(setFen(''));
    dispatch(setHistory([]));
    dispatch(setRoom(0));
    dispatch(setOrientation(''));
    dispatch(setMove({}));
    dispatch(isNotPlaying());
    dispatch(setClosed());
    setUserTimer({minute: 10, second: 0});
    setOpponentTimer({minute: 10, second: 0});
    await AsyncStorage.removeItem('move');
    await AsyncStorage.removeItem('fen');
    await AsyncStorage.removeItem('room');
    await AsyncStorage.removeItem('opponent');
  };

  // колбэк для рекурсивного таймаута, setInterval слишком тяжел по перформансу
  const userTimerHandler = useCallback(() => {
    setUserTimer(prev => {
      if (prev.second === 0 && prev.minute > 0) {
        return {minute: prev.minute - 1, second: 59};
      } else if (prev.second > 0) {
        return {minute: prev.minute, second: prev.second - 1};
      } else if (prev.second === 0 && prev.minute === 0) {
        handleTimeout();
        return clearTimeout(userTimerInterval.current);
      }
    });
    userTimerInterval.current = setTimeout(userTimerHandler, 1000);
  }, []);

  const handleUserTimerStart = useCallback(() => {
    clearTimeout(userTimerInterval.current);
    clearTimeout(opponentTimerInterval.current);
    userTimerInterval.current = setTimeout(userTimerHandler, 1000);
  }, []);

  // колбэк для рекурсивного таймаута, setInterval слишком тяжел по перформансу
  const opponentTimerHandler = useCallback(() => {
    setOpponentTimer(prev => {
      if (prev.second === 0 && prev.minute > 0) {
        return {minute: prev.minute - 1, second: 59};
      } else if (prev.second > 0) {
        return {minute: prev.minute, second: prev.second - 1};
      } else if (prev.second === 0 && prev.minute === 0) {
        handleTimeout();
        return clearTimeout(opponentTimerInterval.current);
      }
    });
    opponentTimerInterval.current = setTimeout(opponentTimerHandler, 1000);
  }, []);

  const handleOpponentTimerStart = useCallback(() => {
    clearTimeout(opponentTimerInterval.current);
    clearTimeout(userTimerInterval.current);
    opponentTimerInterval.current = setTimeout(opponentTimerHandler, 1000);
  }, []);

  const handleData = useCallback(async data => {
    if (data) {
      if (data.content !== '/A new socket has connected.') {
        //синхронизация таймеров
        if (data.info && data.info.includes('{')) {
          const {user, op} = JSON.parse(data.info);
          if (user !== undefined && op !== undefined) {
            setOpponentTimer(prev => {
              if (prev.second === 0) {
                return {minute: prev.minute - 1, second: 59};
              } else {
                return {minute: prev.minute, second: prev.second - 1};
              }
            });
          }
        }
        // переподключение
        else if (data.content == 'in_game_opponent') {
          clearTimeout(time.current);
          dispatch(setIsUserTurn(false));
          dispatch(isNotDisconnected());
          setDataToSend(
            JSON.stringify({
              type: 'his',
              content: JSON.stringify({
                history,
                fen,
                room,
                orientation,
                move,
                // user_time: this.props.disconnected
                //   ? String(this.props.timeToSendUser)
                //   : '',
                // opponent_time: this.props.disconnected
                //   ? String(this.props.timeToSendOp)
                //   : '',
              }),
            }),
          );
          const turn =
            chessboard.current.getState().turn === 'w' ? 'write' : 'black';
          turn === orientation
            ? dispatch(userTurn())
            : dispatch(opponentTurn());
        }
        //переподключение
        if (data.content == 'Game') {
          dispatch(isPlaying());
          const storedFen = await AsyncStorage.getItem('fen');
          const storedRoom = await AsyncStorage.getItem('room');
          const storedTurn = await AsyncStorage.getItem('turn');
          const storedMove = await AsyncStorage.getItem('move');
          const storedOpponent = await AsyncStorage.getItem('opponent');
          chessboard.current.fen = storedFen;
          chessboard.current.resetBoard(storedFen);
          dispatch(setRoom(Number(storedRoom)));
          dispatch(setOrientation(storedTurn));
          dispatch(setFen(storedFen));
          const mv = JSON.parse(storedMove);
          if (mv && mv.from && mv.to) {
            chessboard.current.move(mv);
          }
          dispatch(getOpponentInfo(storedOpponent));
          dispatch(userTurn());
          dispatch(opponentStopTurn());
          handleUserTimerStart();
          dispatch(isReloaded(true));
        }
        //игрок отключился
        if (data.info == 'websocket: close 1001 (going away)') {
          // let turn = this.game.turn();
          // let color = turn == 'w' ? 'write' : 'black';
          // if (color == this.state.orientation) {
          //   this.setState(() => ({isUserTurn: true}));
          //   return;
          // }
          // this.props.isDisconnected();
          // this.props.userTurnStop();
          // this.props.opponentStopTurn();
          // this.time = setTimeout(this.handleClosing, 30000);
          // this.interval = setInterval(
          //   () => {
          //     this.sendMessage(true);
          //   },
          //   this.timeToSendUser <= 10000 ? 1000 : 5000,
          // );
          const turn = chessboard.current.getState().turn;
          const color = turn == 'w' ? 'write' : 'black';
          if (color === orientation) {
            dispatch(setIsUserTurn(true));
            return;
          }
          dispatch(isDisconnected());
          dispatch(userTurnStop());
          dispatch(opponentStopTurn());
          time.current = setTimeout(handleClosing, 30000);
        } else if (data == 'finish') {
        }
        //ничья
        else if (data.info == 'disperse') {
          dispatch(setWantDraw());
        }
        //согласье на ничью
        else if (data.info == 'disperse_yes') {
          dispatch(userTurnStop());
          dispatch(opponentStopTurn());
          dispatch(
            saveGameHistory({
              status: 'draw forced',
              history,
              orientir: orientation,
            }),
          );
          dispatch(isNotPlaying());
          dispatch(setFen(''));
          dispatch(setHistory([]));
          dispatch(setMove({}));
          dispatch(setOrientation(''));
          dispatch(setUserPieces([]));
          dispatch(setOpponentPieces([]));
          clearTimeout(userTimerInterval.current);
          clearTimeout(opponentTimerInterval.current);
          Alert.alert('Ничья', 'Игрок согласился на ничью');
          await AsyncStorage.removeItem('move');
          await AsyncStorage.removeItem('fen');
          await AsyncStorage.removeItem('room');
          await AsyncStorage.removeItem('opponent');
        }
        //игрок сдался
        else if (data.info == 'gave up') {
          dispatch(userTurnStop());
          dispatch(opponentStopTurn());
          clearTimeout(userTimerInterval.current);
          clearTimeout(opponentTimerInterval.current);
          dispatch(isNotPlaying());
          chessboard.current.resetBoard();
          dispatch(setMove({}));
          dispatch(setFen(''));
          dispatch(setUserPieces([]));
          dispatch(setOpponentPieces([]));
          Alert.alert('Победа', 'Игрок сдался');
          await AsyncStorage.removeItem('move');
          await AsyncStorage.removeItem('fen');
          await AsyncStorage.removeItem('room');
          await AsyncStorage.removeItem('opponent');
        } else {
          //начало партии
          if (data.step) {
            dispatch(setOrientation(data.step));
            dispatch(setRoom(data.room));
            dispatch(setFen('start'));
            dispatch(startEnd());
            dispatch(isPlaying());
            dispatch(setFirstTurn(true));
            dispatch(setOpponentFirstTurn(true));
            dispatch(setIsSync());
            await AsyncStorage.setItem('room', String(data.room));
            await AsyncStorage.setItem('turn', data.step);
            await AsyncStorage.setItem('opponent', String(data.opponent_id));
            if (data.step == 'write') {
              dispatch(userTurn());
              dispatch(opponentStopTurn());
              handleUserTimerStart();
            } else if (data.step == 'black') {
              dispatch(userTurnStop());
              dispatch(opponentTurn());
              handleOpponentTimerStart();
            }
            dispatch(getOpponentInfo(data.opponent_id));
          } else {
            if (data.room > 0 && data.orientation && data.fen != fen) {
              dispatch(userTurn());
              dispatch(opponentStopTurn());
            }
            //внутриигровой чат
            if (data.chat) {
              dispatch(
                setMessages({
                  chat: data.chat,
                  name: opponent?.name_user || 'Противник',
                }),
              );
            }
            //ход
            let move = '';
            if (data.move) {
              if (data.move.san.split('').includes('=')) {
                move = chessboard.current.move({
                  ...data.move,
                  promotion:
                    data.move.san[data.move.san.length - 1].toLowerCase(),
                });
              } else {
                if (data.move.from && data.move.to) {
                  move = chessboard.current.move({
                    from: data.move.from,
                    to: data.move.to,
                  });
                }
              }
            }
          }
        }
      }
    }
  }, []);

  //подключение при авторизации
  useEffect(() => {
    if (auth) {
      connect();
    }
  }, [auth]);

  //прием данных из сокетов
  useEffect(() => {
    handleData(data);
  }, [data]);

  //отправка данных по сокетам через setDataToSend
  useEffect(() => {
    if (dataToSend) {
      websocket.current.send(dataToSend);
    }
  }, [dataToSend]);

  return {
    websocket,
    setDataToSend,
    chessboard,
    time,
    userTimer,
    setUserTimer,
    opponentTimer,
    setOpponentTimer,
    handleUserTimerStart,
    handleOpponentTimerStart,
  };
};
