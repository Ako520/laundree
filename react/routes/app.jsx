/**
 * Created by budde on 05/06/16.
 */
const React = require('react')
const {Route, IndexRoute, IndexRedirect} = require('react-router')
const {
  Users, App, LeftNav, CreateLaundry, Home, Forgot, SignUp, Auth,
  LogIn, Timetable, Bookings, Settings, Machines, Reset
} = require('../containers')
function checkLaundryGenerator (store) {
  return (state, replace) => {
    const {currentUser, users} = store.getState()
    if (!currentUser) return
    const laundries = users[currentUser].laundries
    if (!laundries.length) return
    replace({
      pathname: `/laundries/${laundries[0]}/timetable`
    })
  }
}

function checkExistingLaundryGenerator (store) {
  return checkGenerator(store, (laundry) => laundry)
}

function checkLaundryOwnerGenerator (store) {
  return checkGenerator(store, (laundry, {currentUser}) => laundry && laundry.owners.indexOf(currentUser) >= 0)
}

function checkGenerator (store, check) {
  return (state, replace, callback) => {
    const reduxState = store.getState()
    const {laundries} = reduxState
    const {params: {id}} = state
    const laundry = laundries[id]
    if (check(laundry, reduxState)) return callback()
    const error = new Error('Not found')
    error.status = 404
    callback(error)
  }
}

function routeGenerator (store) {
  const state = store.getState()

  if (state.currentUser) {
    return [
      <Route component={App} path="/">
        <IndexRoute component={CreateLaundry} onEnter={checkLaundryGenerator(store)}/>
        <Route path="laundries/:id" component={LeftNav} onEnter={checkExistingLaundryGenerator(store)}>
          <Route path="timetable" component={Timetable}/>
          <Route path="bookings" component={Bookings}/>
          <Route path="settings" component={Settings}/>
          <Route path="machines" component={Machines} onEnter={checkLaundryOwnerGenerator(store)}/>
          <Route path="users" component={Users} onEnter={checkLaundryOwnerGenerator(store)}/>
        </Route>
      </Route>,
      <Route path="/auth">
        <IndexRedirect to="/"/>
      </Route>]
  }
  return [
    <Route component={App} path="/">
      <IndexRoute component={Home}/>
    </Route>,
    <Route path="/laundries/*">
      <IndexRedirect to="/auth"/>
    </Route>,
    <Route path="/auth" component={Auth}>
      <IndexRoute component={LogIn}/>
      <Route path="forgot" component={Forgot}/>
      <Route path="sign-up" component={SignUp}/>
      <Route path="reset" component={Reset}/>
    </Route>]
}

module.exports = routeGenerator
