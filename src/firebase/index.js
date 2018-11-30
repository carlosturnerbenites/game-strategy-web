import firebase from 'firebase'

import config from './config.js'

export default firebase.initializeApp(config)

const db = firebase.firestore()

const settings = { timestampsInSnapshots: true }

db.settings(settings)

export {
  db
}
