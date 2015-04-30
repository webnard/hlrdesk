var db = require('../app_modules/db');

module.exports = function editCatalog(socket, app) {


  socket.on('getInfo', function(item){
    var client = db();
    var uID = this.user;
    client.transaction(function*(t) {
      var query = "SELECT * FROM inventory WHERE call = $1";
      var result = yield t.queryOne(query, [item.callNum]);
      app.io.emit('getInfo', result);
    }).catch(console.error);
  });
  
  socket.on('deleteItem', function(origCall)
  {
    var client = db();
    client.query("DELETE FROM inventory WHERE call = $1;", [origCall]);
  });
  
  socket.on('changeInfo', function(edited)
  {
    var client = db();
    if (edited.type == "update")
    {
      client.query("UPDATE inventory SET (call, quantity, title, checkout_period, is_reserve, is_duplicatable, on_hummedia, edited_by, date_edited, notes) = ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, $9) WHERE  call = $10;", 
      [edited.newCall, edited.quantity, edited.title, edited.checkLength, edited.reserve, edited.duplicatable, edited.online, this.user, edited.notes, edited.origCall]);
    }
    else 
    {
      client.query("INSERT INTO inventory (call, quantity, title, checkout_period, is_reserve, is_duplicatable, on_hummedia, edited_by, date_edited, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, $9);", 
      [edited.newCall, edited.quantity, edited.title, edited.checkLength, edited.reserve, edited.duplicatable, edited.online, this.user, edited.notes]); 
    }
  });
  
};
