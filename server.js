'use strict';
var https = require('https');
var fs = require('fs');
const request = require('request');
const axios = require('axios');

const url = "http://127.0.0.1:8000/hardware/x509/login_with_cert/";

async function doLoginViaCert(certificate) {
  try {
    const response = await axios.get(url , {
      params: {
        'certificate': certificate
      }
    });
    return response;
  } catch (error) {
    console.log('Some error happened');
    console.log(error);
    return error;
  }
};

var options = {
  key:  fs.readFileSync('ssl/server.pem'),
  cert: fs.readFileSync('ssl/server.crt'),
  ca:   fs.readFileSync('ssl/ca.crt'),
  passphrase:           'NmNTNA9idsq4iuzH',
  requestCert:          true,
  rejectUnauthorized:   false,
};

https.createServer(options, async function (req, res) {
  var response;
  if (req.client.authorized) {
    // This happens when the client's certificate was validated against the
    // certificate chain.
    var peer_cert = res.connection.getPeerCertificate();
    peer_cert.user_id = peer_cert.subject.CN;
    console.log('Serving authorized user "' + peer_cert.user_id + '"');
    const backend_response = await doLoginViaCert(peer_cert);
    // oauth_token  = request.post('localhost:8000/login_with_cert', payload)
    // setCookie('Authorization Bearer:', oauth_token);
    res.writeHead(200, {"Content-Type": "application/json"});
    response = {status: 'approved', peer_cert: peer_cert};
  } else {
    console.log('Serving unauthorized user');
    res.writeHead(401, {"Content-Type": "application/json"});
    response = {status: 'denied'};
  }
  res.end(JSON.stringify(response, null, 2));
}).listen(8443, 'test.rippling.com', function () {
  console.log('Listening at https://test.rippling.com:8443/');
});