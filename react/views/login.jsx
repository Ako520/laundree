/**
 * Created by budde on 11/06/16.
 */
const React = require('react')
const DocumentTitle = require('react-document-title')
const {Link} = require('react-router')
const {ValidationForm, ValidationElement} = require('./validation')
const {generateChangeHandler} = require('../../utils/react')
class LogIn extends React.Component {

  constructor (props) {
    super(props)
    this.state = {values: {}}
  }

  render () {
    return <DocumentTitle title='Login'>
      <div>
        <h1>
          Log in to
        </h1>
        <Link to='/' id='Logo'>
          <svg>
            <use xlinkHref='#Logo'/>
          </svg>
        </Link>
        <div className='auth_alternatives'>
          <a href='/auth/facebook' className='facebook'>
            <svg>
              <use xlinkHref='#Facebook'/>
            </svg>
            Log in with Facebook
          </a>
          <a href='/auth/google' className='google'>
            <svg>
              <use xlinkHref='#GooglePlus'/>
            </svg>
            Log in with Google
          </a>
        </div>
        <div className='or'>
          <span>OR</span>
        </div>
        <ValidationForm id='SignIn' method='post' action='/auth/local'>
          {this.props.flash.length
            ? <div className={'notion ' + this.props.flash[0].type}>{this.props.flash[0].message}</div>
            : null}
          <ValidationElement email trim value={this.state.values.email || ''}>
            <label
              data-validate-error='Please enter a valid e-mail address'>
              <input
                type='text'
                name='username'
                placeholder='E-mail address'
                value={this.state.values.email || ''}
                onChange={generateChangeHandler(this, 'email')}/>
            </label>
          </ValidationElement>
          <ValidationElement
            value={this.state.values.password || ''}
            nonEmpty trim>
            <label
              data-validate-error='Please enter a password'>
              <input
                type='password' name='password' placeholder='Password'
                value={this.state.values.password || ''}
                onChange={generateChangeHandler(this, 'password')}/>
            </label>
          </ValidationElement>
          <div className='buttons'>
            <input type='submit' value='Log in'/>
          </div>
          <div className='forgot'>
            <div>
              Forgot your password?{' '}
              <Link to='/auth/forgot' className='forgot'>Let us send you a new one.</Link>
            </div>
            <div>
              Do you not have an account?{' '}
              <Link to='/auth/sign-up'>Sign-up here.</Link>
            </div>
          </div>
        </ValidationForm>
        <div className='notice'>
          Notice: By logging in without an account, we will register you and you will be accepting our{' '}
          <a href='/auth/terms-and-conditions' target='_blank'>Terms and Conditions</a>,{' '}
          <a href='/auth/cookie-policy' target='_blank'>Cookie Policy</a>, and{' '}
          <a href='/auth/privacy-policy' target='_blank'>Privacy Policy</a>.
        </div>
      </div>
    </DocumentTitle>
  }
}

LogIn.propTypes = {
  flash: React.PropTypes.arrayOf(React.PropTypes.shape({
    type: React.PropTypes.string.isRequired,
    message: React.PropTypes.string.isRequired
  })).isRequired
}

module.exports = LogIn
