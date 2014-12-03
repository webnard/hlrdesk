exports.localhost = process.env.HOST || "http://hlr.byu.edu";  //Your Local host here
exports.port = process.env.PORT || 8080; //Your port number here
exports.url = exports.localhost+":"+exports.port.toString();
exports.debug = process.env.DEBUG || true;
exports.database = process.env.DATABASE || "postgres://postgres:password@localhost/hlrdesk"; //Your db location formatted like so
