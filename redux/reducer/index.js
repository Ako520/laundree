/**
 * Created by budde on 05/06/16.
 */
const {combineReducers} = require('redux')

module.exports = combineReducers({
  users: require('./users'),
  currentUser: require('./current_user')
})
