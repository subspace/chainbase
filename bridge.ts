import { EventEmitter } from 'events';
import { ISubspaceBlock } from './subspace';

// should already be an interface for Ethereum Tx provided by Web3 TS bindings
export interface IEthereumTx { }

// should create an interface for the block data structure that maps to the contract storage, which will be placed inside the date field of the tx
interface IBridgeContractState { }

export class Bridge extends EventEmitter {

    constructor() {
        super();
        // provide Ethereum account address which has testnet ETH
        // may have to use metamask to open up a private key 
        // provide bridge smart contract address
    }

    /**
     * Connects to Ethereum test network over Web3.js
     */
    public async connectToEthereumTestNetwork() { }

    /**
     * Forms a new valid Ethereum tx for the bridge smart contract that includes the new Subspace block header
     */
    public createContractUpdate(block: ISubspaceBlock): IEthereumTx {
        return {};
    }

    /**
     * Submits the transaction to the Ethereum network and fires an event once the state change occurs
     */
    public async submitContractUpdate(tx: IEthereumTx) {
        // send the tx

        // register event listener and fire event 
        this.emit("bridge-updated");
    }


}