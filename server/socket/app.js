const updateGame = require('../database/games_utils').updateGame
const addComment = require('../database/comments_utils').addComment
const followGame = require('../database/follow').followGame
const unfollowGame = require('../database/follow').unfollowGame
const knex = require('knex')({ client: 'pg' })

// elapsed: '00:00:00' with every socket
function socketServer (io) {
  io.on('connection', (socket) => {
    socket.on('changeTeamScore', (data) => {
      // { team: 'one', gameId: '1', id: null }
      const searchParams = { id: data.gameId }
      const updateInfo = { time_elapsed: data.elapsed, updated_at: knex.fn.now() }
      if (data.team === 'one') {
        updateInfo.team_a_score = data.newScore
      } else if (data.team === 'two') {
        updateInfo.team_b_score = data.newScore
      }
      updateGame(searchParams, updateInfo)
        .then(arr => {
          io.emit('globalUpdate', { id: arr[0] })
        })
        .catch(err => {
          console.log(err)
        })
    })

    socket.on('startGame', (data) => {
      // { gameId: '1', id: null }
      const searchParams = { id: data.gameId }
      const updateInfo = {
        is_running: true,
        is_started: true,
        time_elapsed: 0,
        updated_at: knex.fn.now()
      }
      updateGame(searchParams, updateInfo)
        .then(arr => {
          io.emit('globalUpdate', { id: arr[0] })
        })
        .catch(err => {
          console.log(err)
        })
    })

    socket.on('togglePause', (data) => {
      // { gameId: '1', id: null, is_running: false }
      const searchParams = { id: data.gameId }
      const updateInfo = {
        is_running: data.is_running,
        time_elapsed: data.elapsed,
        updated_at: knex.fn.now()
      }
      updateGame(searchParams, updateInfo)
        .then(arr => {
          io.emit('globalUpdate', { id: arr[0] })
        })
        .catch(err => {
          console.log(err)
        })
    })

    socket.on('stopGame', (data) => {
      // { gameId: '1', id: null }
      const searchParams = { id: data.gameId }
      const updateInfo = {
        is_complete: true,
        is_running: false,
        time_elapsed: data.elapsed,
        updated_at: knex.fn.now()
      }

      updateGame(searchParams, updateInfo)
        .then(arr => {
          io.emit('globalUpdate', { id: arr[0] })
        })
        .catch(err => {
          console.log(err)
        })
    })

    socket.on('addComment', (data) => {
      // { comment: 'dsfsasd', gameId: '1', id: '1' }
      const newData = {
        game_id: data.gameId,
        comment: data.comment
      }

      addComment(newData)
        .then(obj => {
          io.emit('globalUpdate', { id: parseInt(data.gameId) })
        })
        .catch(err => {
          console.log(err)
        })
    })

    socket.on('followGame', (data) => {
      // { gameId: '1', id: '1' }
      followGame(parseInt(data.id), parseInt(data.gameId))
        .then(() => {
          // io.emit('globalUpdate', { id: parseInt(data.gameId) })
        })
        .catch(err => {
          console.log(err)
        })
    })

    socket.on('unfollowGame', (data) => {
      // { gameId: '1', id: '1' }
      unfollowGame(parseInt(data.id), parseInt(data.gameId))
        .then(() => {
          // io.emit('globalUpdate', { id: parseInt(data.gameId) })
        })
        .catch(err => {
          console.log(err)
        })
    })

    socket.on('getTime', () => {
      const time = new Date(Date.now())
      socket.emit('serverTime', { time })
    })
  })

  return io
}

module.exports = socketServer
