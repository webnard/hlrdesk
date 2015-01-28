var utils = require('../utils')
const ENV = process.env;

module.exports = {
  create_email : function(from, reserveID) {
    return '<head><style> div>a{text-decoration: none; height: 25px; display: block; width: 100%; font-size: 25px; text-align: center; border-radius: 10px; color: black;}\
    h1, p { display: inline;}  </style></head><body> \
    <div id=containerIntro> <h1> Info </h1> <br/> <p> Name: '+from.attributes.fullName+'<br/> Net ID: '+from.attributes.netId+'<br/> Email: <span>'+from.attributes.emailAddress+'</span></p> <br/></div> \
    <div><a  href='+utils.gen_url(ENV.HLRDESK_HOST, ENV.PORT, '/accept', !ENV.HLRDESK_DEV)+'?reserveID=' + reserveID  + ' class="choice" style="background-color: green"> Accept </a>  \
    <a  href='+utils.gen_url(ENV.HLRDESK_HOST, ENV.PORT, '/decline', !ENV.HLRDESK_DEV)+'?reserveID=' + reserveID  + ' class="choice" style="background-color: red"> Decline </a></div></body>' // html body
  }
}
