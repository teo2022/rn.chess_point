import {View, Text, SafeAreaView, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {GlobalStyles} from '../constants/globalStyles';
import Input from '../components/Input';
import Button from '../components/Button';
import {useDispatch} from 'react-redux';
import {userRegister} from '../store/reducers/userReducer';
import Select from '../components/Select';

const SignUpScreen = ({navigation}) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const dispatch = useDispatch();
  const levels = [
    {label: 'Новичек', value: 'Новичек'},
    {label: 'Начальный', value: 'Начальный'},
    {label: 'Средний', value: 'Средний'},
    {label: 'Продвинутый', value: 'Продвинутый'},
  ];

  const handleSignUp = () => {
    dispatch(userRegister({login, password_hash: password, type, name}));
  };

  return (
    <SafeAreaView
      style={[GlobalStyles.container, GlobalStyles.flexJustifyCenter]}>
      <View style={[GlobalStyles.mb10]}>
        <Input
          value={login}
          onChange={text => setLogin(text)}
          placeholder="Email"
        />
      </View>
      <View style={[GlobalStyles.mb10]}>
        <Input
          value={name}
          onChange={text => setName(text)}
          placeholder="Имя"
        />
      </View>
      <View style={[GlobalStyles.mb10]}>
        <Input
          value={password}
          onChange={text => setPassword(text)}
          placeholder="Пароль"
          secure={true}
        />
      </View>
      <View style={[GlobalStyles.mb10]}>
        <Select
          placeholder="Уровень"
          items={levels}
          handleChange={val => {
            setType(val);
          }}
          value={type}
        />
      </View>
      <View style={[GlobalStyles.mb10]}>
        <Button title="Зарегистрироваться" handleClick={handleSignUp} />
      </View>
      <View style={[GlobalStyles.flexRow, GlobalStyles.flexJustifyCenter]}>
        <Text style={[GlobalStyles.textBlack]}>Есть аккаунт? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <Text style={[GlobalStyles.textPrimary]}>Войти</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignUpScreen;
