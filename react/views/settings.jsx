const React = require('react')
const DocumentTitle = require('react-document-title')
const Modal = require('./modal.jsx')

class Settings extends React.Component {

  constructor (props) {
    super(props)
    this.state = {modalOpen: false}
  }

  get laundry () {
    return this.props.laundries[this.props.currentLaundry]
  }

  deleteLaundry () {
    return this.context.actions
      .deleteLaundry(this.props.currentLaundry)
  }

  render () {
    const handleDeleteClick = () => this.deleteLaundry()
    const handleCloseModal = () => this.setState({modalOpen: false})
    const handleOpenModal = () => this.setState({modalOpen: true})
    return <DocumentTitle title='Settings'>
      <main className='naved' id='LaundryMain'>
        <h1>Laundry settings</h1>
        <section id='DeleteLaundrySettings'>
          <Modal
            show={this.state.modalOpen}
            onClose={handleCloseModal}
            message='Are you absolutely sure that you want to delete this laundry?'
            actions={[
              {label: 'Yes', className: 'delete red', action: handleDeleteClick},
              {label: 'No', action: handleCloseModal}
            ]}/>
          Deleting the laundry will remove all data associated with it and remove all users from it.
          It can NOT be undone!
          <div className='buttonContainer'>
            <button onClick={handleOpenModal} className='red'>Delete Laundry</button>
          </div>
        </section>
      </main>
    </DocumentTitle>
  }
}

Settings.propTypes = {
  currentLaundry: React.PropTypes.string,
  laundries: React.PropTypes.object,
  user: React.PropTypes.shape({
    id: React.PropTypes.string,
    photo: React.PropTypes.string
  })
}
Settings.contextTypes = {
  actions: React.PropTypes.shape({
    deleteLaundry: React.PropTypes.func
  })
}

module.exports = Settings
