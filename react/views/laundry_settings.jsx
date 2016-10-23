const React = require('react')
const DocumentTitle = require('react-document-title')
const Modal = require('./modal.jsx')
const {ValueUpdater} = require('./helpers')
const {ValidationForm, ValidationElement} = require('./validation')
const sdk = require('../../client/sdk')
const moment = require('moment-timezone')

class LaundrySettingsForm extends ValueUpdater {

  constructor (props) {
    super(props)
    this.onSubmit = (evt) => {
      evt.preventDefault()
      this.setState({loading: true})
      sdk.laundry(this.props.laundry.id)
        .updateLaundry({name: this.state.values.name, timezone: this.state.values.timezone})
        .then(() => this.setState({loading: false, notion: null}))
        .catch(err => this.setState({loading: false, notion: {success: false, message: this.errorToMessage(err)}}))
    }
  }

  errorToMessage ({status, message}) {
    switch (status) {
      case 409:
        return 'A laundry by that name already exists'
      case 400:
        return 'Invalid timezone'
      default:
        return message
    }
  }

  get initialValues () {
    return {
      name: this.props.laundry.name,
      timezone: this.props.laundry.timezone
    }
  }

  componentWillReceiveProps ({laundry: {name, timezone}}) {
    if (name === this.props.laundry.name && timezone === this.props.laundry.timezone) return
    this.reset({values: {name, timezone}})
  }

  get nameErrorMessage () {
    return this.state.values.name.trim() ? 'Please enter a new name' : 'Please enter a name'
  }

  get timezoneErrorMessage () {
    const tz = this.state.values.timezone.trim()
    if (!tz) return 'Please enter a timezone'
    if (tz === this.props.laundry.timezone) return 'Please enter a new timezone'
    return 'Please enter a valid timezone'
  }

  get nameErrorValues () {
    if (this.state.values.timezone !== this.props.laundry.timezone) return []
    return ['', this.props.laundry.name]
  }

  get timezoneErrorValues () {
    if (this.state.values.name !== this.props.laundry.name) return []
    return ['', this.props.laundry.timezone]
  }

  render () {
    return <ValidationForm sesh={this.state.sesh} onSubmit={this.onSubmit} className={this.state.loading ? 'blur' : ''}>
      {this.state.notion ? <div
        className={'notion ' + (this.state.notion.success ? 'success' : 'error')}>{this.state.notion.message}</div> : null }
      <ValidationElement sesh={this.state.sesh} value={this.state.values.name} notOneOf={this.nameErrorValues} trim>
        <label data-validate-error={this.nameErrorMessage}>
          <input type='text' value={this.state.values.name} onChange={this.generateValueUpdater('name')}/>
        </label>
      </ValidationElement>
      <ValidationElement
        sesh={this.state.sesh} value={this.state.values.timezone} oneOf={moment.tz.names()} trim>
        <label data-validate-error={this.timezoneErrorMessage}>
          <input type='text' value={this.state.values.timezone} onChange={this.generateValueUpdater('timezone')}/>
        </label>
      </ValidationElement>
      <div className='buttons'>
        <input type='submit' value='Update'/>
      </div>
    </ValidationForm>
  }
}

LaundrySettingsForm.propTypes = {
  laundry: React.PropTypes.object.isRequired
}

class LaundryBookingFormatForm extends ValueUpdater {

  constructor (props) {
    super(props)
    this.onSubmit = (evt) => {
      evt.preventDefault()
      this.setState({loading: true})
      sdk.laundry(this.props.laundry.id)
        .updateLaundry({timezone: this.state.values.timezone})
        .then(() => this.setState({loading: false, notion: null}))
        .catch(err => this.setState({loading: false, notion: {success: false, message: this.errorToMessage(err)}}))
    }
  }

  errorToMessage ({status, message}) {
    switch (status) {
      case 400:
        return 'Invalid timezone'
      default:
        return message
    }
  }

  get initialValues () {
    return {
      timezone: this.props.laundry.timezone
    }
  }

  componentWillReceiveProps ({laundry}) {
    if (laundry.name === this.props.laundry.timezone) return
    this.reset({values: {timezone: laundry.timezone}})
  }

  generateErrorMessage () {
    return this.state.values.timezone.trim() ? 'Please enter a new timezone' : 'Please enter a timezone'
  }

  render () {
    return <ValidationForm sesh={this.state.sesh} onSubmit={this.onSubmit} className={this.state.loading ? 'blur' : ''}>
      {this.state.notion ? <div
        className={'notion ' + (this.state.notion.success ? 'success' : 'error')}>{this.state.notion.message}</div> : null }
      <ValidationElement
        sesh={this.state.sesh} value={this.state.values.timezone} nonEmpty
        trim>
        <label data-validate-error={this.generateErrorMessage()}>
          <input type='text' value={this.state.values.timezone} onChange={this.generateValueUpdater('timezone')}/>
        </label>
      </ValidationElement>
      <div className='buttons'>
        <input type='submit' value='Update'/>
      </div>
    </ValidationForm>
  }
}

LaundryBookingFormatForm.propTypes = {
  laundry: React.PropTypes.object.isRequired
}

class DeleteLaundry extends React.Component {

  constructor (props) {
    super(props)
    this.state = {modalOpen: false}
    this.handleDeleteClick = () => this.deleteLaundry()
    this.handleCloseModal = () => this.setState({modalOpen: false})
    this.handleOpenModal = () => this.setState({modalOpen: true})
  }

  deleteLaundry () {
    return sdk.laundry(this.props.laundry.id).del()
  }

  render () {
    if (this.props.laundry.demo && this.props.user.role !== 'admin') {
      return <div className='text'>
        You can not delete a demo laundry.
      </div>
    }

    return <div className='text'>
      Deleting the laundry will remove all data associated with it and remove all users from it.<br />
      It can NOT be undone!
      <Modal
        show={this.state.modalOpen}
        onClose={this.handleCloseModal}
        message='Are you absolutely sure that you want to delete this laundry?'
        actions={[
          {label: 'Yes', className: 'delete red', action: this.handleDeleteClick},
          {label: 'No', action: this.handleCloseModal}
        ]}/>
      <div className='buttonContainer'>
        <button onClick={this.handleOpenModal} className='red'>Delete Laundry</button>
      </div>
    </div>
  }

}

DeleteLaundry.propTypes = {
  laundry: React.PropTypes.object.isRequired,
  user: React.PropTypes.object.isRequired
}

class LeaveLaundry extends React.Component {

  constructor (props) {
    super(props)
    this.state = {modalOpen: false}
    this.handleDeleteClick = () => this.removeUser()
    this.handleCloseModal = () => this.setState({modalOpen: false})
    this.handleOpenModal = () => this.setState({modalOpen: true})
  }

  removeUser () {
    return sdk.laundry(this.props.laundry.id).removeUserFromLaundry(this.props.user.id)
  }

  render () {
    return <div className='text'>
      If you leave the laundry, all your bookings will be lost.
      <Modal
        show={this.state.modalOpen}
        onClose={this.handleCloseModal}
        message='Are you absolutely sure that you want to leave this laundry?'
        actions={[
          {label: 'Yes', className: 'delete red', action: this.handleDeleteClick},
          {label: 'No', action: this.handleCloseModal}
        ]}/>
      <div className='buttonContainer'>
        <button onClick={this.handleOpenModal} className='red'>Leave Laundry</button>
      </div>
    </div>
  }

}

LeaveLaundry.propTypes = {
  laundry: React.PropTypes.object.isRequired,
  user: React.PropTypes.object.isRequired
}

class LaundrySettings extends React.Component {

  get isOwner () {
    return this.props.user.role === 'admin' || this.laundry.owners.indexOf(this.props.user.id) >= 0
  }

  renderOwnerSettings () {
    if (!this.isOwner) return null
    return <div>
      <section>
        <h2>Change name or timezone</h2>
        <LaundrySettingsForm laundry={this.laundry}/>
      </section>
      <section>
        <h2>Delete laundry</h2>
        <DeleteLaundry laundry={this.laundry} user={this.props.user}/>
      </section>
    </div>
  }

  get laundry () {
    return this.props.laundries[this.props.currentLaundry]
  }

  renderUserSettings () {
    return <section>
      <h2>Leave laundry</h2>
      <LeaveLaundry laundry={this.laundry} user={this.props.user}/>
    </section>
  }

  render () {
    if (!this.laundry) return null
    return <DocumentTitle title='Laundry Settings'>
      <main className='naved' id='LaundrySettings'>
        <h1>Laundry settings</h1>
        {this.isOwner ? this.renderOwnerSettings() : this.renderUserSettings()}
      </main>
    </DocumentTitle>
  }
}

LaundrySettings.propTypes = {
  currentLaundry: React.PropTypes.string,
  laundries: React.PropTypes.object,
  user: React.PropTypes.shape({
    id: React.PropTypes.string,
    role: React.PropTypes.string,
    photo: React.PropTypes.string
  })
}

module.exports = LaundrySettings
