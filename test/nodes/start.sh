#!/bin/bash

addresses=( )
addresses[0]="0x002c04ba36aacbba41cff7e6a055b34a43de882b"
addresses[1]="0x0036b57ddb8fd3418020f7f42ee17ce0af5e6ea8"
baseDir=$(dirname $0)

echo "Killing existing raiden processes..."
pkill -f raiden/bin/raiden

for i in "${!addresses[@]}"; do
  apiAddress="127.0.0.1:500$i"
  logFile="$baseDir/node$i.log"
  echo "[$(date +%s)] Starting raiden node..." >> $logFile
  raiden \
    --listen-address "0.0.0.0:4000$i" \
    --api-address $apiAddress \
    --address "${addresses[$i]}" \
    --password-file "$baseDir/password.txt" \
    --keystore-path ~/Library/Application\ Support/io.parity.ethereum/keys/test \
    --eth-client-communication >> $logFile 2>&1 &
  echo "Starting raiden node in background with rpc $apiAddress for ${addresses[$i]} and logfile $logFile"
done
