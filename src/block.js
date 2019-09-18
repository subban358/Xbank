const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction
{
    constructor(fromAddress,toAddress,amount)
    {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
    calculateHash()
    {
        return SHA256(this.fromAddress+this.toAddress+this.amount).toString();
    }

    signTransaction(signKey)
    {
        if(signKey.getPublic('hex') != this.fromAddress)
        {
            throw new Error('You can not sign transaction for other wallet !');
        }
        const hashTx = this.calculateHash();
        const sig = signKey.sign(hashTx,'base64'); // making a key using the hash of the transaction !!
        this.signature = sig.toDER('hex');

    }

    isValid()
    {
        if(this.fromAddress == null)
        {
            return true;
        }
        if(!this.signature || this.signature.length == 0)
        {
            throw new Error('No signature in this transaction !');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress,'hex');
        return publicKey.verify(this.calculateHash(),this.signature);
    }
}
class Block
{
    constructor(timeStamp,transaction,previousHash='')
    {
        this.timeStamp = timeStamp;
        this.tansaction = transaction;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash()
    {
        return SHA256(this.timeStamp+this.previousHash+JSON.stringify(this.transaction)+this.nonce).toString();
    }

    mineBlock(difficulty)
    {
        while(this.hash.substring(0,difficulty) != Array(difficulty+1).join("0"))
        {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Mined: "+this.hash);
    }
    hasValidTransaction()
    {
        for(const tx of this.transactions)
        {
            if(!tx.isValid())
            {
                return false;
            }

        }
        return true;
    }
}
class Blockchain
{
    constructor()
    {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 3;
        this.pendingTransactions = [];
        this.miningReward = 100;

    }
    createGenesisBlock()
    {
        return new Block("16/9/2019","Genesis Block","0")
    }
    getLatestBlock()
    {
        return this.chain[this.chain.length-1];
    }
    minePendingTransactions(mininingRewardAddress)
    {
        let block = new Block(Date.now(),this.pendingTransactions);
        block.mineBlock(this.difficulty);
        console.log("Block sucessfully mined !");
        this.chain.push(block);
        this.pendingTransactions = [
            new Transaction(null,mininingRewardAddress,this.miningReward)
        ];
    }
    addTransactions(transaction)
    {
        if(!transaction.fromAddress || !transaction.toAddress)
        {
            throw new Error('Transaction must have From and to Address !');
        }
        if(!transaction.isValid())
        {
            throw new Error('You can not add invalid transactions !');
        }

        this.pendingTransactions.push(transaction);
    }

    isChainValid()
    {
        for(let i=0;i<this.chain.length;i++)
        {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            if(!currentBlock.hasValidTransaction())
            {
                return false;
            }

            if (currentBlock.hash != currentBlock.calculateHash())
            {
                return false;
            }

            if(currentBlock.previousHash != previousBlock.hash)
            {
                return false;
            }
        }
        return true;
    }
    getBalanceofAddress(address)
    {
        let bal = 0;

        for(const block of this.chain)
        {
            for(const trans of block.tansaction)
            {
                if(trans.fromAddress == address)
                {
                    bal -= trans.amount;
                }

                if(trans.toAddress == address)
                {
                    bal += trans.amount;
                }
            }
        }
        return bal;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;

