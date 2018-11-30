import Model from 'Models/Model'

import Box from 'Models/Box'
import { db } from 'firebase/index.js';

class Board extends Model {
  static ref = 'boards'
  ref = 'boards'

  constructor(attributes = {}) {
    super(attributes)

    this.matrix = []

    this.generateMatrix()
  }
  generateMatrix () {
    for (let h = 0; h < this.height; h++) {
      let row = []
      for (let w = 0; w < this.width; w++) {
        row.push(new Box({ x: h, y: w }))
      }
      this.matrix.push(row)
    }
  }
  watchTraps (onOk) {
    return db
      .collection(this.ref)
      .doc(this.id)
      .collection('traps')
      .onSnapshot(querySnapshot => {
        var items = []
        querySnapshot.forEach(doc => {
          let data = doc.data()
          data.id = doc.id
          items.push(data)
        })
        return onOk(items)
      })
  }
  watchFalls (onOk) {
    return db
      .collection(this.ref)
      .doc(this.id)
      .collection('falls')
      .onSnapshot(querySnapshot => {
        var items = []
        querySnapshot.forEach(doc => {
          let data = doc.data()
          data.id = doc.id
          items.push(data)
        })
        return onOk(items)
      })
  }
}

export default Board
