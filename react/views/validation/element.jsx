const React = require('react')
const regex = require('../../../utils/regex')

var id = 0

function newId () {
  return id++
}

class ValidationElement extends React.Component {

  constructor (props) {
    super(props)
    this.valid = undefined
    this.value = undefined
    this.state = {initial: true}
  }

  handle (valid) {
    valid = Boolean(valid)
    if (valid === this.valid) return
    this.valid = valid
    if (!this.context.validation.handler) return
    this.context.validation.handler(this.name, valid)
  }

  componentDidMount () {
    this.id = newId()
    this.handle(false)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.value === this.props.value) return
    this.setState({initial: false})
  }

  get name () {
    return `id${this.id}`
  }

  validate () {
    var value = this.props.value
    if (this.props.trim) value = value.trim()
    if (this.props.validator) return this.props.validator(value)
    if (this.props.notOneOf) return this.props.notOneOf.indexOf(value) < 0
    if (this.props.nonEmpty) return value
    if (this.props.email) return regex.email.exec(value)
    if (this.props.password) return regex.password.exec(value)
    return true
  }

  componentDidUpdate () {
    this.handle(this.validate())
  }

  render () {
    const valid = this.validate()
    const child = React.Children.only(this.props.children)
    return React.cloneElement(child, {
      className: (child.props.className || '') + (valid ? '' : ' invalid') +
      (this.props.initial || this.state.initial ? ' initial' : '')
    })
  }
}

ValidationElement.contextTypes = {
  validation: React.PropTypes.shape({handler: React.PropTypes.func})
}

ValidationElement.propTypes = {
  children: React.PropTypes.any,
  notOneOf: React.PropTypes.arrayOf(React.PropTypes.string),
  trim: React.PropTypes.bool,
  nonEmpty: React.PropTypes.bool,
  password: React.PropTypes.bool,
  initial: React.PropTypes.bool,
  email: React.PropTypes.bool,
  value: React.PropTypes.string.isRequired,
  validator: React.PropTypes.func
}

module.exports = ValidationElement