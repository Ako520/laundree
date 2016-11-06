/**
 * Created by budde on 11/06/16.
 */
const React = require('react')
const DocumentTitle = require('react-document-title')
const {Link} = require('react-router')
const {ValidationForm, ValidationElement} = require('./validation')
const {ValueUpdater} = require('./helpers')
const sdk = require('../../client/sdk')

class Forgot extends ValueUpdater {
  constructor (props) {
    super(props)
    this.submitHandler = (evt) => {
      this.setState({loading: true})
      evt.preventDefault()
      return sdk.user.forgotPassword(this.state.values.email.toLowerCase())
        .then(
          () =>
            this.reset({
              loading: false,
              message: {message: 'A reset link has been sent.', type: 'success'}
            }),
          () => this.setState({
            loading: false,
            message: {message: 'E-mail not found', type: 'error'}
          }))
    }
  }

  render () {
    return <DocumentTitle title='Reset password'>
      <div>
        <h1>
          Reset your password
        </h1>
        <Link to='/' id='Logo'>
          <svg>
            <use xlinkHref='#Logo'/>
          </svg>
        </Link>
        <ValidationForm
          sesh={this.state.sesh}
          className={this.state.loading ? 'blur' : ''}
          onSubmit={this.submitHandler}
          id='ForgotPassword'>
          {this.state.message
            ? <div className={'notion ' + (this.state.message.type || '')}>{this.state.message.message}</div>
            : null}
          <ValidationElement
            email
            trim
            sesh={this.state.sesh}
            value={this.state.values.email || ''}>
            <label data-validate-error='Please enter your e-mail address.'>
              <input
                onChange={this.generateValueUpdater('email')}
                value={this.state.values.email || ''}
                type='text' name='email'
                placeholder='E-mail address'/>
            </label>
          </ValidationElement>
          <div className='buttons'>
            <input type='submit' value='Reset'/>
          </div>
          <div className='forgot'>
            <div>
              Did you remember your password?{' '}
              <Link to='/auth' className='forgot'>Log in.</Link>
            </div>
            <div>
              Do you not have an account?{' '}
              <Link to='/auth/sign-up'>Sign-up here.</Link>
            </div>
          </div>
        </ValidationForm>
      </div>
    </DocumentTitle>
  }
}

module.exports = Forgot
