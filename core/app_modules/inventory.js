var moment = require('moment');

var inventory = {};

Object.defineProperty(inventory, 'checked_out', {
  get: getCheckedOut
});

module.exports = inventory;

function getCheckedOut() {
  var a = [];
  for(var i = 0; i<10; i++) {
    a.push(TODO_REMOVE_ME_genFakeItem());
  }
  return Promise.resolve(a);
}

function TODO_REMOVE_ME_genFakeItem() {
  var alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  var callnum = '';

  function randNum(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
  }

  for(var i = 0; i<8; i++) {
    callnum += alpha[randNum(0,alpha.length-1)];
    if(i === 1 || i === 4) {
      callnum += '-';
    }
  }

  var netids = 'jimbowales frankfurter ipecac exegesis2 3peat c2 kelp'.split(' ');
  var names = 'Windows VGA Goat Hamster Cord Cheese Grinch Extreme Mac Keyboard Mellencamp Nodule Pizza Branch HDMI Adapter Recorder Electronic English Multimeter Martian 1080p'.split(' ');

  function randName() {
    var name = [];
    for(var i = 0; i<randNum(1,5); i++) {
      name.push(names[randNum(0, names.length-1)]);
    }
    return name.join(' ');
  }

  function randDate() {
    var a = new Date();
    a.setMonth(randNum(0,11));
    a.setDate(randNum(0,30));
    a.setYear(randNum(2014,2015));
    a.setHours(randNum(0,23));
    return a;
  }
  var due = randDate();

  return {
    due: due,
    attendant: netids[randNum(0,netids.length-1)],
    owner: netids[randNum(0,netids.length-1)],
    copy: randNum(0,3) || null,
    volume: randNum(0,3) || null,
    extensions: randNum(0,4),
    name: randName(),
    overdue: moment(due).isAfter(new Date),
    call_number: callnum
  }
};
