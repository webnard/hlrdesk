"use strict";

var moment = require('moment');
var db = require('./db');
var co = require('co');
var assert = require('assert');

var itemHistory = {};
module.exports = itemHistory;

itemHistory.update = co.wrap(function*(call, details){
  var amount;
  var title;
  var res;
  var dup;
  var hum;
  var allNotes = '';

  var client = db();

  if(call !== edited.newCall) {
    allNotes= "UPDATED CALL NUMBER = ["+ edited.newCall + "]. Previous call number was " + call + ".";
  }
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
    yield client.query("INSERT INTO item_history (call_number, type, who, title, date_changed, notes) VALUES ($1, 'Edit', $2, $3, CURRENT_TIMESTAMP, $4) ",
    [edited.newCall, that.user, edited.title, allNotes ])
  }
});
