var inventory = {};

Object.defineProperty(inventory, 'checked_out', {
  get: getCheckedOut
});
inventory.getCheckedOut = getCheckedOut;

module.exports = inventory;

function getCheckedOut() {
  var a = [];
  for(var i = 0; i<10; i++) {
    var item = {
      call_number: 'DEA-DBE-EF',
      name: 'Goat Cheese',
      owner: 'jimbowales',
      due: new Date(),
      attendant: 'frankfurter',
      copy: null,
      volume: null,
      extensions: 0
    }
    a.push(item);
  }
  return Promise.resolve(a);
}
