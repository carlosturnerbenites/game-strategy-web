import Model from 'Models/Model'
import { db } from 'firebase/index.js';

class Player extends Model {
  static ref = 'players'
  ref = 'players'

  ramdomBeetwen (min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  toInitialPosition () {
    let config = JSON.parse(localStorage.getItem('config'))

    let width = config.widthBoard
    let height = config.heightBoard
    let x = this.ramdomBeetwen(0, height)
    let position
    if (this.team === 1) {
      position = {
        x,
        y: 0
      }
    } else {
      position = {
        x,
        y: width - 1
      }
    }
    return db
      .collection(Player.ref)
      .doc(this.id)
      .set(position, {
        merge: true
      })
      .then(() => {
        return this.fill(position)
      })


  }
  setReady (ready = true) {
    if (ready) {
      if (this.team === -1) {
        return Promise.reject()
      }
    }
    let data = { ready }
    return db
      .collection(Player.ref)
      .doc(this.id)
      .set(data, {
        merge: true
      })
      .then(() => {
        return this.fill(data)
      })
  }
  moveToBox (box, traps, room) {
    let data = {
      x: box.x,
      y: box.y,
      lives: this.lives,
      alive: this.alive,
    }

    if (traps.length > 0) {
      traps.forEach(trap => {
        db
          .collection('boards')
          .doc(room.board)
          .collection('falls')
          .add({
            x: trap.x,
            y: trap.y,
            user: this.id,
            date: new Date()
          })
      })
      if (traps.length > data.lives) {
        data.lives = 0
      } else {
        data.lives -= traps.length
      }
    }

    if (data.lives === 0) {
      data.alive = false
    }

    return db
      .collection(Player.ref)
      .doc(this.id)
      .set(data, {
        merge: true
      })
      .then(() => {
        return this.fill(data)
      })

  }
  reset () {
    let defaults = {
      alive: true,
      ready: false,
      lives: 3,
      room: null,
      team: -1,
      x: -1,
      y: -1
    }
    return db
      .collection(Player.ref)
      .doc(this.id)
      .set(defaults, {
        merge: true
      })
      .then(() => {
        return this.fill(defaults)
      })

  }
  joinToTeam (team) {
    const MAX_SIZE_TEAM = 3

    return db.collection(Player.ref)
      .where('team', '==', team)
      .where('room', '==', this.room)
      .get()
      .then(query => {
        let count = query.docs.length

        if (count >= MAX_SIZE_TEAM) {
          throw new Error('Mx Size Team')
        } else {
          let data = { team }
          return db
            .collection(Player.ref)
            .doc(this.id)
            .set(data, {
              merge: true
            })
            .then(() => {
              return this.fill(data)
            })
        }

      })
  }
  joinToRoom (room) {
    let data = { room }
    return db
      .collection(Player.ref)
      .doc(this.id)
      .set(data, {
        merge: true
      })
      .then(() => {
        return this.fill(data)
      })
  }
  canMoveToBox (box) {
    if (this.x === box.x && this.y === box.y) {
      // Moverse al mismo lugar
      return Promise.resolve(false)
    }
    if (
      (box.x > this.x + 1 || box.x < this.x - 1) ||
      (box.y > this.y + 1 || box.y < this.y - 1)
    ) {
      // Moverse a mas de una casilla de distancia
      return Promise.resolve(false)
    }
    return this.positionFree(box.x, box.y)
    // return Promise.resolve(true)
  }
  positionFree (x, y) {
    return db.collection(this.ref)
      .where('x', '==', x)
      .where('y', '==', y)
      .where('room', '==', this.room)
      .get()
      .then(querySnapshot => {
        let count = querySnapshot.docs.length
        if (count > 0) {
          return false
        } else {
          return true
        }
      })
  }
  static findByName (name) {
    if (!name) return Promise.reject(new Error('Invalid Param Name'))

    return db.collection(this.ref).where('name', '==', name)
      .limit(1)
      .get()
      .then(querySnapshot => {
        let doc = querySnapshot.docs[0]
        if (doc) {
          let data = doc.data()
          data.id = doc.id
          return new Player(data)
        } else {
          throw Error('Jugador No encontrado')
        }
      })
  }
  static watchByRoom (roomId, onOk) {
    return db.collection(this.ref)
      .where('room', '==', roomId)
      .onSnapshot(querySnapshot => {
        var players = []
        querySnapshot.forEach(doc => {
          let data = doc.data()
          data.id = doc.id
          players.push(new Player(data))
        })
        return onOk(players)
      })
  }
}

export default Player
