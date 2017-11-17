/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Util from './Util'
import TrainData from './train-data'
var stations = TrainData.stations


export default class App extends Component<{}> {

  constructor(props, context) {
    super(props, context)

    this.state = {
      userLoc: null,
      // userLoc: {lat: 35.172181, lng: 136.956921}, //home
      errorMsg: null,
    }

    this.updateLocation = this.updateLocation.bind(this)
    this.renderStation = this.renderStation.bind(this)
    this.renderRail = this.renderRail.bind(this)
  }

  componentDidMount() {
    this.updateLocation()

    //screen update rate of 1 update per second
    this.reRenderTimer = setInterval(() => {
      this.forceUpdate()
    }, 1000)
  }

  componentWillUnmount() {
    clearTimeout(this.userLocTimer)
    clearTimeout(this.reRenderTimer)
  }

  updateLocation() {

    //Update the location of the user every 10 sec
    const queueUpdateLocation = (delay) => {
      this.userLocTimer = setTimeout(this.updateLocation, delay)
    }

    navigator.geolocation.getCurrentPosition((e) => {
      userLoc = {lat: e.coords.latitude, lng: e.coords.longitude}
      this.setState({userLoc, errorMsg:null})
      queueUpdateLocation(10000)
    }, (e) => {
      this.setState({errorMsg: JSON.stringify(e)})
      queueUpdateLocation(5000)
    }, {
      // timeout: 10000,
      maximumAge: 0,
    })

  }

  render() {
    const {userLoc, errorMsg} = this.state

    //sort station list closest to farthest
    if(userLoc)
      stations.sort((a,b) => Util.distanceBetweenLocs(userLoc, a.loc) - Util.distanceBetweenLocs(userLoc, b.loc))

    return (
      <View style={s.container}>
        {!!errorMsg && <Text style={s.errorMessage}>{errorMsg}</Text>}
        {stations.map((station) => this.renderStation(station))}
      </View>
    )
  }

  renderStation(station) {
    const {userLoc} = this.state

    const distanceToStation = userLoc ? Util.distanceBetweenLocs(userLoc, station.loc) : -1

    //fade out box if station is far away to avoid screen clutter
    var stationBoxOpacity = 1.0
    if(distanceToStation != -1 && distanceToStation > 1500)
      stationBoxOpacity = 0.5

    return (
      <View key={station.name} style={[s.stationBox, {opacity:stationBoxOpacity}]}>

        <View style={s.stationHeader}>
          <Text style={s.stationName}>{station.name}</Text>
          {distanceToStation != -1 && <Text style={s.stationDistance}>{parseInt(distanceToStation)+'m'}</Text>}
        </View>

        <View style={s.railsContainer}>
          {this.renderRail(station.rail0, distanceToStation)}
          {this.renderRail(station.rail1, distanceToStation)}
        </View>
      </View>
    )
  }

  renderRail(rail, distanceToStation) {
    const {direction} = rail

    const {nextTrainDigital, countdownMillis, countdownDigital} = Util.getNextTrainDetails(rail)

    const countdownSeconds = countdownMillis / 1000 //number of seconds till next train
    const requiredSpeed = distanceToStation / countdownSeconds //required speed to get to station for next train
    const AVERAGE_WALK_SPEED = 1.38582 //meters per second
    const railHurry = requiredSpeed <= AVERAGE_WALK_SPEED ? {} : s.railHurry //show red text

    return (
      <View key={rail.direction} style={s.railBox}>
        <Text style={s.railName}>{direction}</Text>
        <View style={s.railTimeBox}>
          <Text style={s.railTime}>{nextTrainDigital}</Text>
          <Text style={[s.railCountdown, railHurry]}>{countdownDigital}</Text>
        </View>
      </View>
    )
  }
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: '#212121',
    padding: 4,
  },
  stationBox: {
    flexDirection: 'column',
    alignItems: 'stretch',

    borderColor: '#9E9E9E',
    borderWidth: 2,
    margin: 4,
    backgroundColor: '#283593',
    borderRadius: 4,
    padding: 4,
  },
  stationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    padding: 5,
    marginBottom: 3,
  },
  railsContainer: {
    flexDirection: 'row',
  },
  railBox: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
  },
  stationName: {
    fontSize: 24,
    color: 'white',
  },
  stationDistance: {
    fontSize: 18,
    color: 'white',
  },
  railName: {
    fontSize: 26,
    color: 'white',
  },
  railTimeBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  railTime: {
    fontSize: 22,
    color: 'white',
  },
  railCountdown: {
    fontSize: 14,
    marginLeft: 4,
    color: '#bbb',
  },
  railHurry: {
    color: '#F44336',
  }
});
