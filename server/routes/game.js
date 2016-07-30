const express = require('express')
const router = express.Router()
const db = require('../database/utils')
const authenticateUserId = require('../auth').authenticateUserId
const gameUtils = require('../database/games_utils')

router.post('/:userid', authenticateUserId, (req, res, next) => {
  // create a new game
  const data = req.body
  data.user_id = req.params.userid
  db.add('games', data, (err, resp) => {
    if (err) {
      console.error(err)
      res.json(err)
    } else {
      res.json({ id: resp })
    }
  })
})

router.get('/', (req, res, next) => {
  gameUtils.getGamesTable()
    .then(games => {
      console.log('hi')
      if (games) {
        res.json(games)
      } else {
        res.sendStatus(404)
      }
    })
    .catch(err => {
      console.error(err)
      res.json(err)
    })
})

router.get('/:id', (req, res, next) => {
  // get a game by id
  const id = req.params.id
  gameUtils.getGame({ user_id: id })
    .then(game => {
      if (game) {
        res.json(game[0])
      } else {
        res.sendStatus(404)
      }
    })
    .catch(err => {
      console.error(err)
      res.json(err)
    })
})

module.exports = router
