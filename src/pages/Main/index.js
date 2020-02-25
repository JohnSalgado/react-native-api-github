import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Keyboard, ActivityIndicator, Text } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import Icon from 'react-native-vector-icons/MaterialIcons'
import api from '../../services/api'

import { Container, Form, Input, SubmitButton, List, User, Avatar, Name, Bio, ProfileButton, ProfileButtonText, ProfileButtonRemove, ProfileButtonRvText, Profile, TextError } from './styles'

export default class Main extends Component {
  static navigationOptions = {
    title: 'Usuários',
  }

  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
    }).isRequired,
  }

  state = {
    newUser: '',
    users: [],
    loading: false,
    requestError: false,
  }

  async componentDidMount() {
    const users = await AsyncStorage.getItem('users')
    if (users) {
      this.setState({ users: JSON.parse(users) })
    }
  }

  async componentDidUpdate(_, prevState) {
    const { users } = this.state

    if (prevState.users !== users) {
      AsyncStorage.setItem('users', JSON.stringify(users))
    }
  }

  async removeUser(userSelected) {
    let getuser = await AsyncStorage.getItem('users')
    let userparse = JSON.parse(getuser)
    let newArray = userparse.filter(user => user.login !== userSelected.login)
    this.setState({users: newArray})
    await AsyncStorage.setItem("users", JSON.stringify(newArray))
  }

  handleAddUser = async () => {

    const { users, newUser } = this.state

    this.setState({ loading: true })
    try{
      const response = await api.get(`/users/${newUser}`)
  
      const data = {
        name: response.data.name,
        login: response.data.login,
        bio: response.data.bio,
        avatar: response.data.avatar_url,
      }
  
      this.setState({
        users: [...users, data],
        newUser: '',
        loading: false,
        requestError: false,
      })

    } catch (error) {
      this.setState({requestError: true, loading: false})
    }


    Keyboard.dismiss()
  }

  handleNavigate = (user) => {
    const { navigation } = this.props

    navigation.navigate('User', { user })
  }

  render() {
    const { users, newUser, loading, requestError } = this.state;

    return (
      <Container>
        <Form>
          <Input
          autoCorrect={false}
          autoCapitalize="none"
          placeholder="Adicionar usuário"
          value={newUser}
          onChangeText={text => this.setState({newUser: text})}
          returnKeyType="send"
          onSubmitEditing={this.handleAddUser}
          />
          <SubmitButton loading={loading} onPress={this.handleAddUser}>
            { loading ? <ActivityIndicator color="#FFF" /> : <Icon name="add" size={20} color="#FFF" />}
          </SubmitButton>
        </Form>
        {requestError && 
          <TextError>Usuário não encontrado</TextError>
        }

        <List
          data={users}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <User>
              <Avatar source={{ uri: item.avatar }} />
              <Name>{item.name}</Name>
              <Bio>{item.bio}</Bio>

              <Profile>
                <ProfileButton onPress={() => this.handleNavigate(item)}>
                  <ProfileButtonText>Ver perfil</ProfileButtonText>
                </ProfileButton>
                <ProfileButtonRemove onPress={() => this.removeUser(item)}>
                  <ProfileButtonRvText>Remover perfil</ProfileButtonRvText>
                </ProfileButtonRemove>
              </Profile>
            </User>
          )}
        />
      </Container>
    )
  }
}
