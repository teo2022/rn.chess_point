import {View, Text, Alert, FlatList, Image} from 'react-native';
import React from 'react';
import Chessboard from 'react-native-chessboard';
import Button from '../components/Button';
import Select from '../components/Select';
import {
  useState,
  useRef,
  useMemo,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import {WebsocketContext} from '../context/WebsocketContext';
import {GlobalStyles} from '../constants/globalStyles';
import {useDispatch, useSelector} from 'react-redux';
import {
  isDefeat,
  isDisconnected,
  isNotDisconnected,
  isNotPlaying,
  opponentStopTurn,
  opponentTurn,
  resetMessages,
  saveGameHistory,
  setClosed,
  setFen,
  setHistory,
  setIsUserTurn,
  setMessages,
  setMove,
  setNotQuit,
  setNotSurrender,
  setOpponentPieces,
  setOrientation,
  setRecentlyChanged,
  setRoom,
  setStatus,
  setUserPieces,
  userTurnStop,
} from '../store/reducers/gameReducer';
import Input from '../components/Input';
import Modal from '../components/Modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import bb from './../assets/img/bb.png';
import bn from './../assets/img/bn.png';
import bp from './../assets/img/bp.png';
import bq from './../assets/img/bq.png';
import br from './../assets/img/br.png';
import wb from './../assets/img/wb.png';
import wn from './../assets/img/wn.png';
import wp from './../assets/img/wp.png';
import wq from './../assets/img/wq.png';
import wr from './../assets/img/wr.png';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import {memo} from 'react';

const GameScreen = () => {
  const {
    setDataToSend,
    chessboard,
    time: timer,
    handleOpponentTimerStart,
    handleUserTimerStart,
    userTimer,
    opponentTimer,
    setUserTimer,
    setOpponentTimer,
  } = useContext(WebsocketContext);
  const [time, setTime] = useState('10');
  const [searchStarted, setSearchStarted] = useState(false);
  const [message, setMessage] = useState('');
  const dispatch = useDispatch();
  const room = useSelector(state => state.game.room);
  const orientation = useSelector(state => state.game.orientation);
  const history = useSelector(state => state.game.history);
  const playing = useSelector(state => state.game.playing);
  const wantDraw = useSelector(state => state.game.wantDraw);
  const fen = useSelector(state => state.game.fen);
  const status = useSelector(state => state.game.status);
  const messages = useSelector(state => state.game.messages);
  const disconnected = useSelector(state => state.game.disconnected);
  const isUserTurn = useSelector(state => state.game.isUserTurn);
  const reloaded = useSelector(state => state.game.reloaded);
  const opponent = useSelector(state => state.game.opponent);
  const userTurn = useSelector(state => state.game.turn);
  const user = useSelector(state => state.game.user);
  const userPieces = useSelector(state => state.game.userPieces);
  const opponentPieces = useSelector(state => state.game.opponentPieces);
  const bottomSheetRef = useRef(null);
  const bottomSheetRef2 = useRef(null);
  const snapPoints = useMemo(() => ['90%'], []);
  const bottomSheetOpen = () => bottomSheetRef.current.expand();
  const bottomSheetClose = () => bottomSheetRef.current.close();
  const bottomSheetOpen2 = () => bottomSheetRef2.current.expand();
  const bottomSheetClose2 = () => bottomSheetRef2.current.close();
  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    [],
  );

  const intervals = useMemo(
    () => [
      {label: '1 мин', value: '1'},
      {label: '3 мин', value: '3'},
      {label: '5 мин', value: '5'},
      {label: '10 мин', value: '10'},
      {label: '20 мин', value: '20'},
      {label: '30 мин', value: '30'},
      {label: '60 мин', alue: '60'},
    ],
    [],
  );

  const handleSearchStart = useCallback(() => {
    setDataToSend(
      JSON.stringify({
        type: 'search',
        content: JSON.stringify({time}),
      }),
    );
    setSearchStarted(true);
  }, []);

  const handleGiveUp = useCallback(() => {
    Alert.alert('Поражение', 'Вы уверены, что хотите сдаться?', [
      {
        text: 'Отмена',
        style: 'cancel',
      },
      {
        text: 'Да',
        onPress: async () => {
          dispatch(isNotPlaying());
          setDataToSend(JSON.stringify({type: 'gave up'}));
          dispatch(userTurnStop());
          dispatch(opponentStopTurn());
          dispatch(setFen(''));
          dispatch(setHistory([]));
          dispatch(setMove({}));
          dispatch(isDefeat());
          dispatch(setNotSurrender());
          dispatch(setRoom(0));
          dispatch(setOrientation(''));
          dispatch(setRecentlyChanged(true));
          chessboard.current.resetBoard();
          dispatch(setUserPieces([]));
          dispatch(setOpponentPieces([]));
          Alert.alert('Поражение', 'Вы сдались');
          await AsyncStorage.removeItem('move');
          await AsyncStorage.removeItem('fen');
          await AsyncStorage.removeItem('room');
          await AsyncStorage.removeItem('opponent');
        },
      },
    ]);
  }, []);

  const handleSearchCancel = useCallback(() => {
    setDataToSend(
      JSON.stringify({
        type: 'cancel',
      }),
    );
    setSearchStarted(false);
  }, []);

  const handleDraw = useCallback(() => {
    setDataToSend(JSON.stringify({type: 'disperse'}));
    dispatch(setNotQuit());
  }, []);

  const handleGameOver = useCallback(async (state, opponent = false) => {
    setDataToSend(JSON.stringify({type: 'finish'}));
    let st = '';
    if (state.in_check) {
      if (opponent) {
        dispatch(setStatus('gave up'));
        st = 'gave up';
      } else {
        dispatch(setStatus('win'));
        st = 'win';
      }
    } else if (state.in_checkmate) {
      if (opponent) {
        dispatch(setStatus('gave up'));
        st = 'gave up';
      } else {
        dispatch(setStatus('win'));
        st = 'win';
      }
    } else if (state.in_draw) {
      dispatch(setStatus('draw'));
      st = 'draw';
    } else if (state.in_stalemate) {
      dispatch(setStatus('stalemate'));
      st = 'stalemate';
    } else if (state.in_threefold_repetition) {
      dispatch(setStatus('draw'));
      st = 'draw';
    } else if (state.insufficient_material) {
      dispatch(setStatus('draw'));
      st = 'draw';
    }
    dispatch(
      saveGameHistory({
        status: st,
        history,
        orientir: orientation,
      }),
    );
    dispatch(opponentStopTurn());
    dispatch(userTurnStop());
    dispatch(isNotPlaying());
    dispatch(setFen(''));
    dispatch(setHistory([]));
    dispatch(setMove({}));
    dispatch(setRoom(0));
    dispatch(setOrientation(''));
    dispatch(setUserPieces([]));
    dispatch(setOpponentPieces([]));
    chessboard.current.resetBoard();
    await AsyncStorage.removeItem('move');
    await AsyncStorage.removeItem('fen');
    await AsyncStorage.removeItem('room');
    await AsyncStorage.removeItem('opponent');
  }, []);

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

  const handleCapturedPiece = useCallback(move => {
    if (move.color === 'w') {
      dispatch(setUserPieces([...userPieces, 'b' + move.captured]));
    } else {
      dispatch(setOpponentPieces([...opponentPieces, 'w' + move.captured]));
    }
  }, []);

  const onMove = useCallback(
    async e => {
      console.log(e);
      await AsyncStorage.setItem('fen', e.state.fen);
      await AsyncStorage.setItem('move', JSON.stringify(e.move));
      dispatch(setFen(e.state.fen));
      dispatch(setMove(e.move));
      dispatch(setHistory([...history, e.move]));
      if (room > 0 && orientation) {
        if (orientation[0].toLowerCase() !== e.state.turn) {
          if (isUserTurn) {
            dispatch(isDisconnected());
            timer.current = setTimeout(handleClosing, 30000);
            dispatch(setIsUserTurn(false));
          }
          handleOpponentTimerStart();
          dispatch(userTurnStop());
          dispatch(opponentTurn());
          setDataToSend(
            JSON.stringify({
              type: 'his',
              content: JSON.stringify({
                history,
                fen: e.state.fen,
                room,
                orientation,
                move: e.move,
                // user_time: this.props.disconnected
                //   ? String(this.props.timeToSendUser)
                //   : '',
                // opponent_time: this.props.disconnected
                //   ? String(this.props.timeToSendOp)
                //   : '',
              }),
            }),
          );
          if (e.move.captured) {
            handleCapturedPiece(e.move);
          }
          // dispatch(setMove({}));
          if (e.state.game_over) {
            handleGameOver(e.state);
          }
        } else {
          handleUserTimerStart();
          if (e.move.captured) {
            handleCapturedPiece(e.move);
          }
          if (e.state.game_over) {
            handleGameOver(e.state, true);
          }
        }
      }
    },
    [userTurn],
  );

  const handleSendMessage = () => {
    setDataToSend(
      JSON.stringify({
        type: 'chat',
        content: JSON.stringify({
          room,
          chat: message,
        }),
      }),
    );
    dispatch(setMessages({name: 'Вы', chat: message}));
    setMessage('');
  };

  const handleCapturedPieces = useCallback(piece => {
    switch (piece) {
      case 'bp':
        return (
          <Image
            style={{width: 20, height: 20}}
            resizeMode="contain"
            source={bp}
          />
        );
      case 'bn':
        return (
          <Image
            style={{width: 20, height: 20}}
            resizeMode="contain"
            source={bn}
          />
        );
      case 'bb':
        return (
          <Image
            style={{width: 20, height: 20}}
            resizeMode="contain"
            source={bb}
          />
        );
      case 'br':
        return (
          <Image
            style={{width: 20, height: 20}}
            resizeMode="contain"
            source={br}
          />
        );
      case 'bq':
        return (
          <Image
            style={{width: 20, height: 20}}
            resizeMode="contain"
            source={bq}
          />
        );
      case 'wp':
        return (
          <Image
            style={{width: 20, height: 20}}
            resizeMode="contain"
            source={wp}
          />
        );
      case 'wn':
        return (
          <Image
            style={{width: 20, height: 20}}
            resizeMode="contain"
            source={wn}
          />
        );
      case 'wb':
        return (
          <Image
            style={{width: 20, height: 20}}
            resizeMode="contain"
            source={wb}
          />
        );
      case 'wr':
        return (
          <Image
            style={{width: 20, height: 20}}
            resizeMode="contain"
            source={wr}
          />
        );
      case 'wq':
        return (
          <Image
            style={{width: 20, height: 20}}
            resizeMode="contain"
            source={wq}
          />
        );
    }
  }, []);

  const getHistory = useCallback(() => {
    let num = 0;
    return history
      .map((item, index, array) => {
        if (item.color === 'w') {
          num += 1;
          return {
            id: num,
            white: item.san,
            black: array[index + 1] ? array[index + 1].san : '',
          };
        }
      })
      .filter(item => item != undefined || item != null)
      .reverse();
  }, [history]);

  useEffect(() => {
    setSearchStarted(false);
    dispatch(resetMessages());
  }, [playing]);

  useEffect(() => {
    if (wantDraw) {
      Alert.alert('Вам предложили ничью', 'Согласиться?', [
        {text: 'Нет', style: 'cancel', onPress: () => {}},
        {
          text: 'Да',
          onPress: () => {
            setDataToSend(JSON.stringify({type: 'disperse_yes'}));
            dispatch(setFen(''));
            dispatch(setRoom(0));
            dispatch(setMove({}));
            dispatch(setOrientation(''));
            dispatch(setHistory([]));
            dispatch(isNotPlaying());
          },
        },
      ]);
    }
  }, [wantDraw]);

  useEffect(() => {
    if (status) {
      switch (status) {
        case 'win':
          Alert.alert('Победа', 'Мат!');
          break;
        case 'win connect':
          Alert.alert('Победа', 'Соперник отключился');
          break;
        case 'draw':
          Alert.alert('Ничья');
          break;
        case 'stalemate':
          Alert.alert('Пат');
          break;
        case 'gave up':
          Alert.alert('Проигрыш', 'Вам поставили мат');
          break;
        case 'user timeout':
          Alert.alert('Проигрыш', 'Время вышло');
          break;
        case 'opponent timeout':
          Alert.alert('Победа', 'У соперника вышло время');
          break;
        default:
          Alert.alert('Игра окончена');
          break;
      }
      dispatch(setStatus(''));
    }
  }, [status]);

  return (
    <View style={[GlobalStyles.container, GlobalStyles.flexJustifyCenter]}>
      {playing && (
        <View style={[GlobalStyles.mb10]}>
          <View
            style={[
              GlobalStyles.flexRow,
              GlobalStyles.flexJustifyBetween,
              GlobalStyles.flexAlignCenter,
            ]}>
            <Text style={[GlobalStyles.textBlack, GlobalStyles.fontBold]}>
              {opponent?.name_user || 'Противник'}
            </Text>
            <View>
              <Text style={[GlobalStyles.textBlack, GlobalStyles.fontBold]}>
                {opponentTimer.minute < 10 ? '0' : ''}
                {opponentTimer.minute}:{opponentTimer.second < 10 ? '0' : ''}
                {opponentTimer.second}
              </Text>
            </View>
          </View>
          <View
            style={[
              GlobalStyles.flexRow,
              GlobalStyles.flexAlignCenter,
              {flexWrap: 'wrap'},
            ]}>
            {opponentPieces.map(piece => handleCapturedPieces(piece))}
          </View>
        </View>
      )}
      <View style={[GlobalStyles.mb10, {alignSelf: 'center'}]}>
        <Chessboard ref={chessboard} onMove={onMove} />
      </View>
      {playing && (
        <View style={[GlobalStyles.mb10]}>
          <View
            style={[
              GlobalStyles.flexRow,
              GlobalStyles.flexJustifyBetween,
              GlobalStyles.flexAlignCenter,
            ]}>
            <Text style={[GlobalStyles.textBlack, GlobalStyles.fontBold]}>
              {user?.name_user || 'Вы'}
            </Text>
            <View>
              <Text style={[GlobalStyles.textBlack, GlobalStyles.fontBold]}>
                {userTimer.minute < 10 ? '0' : ''}
                {userTimer.minute}:{userTimer.second < 10 ? '0' : ''}
                {userTimer.second}
              </Text>
            </View>
          </View>
          <View
            style={[
              GlobalStyles.flexRow,
              GlobalStyles.flexAlignCenter,
              {flexWrap: 'wrap'},
            ]}>
            {userPieces.map(piece => handleCapturedPieces(piece))}
          </View>
        </View>
      )}
      {playing ? (
        <View>
          <View
            style={[
              GlobalStyles.mb10,
              GlobalStyles.flexRow,
              GlobalStyles.flexAlignCenter,
              GlobalStyles.flexJustifyBetween,
            ]}>
            <View style={{width: '49%'}}>
              <Button title="Предложить ничью" handleClick={handleDraw} />
            </View>
            <View style={{width: '49%'}}>
              <Button title="Сдаться" handleClick={handleGiveUp} />
            </View>
          </View>
          <View
            style={[
              GlobalStyles.flexRow,
              GlobalStyles.flexAlignCenter,
              GlobalStyles.flexJustifyBetween,
            ]}>
            <View style={{width: '49%'}}>
              <Button title="Чат" handleClick={bottomSheetOpen} />
            </View>
            <View style={{width: '49%'}}>
              <Button title="История" handleClick={bottomSheetOpen2} />
            </View>
          </View>
        </View>
      ) : (
        <View>
          <View style={[GlobalStyles.mb10]}>
            <Select
              items={intervals}
              value={time}
              handleChange={val => {
                setTime(val);
                setUserTimer({hour: 0, minute: Number(val), second: 0});
                setOpponentTimer({hour: 0, minute: Number(val), second: 0});
              }}
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
      )}
      <Modal
        title="Игрок отключился"
        description="Пожалуйста, подождите..."
        visible={disconnected}
      />
      <BottomSheet
        enablePanDownToClose={true}
        ref={bottomSheetRef}
        backdropComponent={renderBackdrop}
        index={-1}
        snapPoints={snapPoints}>
        <View
          style={[
            GlobalStyles.flex1,
            GlobalStyles.pb20,
            GlobalStyles.pt10,
            GlobalStyles.pl20,
            GlobalStyles.pr20,
          ]}>
          <Text
            style={[
              GlobalStyles.textBlack,
              GlobalStyles.mb10,
              GlobalStyles.fontBold,
              GlobalStyles.fontSize18,
              GlobalStyles.mt10,
            ]}>
            Чат
          </Text>
          <BottomSheetFlatList
            inverted
            data={[...messages].reverse()}
            keyExtractor={(item, index) => index}
            renderItem={({item}) => {
              return (
                <View>
                  <Text
                    style={[
                      GlobalStyles.textBlack,
                      GlobalStyles.fontBold,
                      GlobalStyles.mb5,
                    ]}>
                    {item.name}:
                  </Text>
                  <Text style={[GlobalStyles.textBlack]}>{item.chat}</Text>
                </View>
              );
            }}
            style={[GlobalStyles.flex1]}
          />
          <View style={[GlobalStyles.mt10]}>
            <Input
              placeholder="Введите сообщение"
              value={message}
              onChange={val => setMessage(val)}
              returnKeyType="done"
              onKeyPress={handleSendMessage}
            />
          </View>
        </View>
      </BottomSheet>
      <BottomSheet
        enablePanDownToClose={true}
        ref={bottomSheetRef2}
        backdropComponent={renderBackdrop}
        index={-1}
        snapPoints={snapPoints}>
        <View
          style={[
            GlobalStyles.flex1,
            GlobalStyles.pb20,
            GlobalStyles.pt10,
            GlobalStyles.pl20,
            GlobalStyles.pr20,
          ]}>
          <Text
            style={[
              GlobalStyles.textBlack,
              GlobalStyles.mb10,
              GlobalStyles.fontBold,
              GlobalStyles.fontSize18,
              GlobalStyles.mt10,
            ]}>
            История
          </Text>
          <BottomSheetFlatList
            inverted
            data={getHistory()}
            keyExtractor={(item, index) => index}
            renderItem={({item}) => {
              return (
                <View
                  style={[GlobalStyles.flexRow, GlobalStyles.flexAlignCenter]}>
                  <Text
                    style={[
                      GlobalStyles.textBlack,
                      GlobalStyles.fontBold,
                      {width: '10%'},
                    ]}>
                    {item.id}.
                  </Text>
                  <Text style={[GlobalStyles.textBlack, {width: '45%'}]}>
                    {item.white}
                  </Text>
                  <Text style={[GlobalStyles.textBlack, {width: '45%'}]}>
                    {item.black}
                  </Text>
                </View>
              );
            }}
            style={[GlobalStyles.flex1]}
          />
        </View>
      </BottomSheet>
    </View>
  );
};

export default memo(GameScreen);
