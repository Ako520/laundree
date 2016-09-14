const React = require('react')
const DocumentTitle = require('react-document-title')
const {Link} = require('react-router')

class Settings extends React.Component {
  render () {
    const user = this.props.users[this.props.currentUser]
    return <DocumentTitle title='Profile settings'>
      <main className='topNaved' id='Settings'>
        <h1>Profile settings</h1>
        <section>
          <h2>Basic user-info</h2>
          <form>
            <label>
              <input type='text' defaultValue={user.displayName}/>
            </label>
            <div className='buttons'>
              <input type='submit' value='Update name'/>
            </div>
          </form>
        </section>
        <section>
          <h2>Change password</h2>
          <form>
            <label>
              <input type='password' placeholder='Current password'/>
            </label>
            <label>
              <input type='password' placeholder='New password'/>
            </label>
            <label>
              <input type='password' placeholder='Repeat password'/>
            </label>
            <div className='buttons'>
              <input type='submit' value='Change password'/>
            </div>
          </form>
        </section>
        <section>
          <h2>Delete account</h2>
          <p>
            Deleting your account is currently a manual process.<br />
            Please concat us at <a href='mailto:delete-my-account@laundre.io'>delete-my-account@laundre.io</a> if you
            which to do so.
          </p>
        </section>
        <section>
          <h2>Laundries</h2>
          {this.renderLaundries(user)}
        </section>
      </main>
    </DocumentTitle>
  }

  renderLaundries (user) {
    if (user.laundries.length === 0) {
      return <div className='emptyLaundryList'>
        No laundry found.
      </div>
    }
    return <ul className='laundryList'>
      {user.laundries.map(id => this.props.laundries[id]).map(laundry =>
        <li key={laundry.id}>
          <Link to={`/laundries/${laundry.id}`}>{laundry.name}</Link>
        </li>)}
    </ul>
  }

}

Settings.propTypes = {
  currentUser: React.PropTypes.string,
  laundries: React.PropTypes.object,
  users: React.PropTypes.object
}

module.exports = Settings
