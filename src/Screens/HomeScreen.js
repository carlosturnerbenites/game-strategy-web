import React, { Component } from 'react';
import Room from 'Models/Room'
import { db } from 'firebase/index.js';
// import Player from 'Models/Player'
import Session from 'Session'

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Icon from '@material-ui/core/Icon';

export default class HomeScreen extends Component {
  constructor (props) {
    super(props)
    const user = Session.user()
    // check user
    this.state = {
      user: user,
      rooms: []
    }
    this.joinToRoom = this.joinToRoom.bind(this)
  }
  onUpdateRooms = (rooms) => {
    this.setState(previousState => {
      previousState.rooms = rooms
      return previousState
    });
  }
  loadRooms () {
    Room.watch(this.onUpdateRooms)
  }
  joinToRoom (room) {
    const { user } = this.state

    user.room = room.id

    db.collection('players').doc(user.id)
      .set(user.getAttributes())
      .then(() => {
        Session.room(room)
        this.props.history.push('/room')
      })
  }
  render() {
    let rooms = <div>
      {
        this.state.rooms.map(room => {
          return <ListItem key={`room_${room.id}`} onClick={(e) => this.joinToRoom(room)}>
              <ListItemIcon>
              <Icon>star</Icon>
              </ListItemIcon>
              <ListItemText inset primary={room.name} />
            </ListItem>
        })
      }
    </div>

    let username
    if (this.state.user) {
      username = this.state.user.name
    }

    return (
      <div>
        <p>Welcome {username}</p>
        <List>
          {rooms}
        </List>
      </div>
    );
  }
  componentDidMount () {
    this.loadRooms()
    const config = Session.config()
    console.log('config', config)
    if (config === null) {
      db
        .collection('config')
        .doc('default')
        .get()
        .then(doc => {
          Session.config(doc.data());
        })
    }
  }
}
