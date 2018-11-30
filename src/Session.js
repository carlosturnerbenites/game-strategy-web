import Player from 'Models/Player'
import Room from 'Models/Room'

export default class Session {
  static user (player = null) {
    if (player === null) {
      return new Player(JSON.parse(localStorage.getItem('user')))
    } else {

      localStorage.setItem('user', JSON.stringify(player.getAttributes()))
    }
  }

  static room (room = null) {
    if (room === null) {
      return new Room(JSON.parse(localStorage.getItem('room')))
    } else {

      localStorage.setItem('room', JSON.stringify(room.getAttributes()))
    }
  }

  static config (config = null) {
    if (config === null) {
      return JSON.parse(localStorage.getItem('config'))
    } else {

      localStorage.setItem('config', JSON.stringify(config))
    }
  }
}
