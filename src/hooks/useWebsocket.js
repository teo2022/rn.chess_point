import {View, Text} from 'react-native';
import React from 'react';
import {useRef} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Constants} from '../constants/constants';
import {useState} from 'react';
import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  isPlaying,
  needRerender,
  opponentStopTurn,
  opponentTurn,
  setFen,
  setFirstTurn,
  setIsSync,
  setOpponentFirstTurn,
  setOrientation,
  setRoom,
  startEnd,
  userTurn,
  userTurnStop,
} from '../store/reducers/gameReducer';

export const useWebsocket = () => {
  const websocket = useRef(null);
  const chessboard = useRef(null);
  const [data, setData] = useState(null);
  const [dataToSend, setDataToSend] = useState(null);
  const dispatch = useDispatch();
  const auth = useSelector(state => state.user.auth);
  const fen = useSelector(state => state.game.fen);

  const connect = async () => {
    const token = await AsyncStorage.getItem('token');
    websocket.current = new WebSocket(`${Constants.WEBSOCKET_URL}${token}`);
    websocket.current.onopen = event => {
      console.log(event);
    };
    websocket.current.onmessage = event => {
      console.log(event);
      try {
        setData(JSON.parse(event.data));
      } catch (error) {
        setData(event.data);
      }
    };
    websocket.current.onerror = event => {
      console.log(event);
    };
  };

  useEffect(() => {
    if (auth) {
      connect();
    }
  }, [auth]);

  useEffect(() => {
    console.log(data);
    console.log(typeof data);
    if (data) {
      if (data.content !== '/A new socket has connected.') {
        //синхронизация таймеров
        if (data.info && data.info.includes('{')) {
          // const {user, op} = JSON.parse(response.info);
          // if (user !== undefined && op !== undefined) {
          //   this.props.setTimeOp(Number(user - 450));
          // }
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
        }
        //переподключение
        // if (
        //   data.content == 'Game' &&
        //   JSON.parse(localStorage.getItem('game'))
        // ) {
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
        // }
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
        } else if (data == 'finish') {
          // console.log('stop');
        }
        //ничья
        else if (data.info == 'disperse') {
          // this.props.setWantDraw();
        }
        //согласье на ничью
        else if (data.info == 'disperse_yes') {
          // this.props.isEnd(this.game);
          // this.props.userTurnStop();
          // this.props.opponentStopTurn();
          // let status = 'draw forced';
          // this.props.setStatus(status);
          // this.props.SaveHistory({
          //   history: this.game.history({verbose: true}),
          //   status,
          //   orientir: this.state.orientation,
          // });
          // this.props.isNotPlaying();
          // this.props.setHistory(this.game.history({verbose: true}));
          // this.setState(() => ({
          //   fen:
          //     this.game.fen() != this.state.fen
          //       ? this.game.fen()
          //       : this.state.fen,
          //   history: this.game.history({verbose: true}),
          //   move: {},
          // }));
        }
        //игрок сдался
        else if (data.info == 'gave up') {
          // this.props.isEnd(this.game);
          // this.props.userTurnStop();
          // this.props.opponentStopTurn();
          // let status = 'win forced';
          // this.props.setStatus(status);
          // this.props.SaveHistory({
          //   history: this.game.history({verbose: true}),
          //   status,
          //   orientir: this.state.orientation,
          // });
          // this.props.isNotPlaying();
          // this.props.setHistory(this.game.history({verbose: true}));
          // this.game.reset();
          // this.setState(() => ({
          //   fen:
          //     this.game.fen() != this.state.fen
          //       ? this.game.fen()
          //       : this.state.fen,
          //   history: this.game.history({verbose: true}),
          //   move: {},
          // }));
        } else {
          // let res = response;
          //начало партии
          if (data.step) {
            // this.props.Opponent(res.opponent_id);
            // dispatch(setOrientation());
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
            // localStorage.setItem('opponent', res.opponent_id);
            dispatch(setFirstTurn(true));
            dispatch(setOpponentFirstTurn(true));
            dispatch(setIsSync());
            if (data.step == 'write') {
              dispatch(userTurn());
              dispatch(opponentStopTurn());
              // this.interval = setInterval(
              //   () => {
              //     this.sendMessage(true);
              //   },
              //   this.timeToSendUser <= 10000 ? 1000 : 5000,
              // );
            } else if (data.step == 'black') {
              dispatch(userTurnStop());
              dispatch(opponentTurn());
            }
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
            // if (res.chat != this.props.chat) {
            //   this.props.setChat(res.chat);
            //   this.props.setMessages({
            //     msg: res.chat,
            //     name: this.props.opponent.login || this.props.opponent.name,
            //   });
            // }
            //ход
            let move = '';
            if (data.move) {
              if (data.move.san.split('').includes('=')) {
                //move = this.game.move(data.move.san);
                move = chessboard.current.move(data.move.san);
              } else {
                // move = this.game.move({
                //   from: data.move.from,
                //   to: data.move.to,
                // });
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
            //   if (this.game.game_over()) {
            //     clearInterval(this.interval);
            //     this.props.isEnd(this.game);
            //     this.props.userTurnStop();
            //     this.props.opponentStopTurn();
            //     let status = getStatus(this.game, this.state.orientation);
            //     console.log(status);
            //     this.props.setStatus(status);
            //     this.props.SaveHistory({
            //       history: this.game.history({verbose: true}),
            //       status,
            //       orientir: this.state.orientation,
            //     });
            //     this.props.isNotPlaying();
            //   }
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
  }, [data]);

  useEffect(() => {
    if (dataToSend) {
      websocket.current.send(dataToSend);
    }
  }, [dataToSend]);

  return {websocket, setDataToSend, chessboard};
};
