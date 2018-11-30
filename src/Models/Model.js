import Connection from 'Models/Connection'
import { db } from 'firebase/index.js';

class Model {
  connection = new Connection(this.ref)

  constructor(attributes = {}) {
    this.fill(attributes)
  }

  fill (attributes) {
    for (let key in attributes) {
      this.setAttribute(key, attributes[key])
    }

    return this
  }

  setAttribute (key, newValue) {
    this[key] = newValue
    return this
  }

  toString () {
    return JSON.stringify(this)
  }

  getAttributes () {
    let cloned = Object.assign({}, this)
    delete cloned.connection

    return cloned
  }

  static watch (onOk) {
    return db.collection(this.ref)
      .onSnapshot(querySnapshot => {
        var items = []
        querySnapshot.forEach(doc => {
          let data = doc.data()
          data.id = doc.id
          items.push(new this(data))
        })
        return onOk(items)
      })
  }

  static create (data) {
    // this.preCreate(data)
    // data.size = 3

    // this.validate(data)
    // if (!data.name) return

    return db.collection(this.ref).add(data)
      .then(ref => {
        return new this({
          id: ref.id,
          ...data
        })
      });

  }

  static find (id, onOk) {
    return db.collection(this.ref).doc(id)
      .onSnapshot(doc => {
        let data = doc.data()
        data.id = doc.id
        return onOk(new this(data))
      })

  }

  watch (onOk) {
    return db
      .collection(this.ref)
      .doc(this.id)
      .onSnapshot(doc => {
        let data = doc.data()
        data.id = doc.id
        return onOk(new this.constructor(data))
      })
  }
}

export default Model
