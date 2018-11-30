import React from 'react';
import { StyleSheet, AsyncStorage, View } from 'react-native';
import { Button, Text, Container } from 'native-base'
import { withNavigation } from 'react-navigation';

class Logout extends React.Component {
  constructor(props) {
    super(props)

    this.logout = this.logout.bind(this)
  }
  async logout () {
    await AsyncStorage.removeItem('name')
    await AsyncStorage.removeItem('config')
    const { navigate } = this.props.navigation;
    navigate('Login')
  }
  render () {
    return (
      <View style={{ flexDirection: "row", flex: 1, justifyContent: 'flex-end'}}>
        <Button onPress={this.logout} danger><Text> Salir </Text></Button>
      </View>
    );
  }
}

export default withNavigation(Logout);

const styles = StyleSheet.create({});
