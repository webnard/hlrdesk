require('./app.js').listen(process.env.PORT);

console.log("Server running on port", process.env.PORT);
console.log("Development:", !!process.env.HLRDESK_DEV);
console.log("Hostname:", process.env.HLRDESK_HOST);
