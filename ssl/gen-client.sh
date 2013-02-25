#!/bin/bash
set -e

rm -rf .gentmp
mkdir -p .gentmp
pushd .gentmp >/dev/null

read -e -p 'Enter a user ID (e.g. john_s or 1234): ' user_id

openssl genrsa -out "client-$user_id.pem" 1024
openssl req -new -key "client-$user_id.pem" -out client.csr \
  -subj "/O=Lolcats Inc/OU=Administration/CN=$user_id"

# Sign the client certificate with our CA cert. Unlike signing our own server
# cert, this is what we want to do even in production environments.
openssl x509 -req -days 365 -in client.csr -CA ../ca.crt -CAkey ../ca.pem \
  -set_serial 01 -out "client-$user_id.crt"

# Bundle up into a p12 file
openssl pkcs12 -export -clcerts -inkey "client-$user_id.pem" \
  -in "client-$user_id.crt" -out "client-$user_id.p12" \
  -name "$user_id" -passout pass:hello > /dev/null

popd >/dev/null
mv -f .gentmp/*.pem .gentmp/*.crt .gentmp/*.p12 .

echo "Success! Generated client-$user_id.{pem,crt,p12}."
echo "The password for client-$user_id.p12 is 'hello'."
