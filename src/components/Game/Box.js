import React from 'react';
import Icon from '@material-ui/core/Icon';

export default class Board extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      box: props.box,
      player: props.player,
      traps: props.traps,
      showTraps: props.showTraps,
      falls: props.falls,
    }
  }
  render () {
    let player = <p></p>
    if (this.state.player) {
      if (this.state.player.alive) {
        player = <Icon style={{ fontSize: 27, color: 'green' }} >{this.state.player.icon}</Icon>
      } else {
        player = <Icon style={{ fontSize: 27, color: 'red' }} >{this.state.player.icon}</Icon>
      }
    }
    let traps
    if (this.state.showTraps) {
      traps = this.state.traps.map((trap, index) => {
        return <Icon key={index} style={{ fontSize: 14, color: 'red' }}>bug_report</Icon>
      })
    }
    let falls = this.state.falls.map((trap, index) => {
      return <Icon key={index} style={{ fontSize: 14, color: 'yellow' }}>warning</Icon>
    })
    return (
      <div style={{ flexDirection: "row", flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {player}
        {traps}
        {falls}
      </div>
    );
  }
  componentWillReceiveProps (nextProps) {
    // if (nextProps.palyer !== this.state.palyer) {
    this.setState({
      box: nextProps.box,
      player: nextProps.player,
      traps: nextProps.traps,
      showTraps: nextProps.showTraps,
      falls: nextProps.falls,
    });
  }
  componentDidMount () {
  }
}
