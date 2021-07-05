import React, {Component} from 'react';
import {View, Text, ImageBackground, StyleSheet} from 'react-native';
import moment from 'moment';
import 'moment/locale/pt-br';

import commonStyles from '../commonStyles';
import TodayImg from '../../assets/imgs/today.jpg';
import Task from '../components/Task';

export default class TaskList extends Component {

  render() {
    const today = moment().locale('pt-br').format('ddd, D [de] MMMM');

    return (
      <View style={styles.container}>
        <ImageBackground source={TodayImg} style={styles.background}>
          <View style={styles.titleBar}>
            <Text style={styles.title}>Hoje</Text>
            <Text style={styles.subTitle}>{today}</Text>
          </View>
        </ImageBackground>
        <View style={styles.taskList}>
          <Task desc="Comprar livro" estimateAt={new Date()} doneAt={new Date()}/>
          <Task desc="Ler livro" estimateAt={new Date()} doneAt={new Date()}/>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  background: {
    flex: 3
  },
  taskList: {
    flex: 7
  },
  titleBar: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  title: {
    fontFamily: commonStyles.fontFamily,
    fontSize: 50,
    color: commonStyles.colors.secondary,
    marginLeft: 20,
    marginBottom: 20
  },
  subTitle: {
    fontFamily: commonStyles.fontFamily,
    fontSize: 20,
    color: commonStyles.colors.secondary,
    marginLeft: 20,
    marginBottom: 20
  }
});