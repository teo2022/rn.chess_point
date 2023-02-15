import {View, Text, Alert} from 'react-native';
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
  setFen,
  setHistory,
  setMove,
  setNotSurrender,
  setOrientation,
  setRecentlyChanged,
  setRoom,
  userTurnStop,
} from '../store/reducers/gameReducer';

const GameScreen = () => {
  const {setDataToSend, chessboard} = useContext(WebsocketContext);
  const [time, setTime] = useState('10');
  const [searchStarted, setSearchStarted] = useState(false);
  const dispatch = useDispatch();
  const room = useSelector(state => state.game.room);
  const orientation = useSelector(state => state.game.orientation);
  const history = useSelector(state => state.game.history);
  const playing = useSelector(state => state.game.playing);

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
          setSearchStarted(false);
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

  const handleDraw = () => {};

  const onMove = e => {
    dispatch(setFen(e.state.fen));
    dispatch(setMove(e.move));
    // dispatch(setHistory())
    if (room > 0 && orientation) {
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
    }
  };

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
