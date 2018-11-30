import React from 'react';
import Game from 'components/Game/Game';
import Session from 'Session'

export default class BoardScreen extends React.Component {
  constructor(props) {
    super(props)

    const user = Session.user()
    const room = Session.room()

    this.state = {
      user,
      room
    }
  }

  onFinish = () => {
    this.state.user.reset().then((user) => {
      this.props.history.push('/home')
    })
  }

  render () {
    return (
      <Game
        user={this.state.user}
        room={this.state.room}
        onFinish={this.onFinish}
      ></Game>
    );
  }
}
