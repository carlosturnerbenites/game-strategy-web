import React from 'react';
import Player from 'Models/Player'
import Session from 'Session'
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import Icon from '@material-ui/core/Icon';

export default class RoomScreen extends React.Component {
  roomWatcher = null
  playersWatcher = null

  constructor(props) {
    super(props)

    const user = Session.user();
    const room = Session.room();

    this.state = {
      user,
      room,
      players: []
    }
    this.init = this.init.bind(this);
    this.cancel = this.cancel.bind(this);
    this.joinToTeam = this.joinToTeam.bind(this)
  }
  onRoomReady () {
    const { user } = this.state
    // const { room } = this.state

    this.unsub()

    user.toInitialPosition().then(() => {
      this.props.history.push('/board')
    })
  }
  unsub () {
    if (this.roomWatcher) { this.roomWatcher() }
    if (this.playersWatcher) { this.playersWatcher() }
  }
  init () {
    this.state.user.setReady().then((user) => {
      this.setState({ user })
      this.roomWatcher = this.state.room.watch(this.onUpdateRoom)
    }).catch(err => {
      alert.show('Aun no esta listo');
    })
  }
  cancel () {
    this.state.user.setReady(false).then((user) => {
      this.setState({ user })
      if (this.roomWatcher) this.roomWatcher()
    })
  }
  joinToTeam (team) {
    this.state.user.joinToTeam(team).then(user => {
      this.setState({ user })
    }).catch(err => {
      alert('No se puede unir al equipo');
    })
  }
  getPlayerByTeam (team = null) {
    let players = this.state.players.filter(player => player.team === team)
    return <div>{players.map(player => {
      return <Chip
        avatar={<Avatar> <Icon>{player.icon}</Icon> </Avatar>}
        key={`player_${player.id}`}
        label={player.name}
      />
    })}
    </div>

  }
  render () {

    let state = <p></p>

    let currentUser = <Chip
      label={this.state.user.name}
      color="primary"
      avatar={<Avatar><Icon>{this.state.user.icon}</Icon></Avatar>}
      variant="outlined"
    />

    /*
    let currentUser = <div>
      <p>
        <span>{this.state.user.icon}</span>
        {this.state.user.name}
      </p>
    </div>
    */

    if (this.state.user.ready) {
      let playersState = this.state.players.map((player, index) => {
        let icon
        if (player.ready) {
          icon = <span style={{ color: 'green' }}>checkmark-circle</span>
        } else {
          icon = <span style={{ color: 'red' }}>close-circle</span>
        }
        return (<div key={`plaer_state_${index}`}>

          <p style={{ margin: 2 }}>
            {icon}
            {player.name}
          </p>

          <p style={{ margin: 2 }}>
            <span>icon: people</span>
            {player.team}
          </p>
        </div>)
      })
      // <ActivityIndicator size="large" color="#0000ff" />
      return (
        <div style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          {currentUser}

          <p>Listo, Esperando a Jugadores ...</p>

          <div>
            {playersState}
          </div>

          <Button
            variant="contained"
            color="secondary"
            onClick={this.cancel}
          >
            icon: close-circle
          </Button>
        </div>
      )
    }
    return (
      <div style={{ flex: 1, flexDirection: 'column' }}>
        {currentUser}
        <div style={{ flex: 1, flexDirection: 'row' }}>
          <Card style={{ flex: 1 }}>
            <CardContent>
              <div onClick={() => this.joinToTeam(1)}>
                <p>Equipo 1</p>
              </div>
              <div >
                {this.getPlayerByTeam(1)}
              </div>
            </CardContent>
          </Card>
          <Card style={{ flex: 1 }}>
            <CardContent>
              <div onClick={() => this.joinToTeam(2)}>
                <p>Equipo 2</p>
              </div>
              <div >
                {this.getPlayerByTeam(2)}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          {state}
          <Card>
            <CardContent>
              <div>
                {this.getPlayerByTeam(-1)}
              </div>
            </CardContent>
          </Card>

          <Button
            variant="contained"
            color="primary"
            onClick={this.init}
          >
            icon: checkmark-circle"
          </Button>

        </div>
      </div>
    )
  }
  onUpdateRoom = (room) => {
    this.setState({ room })
    if (room.ready) {
      this.onRoomReady()
    }
  }
  onUpdatePlayer = (players) => {
    this.setState({ players });
  }
  componentDidMount () {
    this.state.room.reset()
    this.playersWatcher = Player.watchByRoom(this.state.room.id, this.onUpdatePlayer)
  }
  componentWillUnmount () {
    this.unsub()
  }
}
