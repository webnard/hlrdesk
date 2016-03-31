var chai = require('chai'),
    expect = chai.expect;

chai.use(require('chai-as-promised'));

describe('messages page', function() {
  beforeEach(require('./resetdb'));
  var db = require('../core/app_modules/db');
  var msg = require('../core/app_modules/messages');
  var client = db();

  describe('#messages', function() {
    it('should return array if the message exists', function*() {
      expect(yield client.query("SELECT * FROM messages WHERE message_id = 1")).to.not.be.null;
    });    
    it('should return expected properties', function* () {
      var list = yield client.query("SELECT * FROM messages;");
      var keys = 'message_id title username message_body posted'.split(' ');
      expect(list.rows[0]).to.contain.keys(keys);
    });
    it('#messages should contain 6 items from mock data', function*() {
      var list = yield client.query("SELECT * FROM messages");
      expect(list.rows.length).to.equal(6);
    });
    it('should be able to add a message', function*() {
      yield msg.addMessage('test','test','test1');
      var list = yield client.query("SELECT * FROM messages");
      expect(list.rows.length).to.equal(7);
    });
    it('should be able to delete a message', function*() {
      yield msg.deleteMessage('7');
      var list = yield client.query("SELECT * FROM messages");
      expect(list.rows.length).to.equal(6);
    });
    it('should return an empty array if the message does not exist', function*() {
      var list = yield client.query("SELECT * FROM messages WHERE message_id = 10");
      expect(list.rows).to.be.empty;
    });
  });

  describe('#tasks', function() {
    it('should contain 6 items from mock data', function*() {
      var list = yield client.query("SELECT * FROM tasks");
      expect(list.rows.length).to.equal(6);
    });
    it('should add a new task', function*() {
      yield msg.addTask("prabbit", "task test");
      var list = yield client.query("SELECT * FROM tasks");
      expect(list.rows.length).to.equal(7);
    });
    it('should delete a task', function*() {
      yield msg.deleteTask("-1");
      var list = yield client.query("SELECT * FROM tasks");
      expect(list.rows.length).to.equal(6);
    });
  });
});
