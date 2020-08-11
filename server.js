'use strict';
var https = require('https');
var fs = require('fs');

var options = {
  key:  fs.readFileSync('ssl/server.pem'),
  cert: fs.readFileSync('ssl/server.crt'),
  ca:   fs.readFileSync('ssl/ca.crt'),
  passphrase:           'NmNTNA9idsq4iuzH',
  requestCert:          true,
  rejectUnauthorized:   false,
};

https.createServer(options, function (req, res) {
  var response;
  if (req.client.authorized) {
    // This happens when the client's certificate was validated against the
    // certificate chain.
    var peer_cert = res.connection.getPeerCertificate();
    peer_cert.user_id = peer_cert.subject.CN;
    console.log('Serving authorized user "' + peer_cert.user_id + '"');
    res.writeHead(200, {"Content-Type": "application/json"});
    response = {status: 'approved', peer_cert: peer_cert};
  } else {
    console.log('Serving unauthorized user');
    res.writeHead(401, {"Content-Type": "application/json"});
    response = {status: 'denied'};
  }
  res.end(JSON.stringify(response, null, 2));
}).listen(1337, 'ssl.client.auth', function () {
  console.log('Listening at https://ssl.client.auth:1337/');
});