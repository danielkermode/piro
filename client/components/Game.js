import React from 'react'
import { connect } from 'react-redux'
import { clearGame, fetchGameInfo } from '../redux/gamesActions'
import { getTime } from '../redux/socketActions'
import { Link } from 'react-router'
import ReactTimeout from 'react-timeout'
import Navbar from './Navbar'

class Game extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      // state goes here
      timer: 0,
      syncTime: false
    }
  }

  componentWillMount () {
    this.props.clearGame()
  }

  componentDidMount () {
    this.props.getTime()
    this.props.fetchGameInfo(this.props.params.id)
    this.props.setInterval(() => {
      if (this.props.game.game &&
        this.props.game.game.is_running &&
        this.props.game.game.is_started &&
        !this.props.game.game.is_complete) {
        this.setState({ timer: this.state.timer + 1 })
      }
    }, 1000)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.serverTime) {
      this.sync(nextProps)
    } else if (nextProps.game.game && nextProps.game.game.is_started && !this.state.syncTime) {
      if (!nextProps.game.game.is_running) {
        this.setState({ syncTime: true, timer: nextProps.game.game.time_elapsed })
      } else {
        this.sync(nextProps)
      }
    }
  }

  sync = (nextProps) => {
    const startDate = new Date(nextProps.game.game.updated_at)
    const diff = (this.props.serverTime || Date.now()) - startDate
    const secs = Math.floor(diff / 1000) + nextProps.game.game.time_elapsed
    this.setState({ syncTime: true, timer: secs })
  }

  format = (time) => {
    let hours = Math.floor(time / 3600)
    let minutes = Math.floor((time - (hours * 3600)) / 60)
    let seconds = time - (hours * 3600) - (minutes * 60)

    if (hours < 10) { hours = '0' + hours }
    if (minutes < 10) { minutes = '0' + minutes }
    if (seconds < 10) { seconds = '0' + seconds }
    return hours + ':' + minutes + ':' + seconds
  }

  render () {
    const currentGame = this.props.game
    const currentGameID = currentGame.game && currentGame.game.user_id
    const userID = this.props.user.id
    let date
    let time
    let formatTime = (str) => {
      if (str.length === 11) {
        return str.slice(0, 4) + str.slice(-4)
      } else if (str.length === 10) {
        return str.slice(0, 4) + str.slice(-3)
      }
    }
    if (currentGame.game) {
      const newDate = new Date(currentGame.game.date_time)
      date = newDate.toLocaleDateString('en-NZ')
      time = newDate.toLocaleTimeString('en-NZ')
      time = formatTime(time)
    }
    let orderedComments
    if (currentGame.comments) {
      orderedComments = currentGame.comments.slice().reverse()
    }
    return (
      <div id='game-wrapper'>

        <div id='navbar-wrapper'>
          <Navbar />
        </div>

        <div id='game-header'>
          <h2 className='sport-name'>{currentGame.game && currentGame.game.sport_name}</h2>
          <h3 className='division'>Division</h3>
          <h3>{this.format(this.state.timer.toString())}</h3>
          <h3 className='date-time'>{date} | {time}</h3>
          <h3 className='match-location'>{currentGame.game && currentGame.game.location}</h3>
        </div>

        <div className='game-team-names'>
          <h2 className='team-one'>{currentGame.game && currentGame.game.team_a_name}</h2>
          <h2 className='team-two'>{currentGame.game && currentGame.game.team_b_name}</h2>
        </div>

        <div className='game-score-wrapper'>

          <img src='http://placehold.it/60x60' className='team-logo' />

          <h1 className='game-score'>{currentGame.game && currentGame.game.team_a_score}</h1>

          <h1 className='period'>v</h1>

          <h1 className='game-score'>{currentGame.game && currentGame.game.team_b_score}</h1>

          <img src='http://placehold.it/60x60' className='team-logo' />

        </div>

        {userID && (userID === currentGameID)
        ? <Link to={`/console/${currentGame.id}`} className='console-link'>
          <button>Go to game console</button>
        </Link>
        : null}

        <div className='comment-history'>
          {orderedComments && orderedComments.map((obj, key) => {
            return (
              <p key={key} className='comment'>
                {obj.comment}
              </p>
            )
          })}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    game: state.games.get('currentGame').toJS(),
    user: state.session.get('user').toJS(),
    serverTime: state.session.get('serverTime')
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    clearGame: () => {
      dispatch(clearGame())
    },
    fetchGameInfo: (id) => {
      dispatch(fetchGameInfo(id))
    },
    getTime: () => {
      dispatch(getTime())
    }
  }
}

const GameContainer = connect(mapStateToProps, mapDispatchToProps)(Game)

export default ReactTimeout(GameContainer)
