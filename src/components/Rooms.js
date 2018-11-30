import React from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { db } from 'strategyMobile/firebase/index.js';
import Room from 'strategyMobile/api/Models/Room'
import { Text, Icon, Button } from 'native-base'
import { withNavigation } from 'react-navigation';
import { Col, Row, Grid } from 'react-native-easy-grid';

class Rooms extends React.Component {
  roomsWatcher = null

  constructor(props) {
    super(props)
    const { navigation } = props;
    const user = navigation.getParam('user', null);
    // check user
    this.state = {
      user: user,
      rooms: [],
      loading: false,
    }
  }
  onUpdateRooms = (rooms) => {
    this.setState({ rooms, loading: false });
  }
  loadRooms () {
    this.setState({ loading: true });
    this.roomsWatcher = Room.watch(this.onUpdateRooms)
  }
  joinToRoom (room) {
    const { user } = this.state
    user.reset().then(newUser => {
      user.joinToRoom(room.id)
        .then(newUser => {
          const { navigate } = this.props.navigation;
          navigate('Room', { room, user })
        })
    })
  }
  render () {
    if (this.state.loading) {
      return (
        <ActivityIndicator size="large" color="#0000ff" />
      )
    }
    let rooms = this.state.rooms.map(room => {
      return <Col key={`room_${room.id}`} size={33}>
          <Button
            iconLeft
            primary
            onPress={(e) => this.joinToRoom(room)}
            block
            style={{marginHorizontal: 5, marginVertical:1}}
          >
            <Icon name={room.icon} />
            <Text>{room.name}</Text>
          </Button>
        </Col>
      })

    return (
      <Grid>
        <Row style={{flexWrap: 'wrap'}}>
          {rooms}
        </Row>
      </Grid>
    );
  }
  componentDidMount () {
    this.loadRooms()
  }
  unsub () {
    if (this.roomsWatcher) { this.roomsWatcher() }
  }
  componentWillUnmount () {
    this.unsub()
  }
}

export default withNavigation(Rooms);

const styles = StyleSheet.create({});
