import {Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {GlobalStyles} from '../constants/globalStyles';

const Button = ({handleClick, title}) => {
  return (
    <TouchableOpacity
      onPress={handleClick}
      style={[
        GlobalStyles.pt15,
        GlobalStyles.pb15,
        GlobalStyles.pl10,
        GlobalStyles.pr10,
        GlobalStyles.borderRadius10,
        GlobalStyles.bgPrimary,
      ]}>
      <Text style={[GlobalStyles.textWhite, GlobalStyles.textCenter]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
