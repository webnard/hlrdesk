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

  function randNum(max) {
    return Math.floor(Math.random()*(max-1));
  }

  for(var i = 0; i<8; i++) {
    callnum += alpha[randNum(alpha.length)];
    if(i === 1 || i === 4) {
      callnum += '-';
    }
  }

  var netids = 'jimbowales frankfurter ipecac exegesis2 3peat c2 kelp'.split(' ');
  var names = 'Windows VGA Goat Hamster Cord Cheese Grinch Extreme Mac Keyboard Mellencamp Nodule Pizza Branch HDMI Adapter Recorder Electronic English Multimeter Martian 1080p'.split(' ');

  function randName() {
    var name = [];
    for(var i = 0; i<randNum(5)+1; i++) {
      name.push(names[randNum(names.length)]);
    }
    return name.join(' ');
  }

  return {
    due: new Date(),
    attendant: netids[randNum(netids.length)],
    owner: netids[randNum(netids.length)],
    copy: randNum(4) || null,
    volume: randNum(3) || null,
    extensions: randNum(4),
    name: randName(),
    call_number: callnum
  }
};
