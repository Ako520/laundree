/**
 * Created by budde on 31/10/2016.
 */
const {timeout} = require('../nightwatch_utils.js')

module.exports = {
  'Can load front page': client =>
    client
      .url(client.launch_url)
      .waitForElementPresent('#QuickStart', timeout)
      .end(),
  'Can load about page': client =>
    client
      .url(client.launch_url)
      .click('#TopNav a.about')
      .waitForElementPresent('#About', timeout)
      .end(),
  'Can load contact page': client =>
    client
      .url(client.launch_url)
      .click('#TopNav a.contact')
      .waitForElementPresent('#Contact', timeout)
      .end(),
  'Can load auth page': client =>
    client
      .url(client.launch_url)
      .click('#TopNav a.log-in')
      .waitForElementPresent('#Auth', timeout)
      .waitForElementNotPresent('#TopNav', timeout)
      .end(),
  'Can load forgot page': client =>
    client
      .url(client.launch_url)
      .click('#TopNav a.log-in')
      .waitForElementPresent('#Auth', timeout)
      .click('#Auth a.forgot')
      .waitForElementPresent('#ForgotPassword', timeout)
      .end(),
  'Can load sign-up page': client =>
    client
      .url(client.launch_url)
      .click('#TopNav a.log-in')
      .waitForElementPresent('#Auth', timeout)
      .click('#Auth div.forgot div:last-of-type a')
      .waitForElementPresent('#Auth input[name=email]', timeout)
      .waitForElementPresent('#Auth input[name=name]', timeout)
      .waitForElementPresent('#Auth input[name=password]', timeout)
      .end(),
  'Can load front page from auth': client =>
    client
      .url(client.launch_url)
      .click('#TopNav a.log-in')
      .waitForElementPresent('#Auth', timeout)
      .click('a#Logo')
      .waitForElementPresent('#TopNav', timeout)
      .end()
}
