import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import './App.css';

import LoginScreen from 'Screens/LoginScreen'

import HomeScreen from './Screens/HomeScreen';
import RoomScreen from './Screens/RoomScreen';
import BoardScreen from './Screens/BoardScreen';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

/*
db.collection('boards').get().then(snapshot => {
  snapshot.forEach(doc => console.log(doc.data()))
})
*/

const theme = createMuiTheme();

class App extends Component {
  render() {
    const About = () => (
      <div>
        <h2>About</h2>
      </div>
    )
    return (
      <MuiThemeProvider theme={theme}>
        <Router>
          <div>
            <ul>
              <li><Link to="/login">LoginScreen</Link></li>
            </ul>

            <hr />

            <Route exact path="/login" component={LoginScreen} />
            <Route path="/about" component={About} />
            <Route path="/home" component={HomeScreen} />
            <Route path="/room" component={RoomScreen} />
            <Route path="/board" component={BoardScreen} />
          </div>
        </Router>
      </MuiThemeProvider>
    );
  }
}

export default App;
