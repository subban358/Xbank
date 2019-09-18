const {Blockchain,Transaction} = require('./block');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('ad3f8c8afb59de1ee565556c9428fbc00d14f68db17795f9467ac418e56338a4');
const myWalletAddress = myKey.getPublic('hex');


let xbank = new Blockchain();

const tx1 = new Transaction(myWalletAddress,'address2',100);
tx1.signTransaction(myKey);
xbank.addTransactions(tx1);

console.log("Starting miner!");
xbank.minePendingTransactions(myWalletAddress);
console.log("\n Balance of subham is: ",xbank.getBalanceofAddress(myWalletAddress));



