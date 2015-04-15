var chai = require('chai'),
    expect = chai.expect;

chai.use(require('chai-as-promised'));

describe('calendar', function() {
  beforeEach(require('./resetdb'));
  var cal = require('../core/app_modules/cal');
  
  var username = "prabbit";
  var event = {"user":username, "time":new Date().toLocaleString(), "room":"Recording Studio", "duration":"1", "title":"event title"}
  
  describe('#addCalendarEvent', function() {
    it("should write the event to the database", function*() {
      var promise = cal.addCalendarEvent(username, event, username);
      return expect(promise).to.eventually.be.true;
    });
    it("should not allow overlapping events", function*() {
      var tempPromise = yield cal.addCalendarEvent(username, event, username);
      console.log(tempPromise);
      var promise = cal.addCalendarEvent(username, event);
      return expect(promise).to.eventually.be.rejected;
    });
  });
  
  describe('#deleteCalendarEvent', function() {
    it("should throw an error if user is trying to delete somebody else's event or is not an admin", function*() {
      var username = "fakeuser";
      var promise = cal.deleteCalendarEvent(username, event);
      return expect(promise).to.eventually.be.rejected;
    });
  });
});