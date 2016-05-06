var request = require('supertest')
var app = require('../../../app')
var chai = require('chai')
chai.use(require('chai-as-promised'))
chai.use(require('chai-things'))
chai.should()
var expect = chai.expect
var assert = chai.assert
var dbUtils = require('../../db_utils')
var _ = require('lodash')
var UserHandler = require('../../../handlers').UserHandler

describe('controllers', function () {
  beforeEach(() => dbUtils.clearDb())
  describe('users', function () {
    this.timeout(20000)
    describe('GET /api/users/id', () => {
      it('should return error', (done) => {
        request(app)
          .get('/api/users/asd123')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .end(function (err) {
            assert(!err)
            done()
          })
      })

      it('should return error on missing but right format', (done) => {
        request(app)
          .get('/api/users/aaaaaaaaaaaaaaaaaaaaaaaa')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .end(function (err) {
            assert(!err)
            done()
          })
      })
      it('should find user', (done) => {
        dbUtils.populateUsers(10).then((users) => {
          request(app)
            .get(`/api/users/${users[5].model.id}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
              assert(!err)
              var u = users[5].toRest()
              u.href = res.body.href
              res.body.should.be.deep.equal(u)
              done()
            })
        })
      })
    })

    describe('GET /api/users', () => {
      it('should return an empty list', (done) => {
        request(app)
          .get('/api/users')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect('Link', /rel=.first./)
          .expect(200)
          .end(function (err, res) {
            // noinspection BadExpressionStatementJS
            assert(!err)
            res.body.should.deep.equal([])
            done()
          })
      })
      it('should limit output size', (done) => {
        dbUtils.populateUsers(100).then((users) => {
          request(app)
            .get('/api/users')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect('Link', /rel=.first./)
            .expect(200)
            .end(function (err, res) {
              assert(!err)
              var arr = _.slice(users, 0, 12).map((user) => user.toRest())
              res.body.forEach((user) => {
                expect(user.href).to.match(new RegExp(`\/api\/users\/${user.id}$`))
                user.href = undefined
                arr.should.include.something.that.deep.equals(user)
              })
              done()
            })
        })
      })
      it('should allow custom output size', (done) => {
        dbUtils.populateUsers(100).then((users) => {
          request(app)
            .get('/api/users')
            .query({page_size: 12})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect('Link', /rel=.first./)
            .expect(200)
            .end(function (err, res) {
              assert(!err)
              var arr = _.slice(users, 0, 12).map((user) => user.toRest())
              res.body.forEach((user) => {
                expect(user.href).to.match(new RegExp(`\/api\/users\/${user.id}$`))
                user.href = undefined
                arr.should.include.something.that.deep.equals(user)
              })
              arr = arr.map((u) => u.id).should.deep.equal(res.body.map((u) => u.id))
              done()
            })
        })
      })
      it('should allow since', (done) => {
        dbUtils.populateUsers(100).then((users) => {
          request(app)
            .get('/api/users')
            .query({since: users[55].model.id, page_size: 1})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect('Link', /rel=.first./)
            .expect(200)
            .end(function (err, res) {
              assert(!err)
              var u = users[56].toRest()
              res.body.forEach((user) => {
                expect(user.href).to.match(new RegExp(`\/api\/users\/${user.id}$`))
                user.href = undefined
                user.should.deep.equal(u)
              })
              done()
            })
        })
      })
      it('should allow email filter', (done) => {
        dbUtils.populateUsers(10).then((users) => {
          request(app)
            .get('/api/users')
            .query({email: users[5].model.emails[0]})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect('Link', /rel=.first./)
            .expect(200)
            .end(function (err, res) {
              assert(!err)
              var u = users[5].toRest()
              u.href = res.body[0].href
              res.body.should.be.deep.equal([u])
              done()
            })
        })
      })
    })

    describe('POST /api/users', () => {
      it('should succede with right body', (done) => {
        request(app)
          .post('/api/users')
          .send({displayName: 'Bob Bobbesen', email: 'bob@example.com', password: 'password1234'})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(() => {
            UserHandler.findFromEmail('bob@example.com').then((u) => {
              u.should.not.be.undefined
              done()
            })
          })
      })
      it('should fail on invalid email in body', (done) => {
        request(app)
          .post('/api/users')
          .send({displayName: 'Bob Bobbesen', email: 'invalid', password: 'password1234'})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end(() => {
            done()
          })
      })
      it('should fail on invalid name in body', (done) => {
        request(app)
          .post('/api/users')
          .send({displayName: '', email: 'a@example.com', password: 'password1234'})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end(() => {
            done()
          })
      })
      it('should fail on invalid password in body', (done) => {
        request(app)
          .post('/api/users')
          .send({displayName: 'Bob', email: 'a@example.com', password: 'asdfg'})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end(() => {
            done()
          })
      })
    })
  })
})
