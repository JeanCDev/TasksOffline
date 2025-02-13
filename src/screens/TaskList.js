import React, {Component} from 'react';
import {View, Text, ImageBackground, StyleSheet, FlatList, TouchableOpacity, Platform, Alert} from 'react-native';
import moment from 'moment';
import 'moment/locale/pt-br';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import {
  server, showError
} from '../common';

import TodayImg from '../../assets/imgs/today.jpg';
import TomorrowImg from '../../assets/imgs/tomorrow.jpg';
import WeekImg from '../../assets/imgs/week.jpg';
import MonthImg from '../../assets/imgs/month.jpg';

import commonStyles from '../commonStyles';
import Task from '../components/Task';
import AddTask from './AddTask';

const initialState = {
  showDoneTasks: false,
  showModal: false,
  visibleTasks: [],
  tasks: []
}
export default class TaskList extends Component {

  state = {
    ...initialState
  }

  toggleTask = async (id) => {
    try {
      await axios.put(`${server}/taskToggle/${id}`);
      await this.loadTasks();
    } catch (err) {
      showError(err);
    }
  }

  toggleFilter = () => {
    this.setState({ showDoneTasks: !this.state.showDoneTasks }, this.filterTasks);
  }

  filterTasks = () => {
    let visibleTasks = null;

    if (this.state.showDoneTasks) {
      visibleTasks = [...this.state.tasks];
    } else {
      const pending = task => task.doneAt === null;

      visibleTasks = this.state.tasks.filter(pending);
    }

    this.setState({ visibleTasks });

    AsyncStorage.setItem('state', JSON.stringify({showDoneTasks: this.state.showDoneTasks}));
  }

  componentDidMount = async () => {
    const stateString = await AsyncStorage.getItem('state');
    const state = JSON.parse(stateString) || initialState;

    this.loadTasks();
    this.setState({showDoneTasks: state.filterTasks});
  }

  loadTasks = async () => {
    try {
      const maxDate = moment().add({days: this.props.daysAhead}).format("YYYY-MM-DD 23:59:59");

      const res = await axios.get(`${server}/tasks?date=${maxDate}`);

      this.setState({ tasks: res.data }, this.filterTasks);
    } catch (err) {
      showError(err);
    }
  }

  openModal = () => {
    this.setState({showModal: true});
  }

  addTask = async (newTask) => {

    if (!newTask.desc || !newTask.desc.trim()) {
      Alert.alert("Dados inválidos", "Descrição não informada");
      return
    }

    try {
      await axios.post(`${server}/tasks`, {
        desc: newTask.desc,
        estimateAt: newTask.date
      });

      this.setState({ showModal: false}, this.loadTasks);
    } catch (err) {
      showError(err);
    }
  }

  deleteTask = async (id) => {
    try {
      await axios.delete(`${server}/tasks/${id}`);
      await this.loadTasks();
    } catch (err) {
      showError(err);
    }
  }

  getImage = () => {
    switch (this.props.daysAhead) {
      case 0: return TodayImg;
      case 1: return TomorrowImg;
      case 7: return WeekImg;
      case 30: return MonthImg;
    }
  }

  getColor = () => {
    switch (this.props.daysAhead) {
      case 0: return commonStyles.colors.today;
      case 1: return commonStyles.colors.tomorrow;
      case 7: return commonStyles.colors.week;
      case 30: return commonStyles.colors.month;
    }
  }

  render() {
    const today = moment().locale('pt-br').format('ddd, D [de] MMMM');

    return (
      <View style={styles.container}>
        <AddTask isVisible={this.state.showModal} onCancel={() => this.setState({showModal: false})} onSave={this.addTask}/>

        <ImageBackground source={this.getImage()} style={styles.background}>
          <View style={styles.iconBar}>
            <TouchableOpacity onPress={this.props.navigation.openDrawer}>
              <Icon name="bars" size={25} color={commonStyles.colors.secondary}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.toggleFilter}>
              <Icon name={this.state.showDoneTasks ? "eye" : 'eye-slash'} size={25} color={commonStyles.colors.secondary}/>
            </TouchableOpacity>
          </View>
          <View style={styles.titleBar}>
            <Text style={styles.title}>{this.props.title}</Text>
            <Text style={styles.subTitle}>{today}</Text>
          </View>
        </ImageBackground>
        <View style={styles.taskList}>
          <FlatList
            data={this.state.visibleTasks}
            keyExtractor={item => String(item.id)}
            renderItem={({item}) => <Task {...item} onDelete={this.deleteTask} onToggleTask={this.toggleTask}/>}/>
        </View>
        <TouchableOpacity style={[styles.addButton, {backgroundColor: this.getColor()}]} activeOpacity={0.7} onPress={this.openModal}>
          <Icon name="plus" size={20} color={commonStyles.colors.secondary}/>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  background: {
    flex: 3,
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
  },
  iconBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: Platform.OS === 'ios' ? 40 : 10
  },
  addButton: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    width: 50,
    height: 50,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center'
  }
});