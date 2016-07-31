import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import configureStore from './redux/store'
import routes from './components/routes'
import io from 'socket.io-client'
import * as gamesActions from './redux/gamesActions'
import './scss/main.scss'
import 'whatwg-fetch'

export const socket = io()
const store = configureStore()

socket.on('globalUpdate', (data) => {
  store.dispatch(gamesActions.updateGameScore(data.id))
})

const reactRoot = document.getElementById('app')

ReactDOM.render(
  <Provider store={store}>
    {routes}
  </Provider>,
  reactRoot
)

socket.on('message', (data) => {
  switch (data.type) {
    case 'one':
      console.log(data)
      socket.emit('message', data)
      break
    default:
      console.warn('Invalid type: ', data.type)
  }
})
