var moment = require('moment');
var email = require('../core/app_modules/email');
var user = require('../core/app_modules/user');
var inv = require('../core/app_modules/inventory');
var co = require('co');
var extend = require('extend');

const DAY_BEFORE_YESTERDAY = moment().subtract(2, 'days');
const YESTERDAY = moment().subtract(1, 'days');
const TOMORROW = moment().add(1, 'days');
const NOW = moment();

var run = co.wrap(function*(from_date, to_date, type) {
  console.log("%s: Sending %s emails.", new Date, type);
  var items = (yield inv.checked_out).filter(function(item) {
    var due = item.due;
    return moment(due).isBefore(to_date) && moment(due).isAfter(from_date);
  });

  if(!items.length) {
    console.log("%s: Nobody to send %s emails to today.", new Date, type);
    process.exit();
  }

  var to_email = {};

  for(var i in items) {
    var owner = items[i].owner;

    if(!to_email[owner]) {
      to_email[owner] = {
        items: [],
        name: null, // filled in below
        email: null // filled in below
      }
    }

    to_email[owner].items.push({
      item: items[i].name,
      due: items[i].due
    });
  }

  var users = Object.keys(to_email);
  to_email = extend(true, to_email, yield user.contactInfo.apply(this, users));

  for(var j in to_email) {
    var data = to_email[j];
    console.log("%s: emailing %s (Netid: %s, Email: %s) about", new Date(), data.name, data.email, j, data.items);
    var fn = (type === 'overdue' ? email.overdue : email.reminder);
    yield fn(data.items, data.name, data.email);
  }
});

var promise = null;

switch(process.argv[2]) {
  case '--overdue':
    promise = run.bind(this, DAY_BEFORE_YESTERDAY, YESTERDAY, 'overdue');
    break;
  case '--reminder':
    promise = run.bind(this, NOW, TOMORROW, 'reminder');
    break;
  default:
    console.error("Usage: send-reminder-emails.sh TYPE\n\nTYPE:\n--overdue\n--reminder");
    process.exit(1);
}

promise().then(process.exit).catch(function(err) {
  console.error(err);
  process.exit(1);
});
