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

  const handleGameOver = state => {
    if (state.in_check) {
      return 'gave up';
    } else if (state.in_checkmate) {
      return 'gave up';
    } else if (state.in_draw) {
      return 'draw';
    } else if (state.in_stalemate) {
      return 'stalemate';
    } else if (state.in_threefold_repetition) {
      return 'draw';
    } else if (state.insufficient_material) {
      return 'draw';
    }
  };

  const handleClosing = useCallback(async () => {
    // clearInterval(this.interval);
    // this.props.isEnd(this.game);
    // this.props.userTurnStop();
    // this.props.opponentStopTurn();
    // this.game.reset();
    // let status = 'win connect';
    // this.props.setStatus(status);
    // this.props.SaveHistory({
    //   history: this.game.history({ verbose: true }),
    //   status,
    //   orientir: this.state.orientation,
    // });
    // this.setState(() => ({
    //   fen: '',
    //   dropSquareStyle: {},
    //   squareStyles: {},
    //   pieceSquare: '',
    //   square: '',
    //   history: [],
    //   token: localStorage.getItem('token'),
    //   room: 0,
    //   orientation: '',
    //   move: {},
    // }));
    // this.props.isNotPlaying();
    // this.props.isNotDisconnected();
    // this.props.setClosed();
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
          console.log(user);
          console.log(op);
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
          // this.sendMessage();
          // clearTimeout(this.time);
          // this.setState(() => ({isUserTurn: false}));
          // this.props.isNotDisconnected();
          // let turn = this.game.turn() === 'w' ? 'write' : 'black';
          // turn === this.state.orientation
          //   ? this.props.userTurn()
          //   : this.props.opponentTurn();
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
          //   // let game = JSON.parse(localStorage.getItem('game'));
          //   // console.log(game);
          //   // this.game.load(game.fen);
          //   // this.props.isPlaying();
          //   // this.props.Opponent(localStorage.getItem('opponent'));
          //   // if (game.room > 0 && game.orientation && game.fen != this.state.fen) {
          //   //   this.props.userTurn();
          //   //   this.props.opponentStopTurn();
          //   // }
          //   // let move = game.move
          //   //   ? this.game.move({
          //   //       from: game.move.from,
          //   //       to: game.move.to,
          //   //     })
          //   //   : '';
          //   // if (move && move.captured) {
          //   //   addPiece(
          //   //     this.state.orientation,
          //   //     this.props.userCaptured,
          //   //     this.props.opponentCaptured,
          //   //     this.props.setOpponentCount,
          //   //     this.props.setUserCount,
          //   //     move,
          //   //   );
          //   // }
          //   // if (this.game.game_over()) {
          //   //   this.props.isEnd(this.game);
          //   //   this.props.userTurnStop();
          //   //   this.props.opponentStopTurn();
          //   //   let status = getStatus(this.game, this.state.orientation);
          //   //   console.log(status);
          //   //   this.props.setStatus(status);
          //   //   this.props.SaveHistory({
          //   //     history: this.game.history({verbose: true}),
          //   //     status,
          //   //     orientir: this.state.orientation,
          //   //   });
          //   //   this.props.isNotPlaying();
          //   // }
          //   // this.props.setHistory(this.game.history({verbose: true}));
          //   // this.setState(() => ({
          //   //   ...game,
          //   // }));
          //   // localStorage.setItem(
          //   //   'game',
          //   //   JSON.stringify({
          //   //     fen:
          //   //       this.game.fen() != this.state.fen
          //   //         ? this.game.fen()
          //   //         : this.state.fen,
          //   //     history: this.game.history({verbose: true}),
          //   //     move: game.move ? game.move : this.state.move,
          //   //     orientation: this.state.orientation,
          //   //     room: this.state.room,
          //   //   }),
          //   // );
          //   // this.props.userTurn();
          //   // this.props.opponentStopTurn();
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
          // console.log('stop');
        }
        //ничья
        else if (data.info == 'disperse') {
          dispatch(setWantDraw());
        }
        //согласье на ничью
        else if (data.info == 'disperse_yes') {
          // this.props.isEnd(this.game);
          dispatch(userTurnStop());
          dispatch(opponentStopTurn());
          // let status = 'draw forced';
          // this.props.setStatus(status);
          // this.props.SaveHistory({
          //   history: this.game.history({verbose: true}),
          //   status,
          //   orientir: this.state.orientation,
          // });
          dispatch(
            saveGameHistory({
              status: 'draw forced',
              history,
              orientir: orientation,
            }),
          );
          dispatch(isNotPlaying());
          // this.props.setHistory(this.game.history({verbose: true}));
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
          // this.props.SaveHistory({
          //   history: this.game.history({verbose: true}),
          //   status,
          //   orientir: this.state.orientation,
          // });
          clearTimeout(userTimerInterval.current);
          clearTimeout(opponentTimerInterval.current);
          dispatch(isNotPlaying());
          // this.props.setHistory(this.game.history({verbose: true}));
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
          // let res = response;
          //начало партии
          if (data.step) {
            // this.props.Opponent(res.opponent_id);
            // this.props.setOrientation(data.step);
            // this.setState(() => ({
            //   orientation: res.step,
            //   room: res.room,
            //   fen: 'start',
            // }));
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
              // this.interval = setInterval(
              //   () => {
              //     this.sendMessage(true);
              //   },
              //   this.timeToSendUser <= 10000 ? 1000 : 5000,
              // );
            } else if (data.step == 'black') {
              dispatch(userTurnStop());
              dispatch(opponentTurn());
              handleOpponentTimerStart();
            }
            dispatch(getOpponentInfo(data.opponent_id));
          } else {
            if (data.room > 0 && data.orientation && data.fen != fen) {
              // clearInterval(this.interval);
              dispatch(userTurn());
              dispatch(opponentStopTurn());
            }
            // if (data.user_time && data.opponent_time) {
            // localStorage.setItem('response_user_time', res.opponent_time);
            // localStorage.setItem('response_opponent_time', res.user_time);
            // dispatch(needRerender(true));
            // let turn = this.game.turn() == 'w' ? 'write' : 'black';
            // if (this.state.orientation != turn) {
            //   dispatch(userTurnStop());
            //   dispatch(opponentTurn());
            // }
            // }
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
            //   if (move && move.captured) {
            //     addPiece(
            //       this.state.orientation,
            //       this.props.userCaptured,
            //       this.props.opponentCaptured,
            //       this.props.setOpponentCount,
            //       this.props.setUserCount,
            //       move,
            //     );
            //   }
            // const gameState = chessboard.current.getState();
            // console.log('STATE');
            // console.log(gameState);
            // if (gameState.game_over) {
            //     clearInterval(this.interval);
            //     this.props.isEnd(this.game);
            // dispatch(userTurnStop());
            // dispatch(opponentStopTurn());
            // let status = handleGameOver(gameState);
            // console.log(status);
            // dispatch(setStatus(status));
            //     this.props.SaveHistory({
            //       history: this.game.history({verbose: true}),
            //       status,
            //       orientir: this.state.orientation,
            //     });
            // dispatch(isNotPlaying());
            // chessboard.current.resetBoard();
            // dispatch(setFen(''));
            // dispatch(setOrientation(''));
            // dispatch(setRoom(0));
            // dispatch(setMove({}));
            //}
            //   this.props.setHistory(this.game.history({verbose: true}));
            //   this.setState(({pieceSquare}) => ({
            //     fen:
            //       this.game.fen() != this.state.fen
            //         ? this.game.fen()
            //         : this.state.fen,
            //     history: this.game.history({verbose: true}),
            //     move: res.move ? res.move : this.state.move,
            //     squareStyles:
            //       localStorage.getItem('hiMove') !== 'false'
            //         ? squareStyling({
            //             pieceSquare,
            //             history: this.game.history({verbose: true}),
            //           })
            //         : this.state.squareStyles,
            //   }));
            //   if (move) {
            //     this.interval = setInterval(
            //       () => {
            //         this.sendMessage(true);
            //       },
            //       this.timeToSendUser <= 10000 ? 1000 : 5000,
            //     );
            //   }
            //   localStorage.setItem(
            //     'game',
            //     JSON.stringify({
            //       fen:
            //         this.game.fen() != this.state.fen
            //           ? this.game.fen()
            //           : this.state.fen,
            //       history: this.game.history({verbose: true}),
            //       move: res.move ? res.move : this.state.move,
            //       orientation: this.state.orientation,
            //       room: this.state.room,
            //     }),
            //   );
            //   if (localStorage.getItem('sound') !== 'false' && playing && move)
            //     this.audio.play();
          }
        }
      }
    }
  }, []);

  useEffect(() => {
    if (auth) {
      connect();
    }
  }, [auth]);

  useEffect(() => {
    console.log(data);
    handleData(data);
  }, [data]);

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
