/**
 * Created by budde on 28/05/16.
 */

const connect = require('react-redux').connect
const {App} = require('../views')

const mapStateToProps = ({users, currentUser, laundries, config: {locale}}, {location, params: {laundryId}}) => {
  return {
    locale,
    location,
    user: users[currentUser],
    laundries,
    currentLaundry: laundryId
  }
}

module.exports = connect(mapStateToProps)(App)
