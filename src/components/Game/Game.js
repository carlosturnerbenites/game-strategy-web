import React from 'react';
import { db } from 'firebase/index.js';
import Player from 'Models/Player'
import Box from 'components/Game/Box.js'
import Board from 'Models/Board'
import Session from 'Session'
import Icon from '@material-ui/core/Icon';

export default class Game extends React.Component {
  playersWatcher = null
  boardWatcher = null
  BoardTrapsWatcher = null
  BoardFallsWatcher = null

  sound = null

  constructor(props) {
    super(props)

    const user = props.user
    const room = props.room
    const loading = true

    const board = null
    Board.find(room.board, (board) => {
      this.setState({ board, loading: false })
      // Session.board(board)
      this.boardWatcher = this.state.board.watch(this.onUpdateBoard)
      this.BoardTrapsWatcher = this.state.board.watchTraps(this.onUpdateTraps)
      this.BoardFallsWatcher = this.state.board.watchFalls(this.onUpdateFalls)
    })

    this.state = {
      loading,
      board,
      players: [],
      traps: [],
      newFalls: [],
      falls: [],
      user,
      room,
      configuring: false,
      moving: false,
      invalidMove: false,
      play: true,
      counter: null,
      time: null,
      config: null
    }

    this.onClickBox = this.onClickBox.bind(this);
  }
  timeConfiguring () {
    console.log('this.state', this.state)
    this.setState({ configuring: true, play: true })
    var counter = 10 // this.state.config.configTime;
    let interval = setInterval(() => {
      this.setState({ counter })
      counter--
      if (counter <= 0) {
        this.setState({ configuring: false })
        clearInterval(interval)
        this.timerGame()
      }
    }, 1000);
  }
  evaluateGame = () => {
    // verificar

    let width = this.state.config.widthBoard
    // let middle = Math.round(width/2)
    // let height = this.state.config.heightBoard

    let players = this.state.players.filter(player => player.alive)

    let teamOne = players.filter(player => player.team === 1)
    let teamOneWins = teamOne.filter(player => player.y === (width - 1))

    let teamTwo = players.filter(player => player.team === 2)
    let teamTwoWins = teamTwo.filter(player => player.y === 0)

    let msg = ''

    if (teamOneWins.length === teamTwoWins.length) {
      msg = 'Empate'
    } else if (teamOneWins.length > teamTwoWins.length) {
      msg = 'Gana el equipo 1'
    } else {
      msg = 'Gana el equipo 2'
    }
    alert('termino ' + msg)
    this.props.onFinish()
  }
  timerGame = () => {
    this.setState({ play: true })
    let board = this.state.board;
    let intervalGame = setInterval(() => {
      board.time--
      if (board.time <= 0) {
        clearInterval(intervalGame)
        this.setState({ play: false })
        this.evaluateGame()
      }
      this.setState({ board })
      // Session.board(board)
    }, 1000);
  }
  moveTo (box) {
    if (this.state.moving) return

    let user = this.state.user

    if (!user.alive) {
      return alert('You Dead')
    }

    /*
    if (!user.canMoveToBox(box)) {
      return this.alert('Movimiento invalido')
    }
    */

   this.setState({moving: true})
    user.canMoveToBox(box).then(can => {
      if (can) {
        let traps = this.state.traps.filter(trap => trap.x === box.x && trap.y === box.y)
        user.moveToBox(box, traps, this.state.room).then(newUser => {
          this.setState({moving: false})
        })
      } else {
        this.setState({moving: false})
        this.setState({invalidMove: true})
        setTimeout(() => {
          this.setState({invalidMove: false})
        }, 300);
      }
    })

  }
  setTrap (box) {
    const MAX_TRAPS_BY_PLAYER = 3

    return db
      .collection('boards')
      .doc(this.state.board.id)
      .collection('traps')
      .where('user', '==', this.state.user.id)
      .get()
      .then(query => {
        let count = query.docs.length
        console.log('count', count)
        if (count >= MAX_TRAPS_BY_PLAYER) {
          console.log('err')
          throw new Error('Max Traps')
        } else {
          return db
            .collection('boards')
            .doc(this.state.board.id)
            .collection('traps')
            .add({
              x: box.x,
              y: box.y,
              user: this.state.user.id,
              team: this.state.user.team,
            })
        }
      })

  }
  onClickBox (box) {
    if (!this.state.play) return this.alert('Game End')

    if (this.state.configuring) {
      this.setTrap(box)
      .catch(err => {
        alert('No se puede poner la bomba')
      })
    } else {
      this.moveTo(box)
    }
  }
  render () {
    if (this.state.loading) {
      return <div>
        <p>Cagando...</p>
      </div>
    }
    let user
    if (this.state.user) {
      let invalidMove
      let moving
      if (this.state.moving) {
        moving = <Icon style={{ fontSize: 16 }}>alarm</Icon>
      }
      if (this.state.invalidMove) {
        invalidMove = <Icon style={{ fontSize: 16, color: 'red' }}>highlight_off</Icon>
      }
      let lives = []
      for (let index = 0; index < this.state.user.lives; index++) {
        lives.push(<Icon key={index} style={{ color: 'red' }}>heart</Icon>)
      }
      user = <p style={{textAlign: 'center', flex: 1}}>
        <Icon style={{ fontSize: 16 }}>this.state.user.icon</Icon>
        {this.state.user.name}
        {moving}
        {lives}
        {invalidMove}
      </p>
    }
    let timer
    if (this.state.configuring) {
      timer = <p style={{textAlign: 'center', flex: 1}}>Tiempo: {this.state.counter}</p>
    }
    let timerGame
    if (this.state.play) {
      timerGame = <p style={{textAlign: 'center', flex: 1}}>Tiempo Juego: {this.state.board.time}</p>
    }
    return (
      <div style={styles.container}>
        <div style={styles.info}>
          {timerGame}
          {timer}
          {user}
        </div>
        <div style={this.getStylesBoard()}>
          {
            this.state.board.matrix.map((row, iRow) => {
              return (<div
                style={styles.row}
                key={`row_${iRow}`}
              >
                {
                  row.map((box, iCol) => {
                    return <div
                      key={`col_${iCol}`}
                      onClick={() => this.onClickBox(box)}
                      style={styles.box}
                    >
                      <Box
                        box={box}
                        player={this.state.players.find(player => player.x === box.x && player.y === box.y)}
                        traps={this.state.traps.filter(trap => trap.x === box.x && trap.y === box.y && trap.team === this.state.user.team)}
                        falls={this.state.newFalls.filter(fall => fall.x === box.x && fall.y === box.y)}
                        showTraps={this.state.configuring && this.state.play}
                      ></Box>
                    </div>
                  })
                }
              </div>)
            })
          }
        </div>
      </div>
    );
  }
  onUpdatePlayer = (players) => {
    this.setState(previousState => {
      previousState.players = players
      return previousState
    });
  }
  getStylesBoard = () => {
    return {
      flex: 1,
      width: 50 * this.state.config.widthBoard,
    }
  }
  onUpdateBoard = (newBoard) => {
    // this.setState({ time: newBoard.time })
  }
  onUpdateTraps = (traps) => {
    this.setState({ traps })
  }
  onUpdateFalls = (falls) => {
    let ids = this.state.falls.map(fall => fall.id) // ids de los ya existentes
    let newFalls = falls.filter(fall => ids.indexOf(fall.id) === -1)

    this.setState({ falls })

    if (newFalls.length > 0) {
      this.setState({ newFalls })
      this.soundBomb()
      setTimeout(() => {
        this.setState({ newFalls: [] })
      }, 500);

    }
  }
  soundBomb = () => {
    /*
    this.sound.play((success) => {
      if (success) {
        console.log('successfully finished playing');
      } else {
        console.log('playback failed due to audio decoding errors');
        // reset the player to its uninitialized state (android only)
        // this is the only option to recover after an error occured and use the player again
        this.sound.reset();
      }
    });
    */
  }
  componentDidMount () {
    const config = Session.config()
    console.log('config', config)
    this.setState({ config })

    /*
    this.sound = new Sound('bomb.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('failed to load the sound', error);
        return;
      }
      // loaded successfully
      console.log('duration in seconds: ' + this.sound.getDuration() + 'number of channels: ' + this.sound.getNumberOfChannels());
    });
    */

    this.playersWatcher = Player.watch(this.onUpdatePlayer)
    this.timeConfiguring()
  }
  unsub () {
    if (this.playersWatcher) { this.playersWatcher() }
    if (this.boardWatcher) { this.boardWatcher() }
    if (this.BoardTrapsWatcher) { this.BoardTrapsWatcher() }
    if (this.BoardFallsWatcher) { this.BoardFallsWatcher() }
  }
  componentWillUnmount () {
    this.unsub()
  }
}

const styles = {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  info: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  box: {
    flex: 1,
    width: 50,
    height: 50,
    border: '0.5 solid #d6d7da',
    backgroundColor: '#DDDDDD',
    display: 'inline-block'
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
}
