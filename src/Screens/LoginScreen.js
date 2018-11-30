import React, { Component } from 'react';
import { db } from 'firebase/index.js';
import Player from 'Models/Player.js'
import Session from 'Session'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';

window.Session = Session

export default class LoginScreen extends Component {
  constructor(props) {
      super(props)
      this.state = {
        username: 'P 1',
        password: '',
        loading: false
      }
      this.login = this.login.bind(this);
  }
  alertLoginError (error) {
    console.error(error)
    alert('login error')
  }
  login () {
    window._p = this.props
    this.setState({ loading: true })

    db.collection('players').where('name', '==', this.state.username)
      .limit(1)
      .get()
      .then(querySnapshot => {
        this.setState({ loading: false })
        window._querySnapshot = querySnapshot
        let doc = querySnapshot.docs[0]
        if (doc) {
          let data = doc.data()
          data.id = doc.id
          try {
            // await
            // local storage
          } catch (error) {
            // Error saving data
          }

          let user = new Player(data)

          Session.user(user)

          // localStorage.setItem('user', user.toString())
          // redirect to home
          this.props.history.push('/home')
        } else {
          this.alertLoginError()
        }
      }).catch(error => {
        this.setState({ loading: false })
        this.alertLoginError(error)
      })

  }
  render() {
    if (this.state.loading) {
      return (
        <CircularProgress color="secondary" />
      )
    }
    // <Header />
    return (
      <form noValidate autoComplete="off">
        <TextField
          id="username"
          label="Username"
          onChange={(username) => this.setState({ username })}
          value={this.state.username}
          margin="normal"
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          margin="normal"
          onChange={(password) => this.setState({ password })}
          value={this.state.password}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={this.login}
        >
          Ingresar
        </Button>
      </form>
    );
  }
}
