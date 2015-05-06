var auth = require('../app_modules/auth');
var db = require('../app_modules/db');

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
        var note;
        if (edited.type == "update")
        {
          client.query("UPDATE inventory SET (call, quantity, title, checkout_period, is_reserve, is_duplicatable, on_hummedia, edited_by, date_edited, notes) = ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, $9) WHERE  call = $10;", 
          [edited.newCall, edited.quantity, edited.title, edited.checkLength, edited.reserve, edited.duplicatable, edited.online, that.user, edited.notes, edited.origCall]);
        
          //TODO: check if item exists before adding to either table
          //TODO: check if item is checked out, may need to update there as well
          if (edited.origCall != edited.newCall)//need to append to new and old call
          {
            note= "UPDATED CALL NUMBER = ["+ edited.newCall + "]. Search for this call number to see item details after this date";
            //update old call number, just notes section
            client.query("INSERT INTO item_history (call_number, type, who, date_changed, notes) VALUES ($1, 'Edit Call - OLD', $2, CURRENT_TIMESTAMP, $3) ",
            [edited.origCall, that.user,  note ]);
          
            //update new call number, with old call in notes
            note = "Previous call number was " + edited.origCall + " please search that call number for previous information";
            client.query("INSERT INTO item_history (call_number, type, who, date_changed, notes) VALUES ($1, 'Edit Call - New', $2, CURRENT_TIMESTAMP, $3) ",
            [edited.newCall, that.user,  note ]);
            
            //update database
            //update item_history set call_number = 'aaaaa' where call_number = 'AR';
            client.query("UPDATE inventory SET call = $1 WHERE call = $2 ", [edited.newCall, edited.origCall ]);
          }
          var amount;
          var title;
          var res;
          var dup;
          var hum;
          var allNotes = '';
          if (edited.oldItem.quant != edited.quantity)
          {
            allNotes +="New quantity = ["+edited.quantity + "] was [" + edited.oldItem.quant + "] ";
            amount = edited.quantity;
          }
          if (edited.oldItem.titl != edited.title)
          {
            allNotes +="New title = ["+edited.title + "] was [" + edited.oldItem.titl + "] ";
            title = edited.title;
          }
          if (edited.oldItem.reserv != edited.reserve)
          {
            allNotes +="Reserve is now ["+edited.reserve + "] ";
            res = edited.reserve;
          }
          if (edited.oldItem.dup != edited.duplicatable)
          {
            allNotes +="Duplicatable is now [" + edited.duplicatable + "] ";
            dup = edited.duplicatable;
          }
          if (edited.oldItem.hum != edited.online)
          {
            allNotes += "'Is on Hummedia' option is now ["+edited.online + "]";
            hum = edited.online;
          }
          var c = edited.oldItem.notes;
          if (edited.oldItem.notes == null){c = '';}
          if (edited.notes != c)
          {
            allNotes +="Notes = ["+edited.notes + "] was [" + edited.oldItem.notes + "] ";
          }

          if (allNotes){//if nothing but call is changed, do nothing, otherwise will update
            client.query("INSERT INTO item_history (call_number, type, who, title, date_changed, notes) VALUES ($1, 'Edit', $2, $3, CURRENT_TIMESTAMP, $4) ",
            [edited.newCall, that.user, edited.title, allNotes ])
          }
        }
        else 
        {
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
