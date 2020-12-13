import {Transaction, TxData} from "ethereumjs-tx";
import {EventEmitter} from 'events';
import Web3 from 'web3';
import {Account} from 'web3-core';
import {Contract, ContractSendMethod} from 'web3-eth-contract';
import {ISubspaceBlock} from './subspace';

const TEST_ACCOUNT_PRIVATE_KEY = '112cc2b47c88f93942174a3368921d5d9ad564b70a99b7a83f2d9ecdde2b0f4f';
const CONTRACT_ADDRESS = '0x4816b4f24610c5e108A5580aF5AB6cFa13eEF70E';
// language=JSON
const CONTRACT_JSON_INTERFACE = JSON.parse(`[
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "previousBlock",
            "type": "uint256"
          },
          {
            "internalType": "uint64",
            "name": "blockHeight",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "nonce",
            "type": "uint64"
          },
          {
            "internalType": "uint256",
            "name": "publicKey",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "stateRoot",
            "type": "uint256"
          }
        ],
        "internalType": "struct Bridge.BlockHeader",
        "name": "newBlockHeader",
        "type": "tuple"
      }
    ],
    "name": "update",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]`);

// should create an interface for the block data structure that maps to the contract storage, which will be placed inside the date field of the tx
// interface IBridgeContractState { }

export class Bridge extends EventEmitter {
    private lastTxNonce: number = 0;
    private readonly account: Account;
    private readonly contract: Contract;
    private readonly web3: Web3;

    public constructor() {
        super();

        this.web3 = new Web3('wss://ropsten.infura.io/ws/v3/e08963a6272a43bfa2f73307ff8ae4eb');
        this.account = this.web3.eth.accounts.privateKeyToAccount(TEST_ACCOUNT_PRIVATE_KEY);

        this.contract = new this.web3.eth.Contract(
            CONTRACT_JSON_INTERFACE,
            CONTRACT_ADDRESS,
            {
                from: this.account.address,
            },
        );
    }

    /**
     * Forms a new valid Ethereum tx for the bridge smart contract that includes the new Subspace block header
     */
    public async createContractUpdate(block: ISubspaceBlock): Promise<Transaction> {
        const contractSendMethod: ContractSendMethod = this.contract.methods.update({
            blockHeight: block.blockHeight,
            nonce: block.nonce,
            previousBlock: block.previousBlock,
            publicKey: block.publicKey,
            stateRoot: block.stateRoot,
        });

        const txCount = await this.web3.eth.getTransactionCount(this.account.address);
        const nonce = Math.max(this.lastTxNonce + 1, txCount);
        this.lastTxNonce = nonce;
        const gasLimit = await contractSendMethod.estimateGas();
        const gasPrice = await this.web3.eth.getGasPrice();

        const txData: TxData = {
            data: contractSendMethod.encodeABI(),
            gasLimit: gasLimit,
            gasPrice: Math.round(parseInt(gasPrice, 10)),
            nonce: nonce,
            to: CONTRACT_ADDRESS,
        };

        console.debug('Ethereum transaction data', txData);

        const transaction = new Transaction(txData, {chain: 'ropsten'});
        transaction.sign(Buffer.from(this.account.privateKey.slice(2), 'hex'));

        return transaction;
    }

    /**
     * Submits the transaction to the Ethereum network and fires an event once the state change occurs
     */
    public submitContractUpdate(transaction: Transaction): void {
        this.web3.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
            .then((receipt) => {
                console.info('Transaction receipt', receipt);

                this.emit("bridge-updated");
            })
            .catch((error) => {
                console.error('Failed to send signed transaction', error);
            });
    }
}
