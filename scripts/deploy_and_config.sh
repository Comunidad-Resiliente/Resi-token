#!/bin/bash

set -e 

usage() { echo "Usage: $0 [-n <NETWORK>] [-t <TOKEN_ADDRESS>]" 1>&2; exit 1; }

while getopts ":n:t:g:" opt; do
    case $opt in
    n) NETWORK="$OPTARG";;
    t) TOKEN="$OPTARG";;
    \?) echo "Invalid option: -$OPTARG" >&2; exit 1;;
    :) echo "Option -$OPTARG requires an argument." >&2; exit 1;;
  esac
done

echo "Deploying contracts to network $NETWORK"

npx hardhat deploy --network $NETWORK --reset
