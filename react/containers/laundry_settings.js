/**
 * Created by budde on 28/05/16.
 */

const connect = require('react-redux').connect
const {LaundrySettings} = require('../views')

const mapStateToProps = ({users, currentUser, laundries}, {params: {laundryId}}) => {
  return {
    user: users[currentUser],
    laundries,
    currentLaundry: laundryId
  }
}

module.exports = connect(mapStateToProps)(LaundrySettings)
