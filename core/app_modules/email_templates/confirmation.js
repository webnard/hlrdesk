var utils = require('../utils')
const ENV = process.env;

module.exports = {
  create_email : function(from, time, room) {
    return '<head><style> div>a{text-decoration: none; height: 25px; display: block; width: 100%; font-size: 25px; text-align: center; border-radius: 10px; color: black;}\
    h1, p { display: inline;}  </style></head><body> \
    <div id=containerIntro> <h1> This is a confirmation email for: </h1> <br/> <p> Room: '+room+'<br/> Time: '+time+'<br/> </div></body>'
  }
}
