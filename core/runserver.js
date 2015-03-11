var app = require('./app');
app.listen(process.env.PORT);

console.log("PID:", process.pid);
console.log("PORT:", process.env.PORT);
console.log("Development:", !!process.env.HLRDESK_DEV);
console.log("Hostname:", process.env.HLRDESK_HOST);
console.log("URL:", 'http://' + process.env.HLRDESK_HOST + ':' + process.env.PORT);
