import {View, Text} from 'react-native';
import React from 'react';
import {Picker} from '@react-native-picker/picker';
import {GlobalStyles} from '../constants/globalStyles';
import {Colors} from '../constants/colors';

const Select = ({
  value,
  handleChange,
  placeholder = 'Выберите',
  items = [],
}) => {
  return (
    <View
      style={[
        GlobalStyles.borderRadius10,
        GlobalStyles.bgWhite,
        GlobalStyles.border,
      ]}>
      <Picker
        selectedValue={value}
        onValueChange={(value, index) => handleChange(value)}
        style={[
          GlobalStyles.textBlack,
          GlobalStyles.fontSize14,
          {marginTop: -5},
        ]}
        itemStyle={[GlobalStyles.textBlack, GlobalStyles.fontSize14]}
        dropdownIconColor={Colors.darkGray}>
        <Picker.Item label={placeholder} value="" />
        {items.map((item, index) => (
          <Picker.Item label={item.label} value={item.value} key={index} />
        ))}
      </Picker>
    </View>
  );
};

export default Select;
