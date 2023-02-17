import {View, Text, Alert, FlatList} from 'react-native';
import React from 'react';
import Chessboard from 'react-native-chessboard';
import Button from '../components/Button';
import Select from '../components/Select';
import {useState} from 'react';
import {useContext} from 'react';
import {WebsocketContext} from '../context/WebsocketContext';
import {GlobalStyles} from '../constants/globalStyles';
import {useDispatch, useSelector} from 'react-redux';
import {
  isDefeat,
  isNotPlaying,
  opponentStopTurn,
  opponentTurn,
  resetMessages,
  setFen,
  setHistory,
  setMessages,
  setMove,
  setNotQuit,
  setNotSurrender,
  setOrientation,
  setRecentlyChanged,
  setRoom,
  setStatus,
  userTurnStop,
} from '../store/reducers/gameReducer';
import {useEffect} from 'react';
import Input from '../components/Input';
import {useRef} from 'react';

const GameScreen = () => {
  const {setDataToSend, chessboard} = useContext(WebsocketContext);
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

  const intervals = [
    {label: '1 мин', value: '1'},
    {label: '3 мин', value: '3'},
    {label: '5 мин', value: '5'},
    {label: '10 мин', value: '10'},
    {label: '20 мин', value: '20'},
    {label: '30 мин', value: '30'},
    {label: '60 мин', alue: '60'},
  ];

  const handleSearchStart = () => {
    setDataToSend(
      JSON.stringify({
        type: 'search',
        content: JSON.stringify({time}),
      }),
    );
    setSearchStarted(true);
  };

  const handleGiveUp = () => {
    Alert.alert('Поражение', 'Вы уверены, что хотите сдаться?', [
      {
        text: 'Отмена',
        style: 'cancel',
      },
      {
        text: 'Да',
        onPress: () => {
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
          Alert.alert('Поражение', 'Вы сдались');
        },
      },
    ]);
  };

  const handleSearchCancel = () => {
    setDataToSend(
      JSON.stringify({
        type: 'cancel',
      }),
    );
    setSearchStarted(false);
  };

  const handleDraw = () => {
    setDataToSend(JSON.stringify({type: 'disperse'}));
    dispatch(setNotQuit());
  };

  const handleGameOver = (state, opponent = false) => {
    setDataToSend(JSON.stringify({type: 'finish'}));
    if (state.in_check) {
      if (opponent) {
        dispatch(setStatus('gave up'));
      } else {
        dispatch(setStatus('win'));
      }
    } else if (state.in_checkmate) {
      if (opponent) {
        dispatch(setStatus('gave up'));
      } else {
        dispatch(setStatus('win'));
      }
    } else if (state.in_draw) {
      dispatch(setStatus('draw'));
    } else if (state.in_stalemate) {
      dispatch(setStatus('stalemate'));
    } else if (state.in_threefold_repetition) {
      dispatch(setStatus('draw'));
    } else if (state.insufficient_material) {
      dispatch(setStatus('draw'));
    }
    dispatch(opponentStopTurn());
    dispatch(userTurnStop());
    dispatch(isNotPlaying());
    dispatch(setFen(''));
    dispatch(setHistory([]));
    dispatch(setMove({}));
    dispatch(setRoom(0));
    dispatch(setOrientation(''));
    chessboard.current.resetBoard();
  };

  const onMove = e => {
    console.log(orientation);
    console.log(e);
    dispatch(setFen(e.state.fen));
    dispatch(setMove(e.move));
    // dispatch(setHistory())
    if (room > 0 && orientation) {
      if (orientation[0].toLowerCase() !== e.state.turn) {
        dispatch(userTurnStop());
        dispatch(opponentTurn());
        setDataToSend(
          JSON.stringify({
            type: 'his',
            content: JSON.stringify({
              history: history,
              fen: e.state.fen,
              room: room,
              orientation: orientation,
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
        dispatch(setMove({}));
        if (e.state.game_over) {
          handleGameOver(e.state);
        }
      } else {
        if (e.state.game_over) {
          handleGameOver(e.state, true);
        }
      }
    }
  };

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
        case 'draw':
          Alert.alert('Ничья');
          break;
        case 'stalemate':
          Alert.alert('Пат');
          break;
        case 'gave up':
          Alert.alert('Проигрыш', 'Вам поставили мат');
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
      <View style={[GlobalStyles.mb10, {alignSelf: 'center'}]}>
        <Chessboard ref={chessboard} onMove={onMove} />
      </View>
      {playing ? (
        <View>
          <View style={[GlobalStyles.mb10]}>
            <Button title="Предложить ничью" handleClick={handleDraw} />
          </View>
          <View>
            <Button title="Сдаться" handleClick={handleGiveUp} />
          </View>
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
          <FlatList
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
            style={{height: 120, position: 'relative'}}
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
      ) : (
        <View>
          <View style={[GlobalStyles.mb10]}>
            <Select
              items={intervals}
              value={time}
              handleChange={val => setTime(val)}
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
    </View>
  );
};

export default GameScreen;
