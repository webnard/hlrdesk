var auth = require('../app_modules/auth');
var db = require('../app_modules/db');
var inv = require('../app/modules/inventory');

module.exports = function editCatalog(socket, app) {

  function checkMe(that, errMessage, callback)
  {
    auth.isAdmin(that.user).then(function(isAdmin) 
    {
      if(!isAdmin) 
      {
        console.error(that.user + errMessage);
        that.emit('alertMessage', 'You do not have admin priviledges, if you do, please log in again');
        return false;
      }
      else {callback();}
      }).catch(console.error);
    }

    socket.on('getInfo', function(item){
      var that = this;
      var errMessage = ' attempted to get info of ' + item.callNum;
      checkMe(this, errMessage, function success() 
      {
        var client = db();
        //var uID = that.user;
        client.transaction(function*(t) {
          var query = "SELECT * FROM inventory WHERE call = $1";
          var result = yield t.queryOne(query, [item.callNum]);
          app.io.emit('getInfo', result);
        }).catch(console.error);
      })
    });
  
    socket.on('deleteItem', function(delInfo)
    {
      var that = this;
      var errMessage = ' attempted to get delete item ' + delInfo.origCall;
      checkMe(that, errMessage, function success() 
      {
        var client = db();
        client.query("DELETE FROM inventory WHERE call = $1;", [delInfo.origCall]);
        var del = "Item ["+ delInfo.origCall + "] was deleted";
        client.query("INSERT INTO item_history (call_number, type, who, date_changed, notes) VALUES ($1, 'Delete Item', $2, CURRENT_TIMESTAMP, $3) ",
        [delInfo.origCall, that.user, del ])
      })
    });
  
    socket.on('changeInfo', function(edited)
    {
      var that = this;
      var errMessage = ' attempted to get change item ' + edited.origCall;
      checkMe(this, errMessage, function success() 
      {
        var client = db();
        if (edited.type == "update")
        {
          inv.update(that.user, edited.newCall, edited).catch(function() {
            that.emit('alertMessage', 'There was an error updating the database.');
          });
        }
        else 
        {
          var note;
          client.query("INSERT INTO inventory (call, quantity, title, checkout_period, is_reserve, is_duplicatable, on_hummedia, edited_by, date_edited, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, $9);", 
          [edited.newCall, edited.quantity, edited.title, edited.checkLength, edited.reserve, edited.duplicatable, edited.online, that.user, edited.notes]); 
          
          if (edited.notes){ note = 'Notes:'+ edited.notes;}
          var is_online;
          if (edited.online){ is_online = ' Item is on Hummmedia.';}
          var is_reserve;
          if (edited.reserve){ is_reserve = ' Reserve:true.';}
          var is_duplicatable;
          if (edited.duplicatable){ is_duplicatable = ' Duplicatable: true.';}
          
          var allNotes = note + is_online + is_reserve + is_duplicatable;
          client.query("INSERT INTO item_history (call_number, type, who, title, date_changed, notes) VALUES ($1, 'Add', $2, $3, CURRENT_TIMESTAMP, $4) ",
          [edited.newCall, that.user, edited.title, allNotes ]
          );
        }
      })
    });
  
  };
