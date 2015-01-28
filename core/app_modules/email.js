var nodemailer = require('nodemailer');
var auth = require('./auth')
var utils = require('./utils')
var reservation_html = require('./email_templates/reservation.js')

const ENV = process.env;


var transporter = nodemailer.createTransport({
  service : ENV.EMAILSERVICE,
  auth:{
    user: ENV.EMAIL,
    pass: ENV.EMAILPASS
  }
});

function Reservation(from, reserveID){
  var mailOptions = {
      from: from.attributes.name + '<' + from.attributes.emailAddress + '>', // sender address
      to: ENV.EMAIL, // list of receivers
      subject: 'Room Reservation for ' + from.attributes.name, // Subject line
      text: 'VEIW THE HTML n00blet.', // plaintext body
      html: reservation_html.create_email(from,reserveID)
  }
  return mailOptions
};


module.exports = {
  roomReservation : function(from, reserveID){  transporter.sendMail(Reservation(from, reserveID), function(error, info){
    if(error){
      console.error(error);
    }
  });}
};
