import {View, Text, SafeAreaView, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {GlobalStyles} from '../constants/globalStyles';
import Input from '../components/Input';
import Button from '../components/Button';
import {useDispatch} from 'react-redux';
import {userLogin} from '../store/reducers/userReducer';

const SignInScreen = ({navigation}) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const handleSignIn = () => {
    dispatch(userLogin({login, password_hash: password}));
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
          value={password}
          onChange={text => setPassword(text)}
          placeholder="Пароль"
          secure={true}
        />
      </View>
      <View style={[GlobalStyles.mb10]}>
        <Button title="Войти" handleClick={handleSignIn} />
      </View>
      <View style={[GlobalStyles.flexRow, GlobalStyles.flexJustifyCenter]}>
        <Text style={[GlobalStyles.textBlack]}>Нет аккаунта? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={[GlobalStyles.textPrimary]}>Зарегистрироваться</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignInScreen;
