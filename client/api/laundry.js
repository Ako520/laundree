/**
 * Created by budde on 06/05/16.
 */
const request = require('superagent')

class LaundryClientApi {

  constructor (id) {
    this.id = id
  }

  static createLaundry (name) {
    return request
      .post('/api/laundries')
      .send({name})
      .then((response) => response.body || null)
  }

  createMachine (name, type) {
    return request
      .post(`/api/laundries/${this.id}/machines`)
      .send({name, type})
      .then()
  }

  inviteUserByEmail (email) {
    return request
      .post(`/api/laundries/${this.id}/invite-by-email`)
      .send({email})
      .then()
  }

  deleteLaundry () {
    return request
      .delete(`/api/laundries/${this.id}`)
      .then()
  }
}

module.exports = LaundryClientApi
