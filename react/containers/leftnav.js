/**
 * Created by budde on 28/05/16.
 */

const connect = require('react-redux').connect
const {LeftNav} = require('../views')

const mapStateToProps = ({users, laundries, currentUser}, {params: {id}}) => {
  return {
    laundries,
    currentLaundry: id,
    currentUser,
    users
  }
}

module.exports = connect(mapStateToProps)(LeftNav)
