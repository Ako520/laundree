/**
 * Created by budde on 02/06/16.
 */
const {LaundryModel} = require('../models')
const Handler = require('./handler')
const MachineHandler = require('./machine')

class LaundryHandler extends Handler {

  static find (filter, limit) {
    return this._find(LaundryModel, LaundryHandler, filter, limit)
  }

  /**
   * Find an handler from given id.
   * @param id
   * @returns {Promise.<TokenHandler>}
   */
  static findFromId (id) {
    return this._findFromId(LaundryModel, LaundryHandler, id)
  }

  /**
   * Create a new laundry.
   * @param {UserHandler} owner
   * @param {string} name
   * @return {Promise.<LaundryHandler>}
   */
  static _createLaundry (owner, name) {
    return new LaundryModel({
      name: name,
      owners: [owner.model._id],
      users: [owner.model._id]
    })
      .save()
      .then((model) => new LaundryHandler(model))
  }

  /**
   * Delete the Laundry
   * @return {Promise.<LaundryHandler>}
   */
  _deleteLaundry () {
    return this.model.remove().then(() => this)
  }

  /**
   * Eventually returns true iff the given user is a user of the laundry
   * @param {UserHandler} user
   * @return {boolean}
   */
  isUser (user) {
    const users = this.model.populated('users') || this.model.users
    return users.find((owner) => user.model._id.equals(owner))
  }

  /**
   * Eventually returns true iff the given user is a owner of the laundry
   * @param {UserHandler} user
   * @return {boolean}
   */
  isOwner (user) {
    const users = this.model.populated('owners') || this.model.owners
    return users.find((owner) => user.model._id.equals(owner))
  }

  /**
   * Create a new machine with given name
   * @param {string} name
   * @return {Promise.<MachineHandler>}
   */
  createMachine (name) {
    return MachineHandler._createMachine(this, name).then((machine) => {
      this.model.machines.push(machine.model._id)
      return this.model.save().then(() => machine)
    })
  }

  /**
   * Delete the given machine.
   * @param {MachineHandler} machine
   * @return {Promise}
   */
  deleteMachine (machine) {
    return machine._deleteMachine()
      .then(() => {
        this.model.machines.pull(machine.model._id)
        return this.model.save()
      })
      .then(() => this)
  }

  /**
   * Add a user
   * @param {UserHandler} user
   * @return {Promise.<LaundryHandler>}
   */
  _addUser (user) {
    if (this.isUser(user)) return Promise.resolve(this)
    this.model.users.push(user.model._id)
    return this.model.save().then((model) => {
      this.model = model
      return this
    })
  }

  /**
   * Will remove given user from laundry. Both as user or potential owner.
   * @param {UserHandler} user
   * @return {Promise.<LaundryHandler>}
   */
  _removeUser (user) {
    this.model.users.pull(user.model._id)
    this.model.owners.pull(user.model._id)
    return this.model.save().then((m) => {
      this.model = m
      return this
    })
  }

  toRest () {
    const UserHandler = require('./user')
    return LaundryModel.populate(this.model, {path: 'owners users'}).then((model) => ({
      name: model.name,
      id: model.id,
      href: `/api/laundries/${this.model.id}`,
      owners: model.owners.map((m) => new UserHandler(m).toRestSummary()),
      users: model.users.map((m) => new UserHandler(m).toRestSummary())
    }))
  }

  toRestSummary () {
    return {name: this.model.name, id: this.model.id, href: `/api/laundries/${this.model.id}`}
  }
}

module.exports = LaundryHandler
