# SSL client authentication example

This demonstrates [Client-authenticated TLS handshake](http://en.wikipedia.org/wiki/Transport_Layer_Security#Client-authenticated_TLS_handshake) which allows you to sign in without the use of passwords or e.g. email roundtrips, plus it allows to "uniquely identify yourself to third-party websites without giving the second party any account information" [(Hofstetter 2008)](http://pilif.github.com/2008/05/why-is-nobody-using-ssl-client-certificates/). All of this using already existing infrastructure built in to all major web browsers.

![Screeshot of Safari successfully using client authentication](http://farm9.staticflickr.com/8098/8506867868_ac16ca2c5a_o.png)

Grab this code and follow these steps to try it out. You will need an installation of [Node.js](http://nodejs.org/) for this to work, and it assumes you're using Apple OS X.

**Step 1.** Open `/etc/hosts` and add associate "ssl-client-auth" with localhost. You'll have to do this as sudo (or if using a GUI editor; have admin privileges). There should now be a line that looks like this:

    127.0.0.1 localhost ssl-client-auth

**Step 2.** In a terminal, go to the `ssl` directory that comes with this example and run gen-server.sh:

    $ cd ssl && ./gen-server.sh
    Some output here...

**Step 3.** Import our demo CA certificate into your OS's keychain. If you are using Apple OS X, simply double-click the "ca.crt" file in the "ssl" directory. This should open the Keychain Access app and ask you if you really want to import this certificate. Answer "Always Trust".

**Step 4.** Generate a new client certificate. Intheory, this is what you will do for every user that is granted access to whatever you are protecting. Still in a terminal in the ssl directory, do this and enter some user identifier when asked:

    $ ./gen-client.sh
    Enter a user ID (e.g. john_s or 1234): rsms

**Step 5.** Import the client certificate into your OS's keychain. If you are using Apple OS X, simply double-click the "client-youruserid.crt" file in the "ssl" directory. This should open the Keychain Access app and ask you to enter a password to unlock the file. Enter "hello" (this password was set by the gen-client.sh script.)

**Step 6.** Start the demo web server by going to the root directory of this project and:

    $ node server.js
    Listening at https://ssl-client-auth:1337/

Now open [https://ssl-client-auth:1337/](https://ssl-client-auth:1337/) in a modern web browser like Chrome or Safari.

Depending on which browser you use the user interface for chosing an identity will be different. For instance, Safari will first present a list of known and applicable identities and ask you to pick yours. Here you want to pick the one which has the same name as you entered for "user ID" when running the `gen-client.sh` script. Next Safari will ask you for access to the private key. Answer "Always Allow". You should see something like this if everything worked:

    { "status": "approved",
      "peer_cert": {
        "subject": "O=Lolcats Inc\nOU=Administration\nCN=rsms",
        "issuer": "O=Lolcats Inc\nOU=Administration\nCN=Lolcats CA",
        "valid_from": "Feb 25 09:08:25 2013 GMT",
        "valid_to": "Feb 25 09:08:25 2014 GMT",
        "fingerprint": "79:03:74:DD:34:3C:41:44:15:6C:94:2D:76:CB:BE:76:FB:B9:92:12"
    } }

----

Using curl:

    $ curl --insecure https://ssl-client-auth:1337
    { "status": "denied" }
    $ curl --insecure \
      --key ssl/client-yourname.pem --cert ssl/client-yourname.crt \
      https://ssl-client-auth:1337
    {
      "status": "approved",
      "peer_cert": {
        "subject": "O=Lolcats Inc\nOU=Administration\nCN=rsms",
        "user_id": "rsms"
    ...
