#!/usr/bin/env node
const exec = require('child_process').exec;
baseDir=$(dirname $0)

nodeCount=2
rpcPortStart=4010
ethRpcEndpoint="localhost:8545"

passwordFile="$baseDir/password.txt"
keysDir="$baseDir/keys"
logDir="$baseDir/logs"


mkdir -p $keysDir
mkdir -p $logDir

if [[ ! -f $passwordFile ]]; then
  echo "Generating password file $passwordFile"
  date +%s | openssl dgst -sha256 | base64 | head -c 32 > $passwordFile
fi

echo "Killing existing raiden processes"
pkill -f raiden/bin/raiden

for i in $(seq $rpcPortStart $(($rpcPortStart + $nodeCount - 1))); do
  echo "Generating ethereum address..."
  address=$(geth account new --password $passwordFile --keystore $keysDir | grep -E -o '[0-9a-f]{40}')
  echo "Requesting ether for $address from faucet..."
  wget http://faucet.ropsten.be:3001/donate/$address | sed -E 's/.*"paydate":([0-9]+),.*/\1/'
  echo "Polling until balance increases..."
  while :
  do
    $baseDir/getBalance $address $ethRpcEndpoint
    sleep 2000
  done
  rpcEndpoint="127.0.0.1:$i"
  listenEndpoint="0.0.0.0:4$i"
  logFile="$logDir/node-$address.log"
  echo "[$(date +%Y-%m-%dT%H:%M:%S%z)] Starting raiden node..." >> $logFile
  raiden \
    --listen-address $listenEndpoint \
    --api-address $rpcEndpoint \
    --address $address \
    --password-file $passwordFile \
    --keystore-path $keysDir \
    --eth-rpc-endpoint $ethRpcEndpoint \
    --eth-client-communication >> $logFile 2>&1 &
  echo "Started raiden node in background for $address with rpc $rpcEndpoint listening on $listenEndpoint"
done
