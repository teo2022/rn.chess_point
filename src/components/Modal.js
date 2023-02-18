import {View, Text, ActivityIndicator} from 'react-native';
import React from 'react';
import Dialog from 'react-native-dialog';
import {Colors} from '../constants/colors';

const Modal = ({title = '', description = '', visible = false}) => {
  return (
    <View>
      <Dialog.Container visible={visible}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description>{description}</Dialog.Description>
        <ActivityIndicator color={Colors.primary} size="large" />
      </Dialog.Container>
    </View>
  );
};

export default Modal;
