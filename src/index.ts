import { Bridge } from './bridge';
import { IBitcoinBlock, Relay } from './relay';
import { ISubspaceBlock, Subspace } from './subspace';
import { randomBytes } from './utils';

/*
 * A bare-bones demo for Chainbase
 * Relays live Bitcoin blocks from trusted API to Relay-SC on mock Subspace Chain
 * New Subspace blocks are then sent to Bridge-SC on Ethereum test network
 * BTC -> Relayer -> SSC -> Bridger -> Ethereum -> Mined (success event)
 *
 * Requires Bridge-SC deployed to Ethereum test network and bridger account with testnet ETH
 */

async function run(): Promise<void> {

    // setup relayer and relay-sc accounts on Subspace blockchain
    const relayerAddress = randomBytes(32);
    const relayContractAddress = randomBytes(32);

    // connect to Ethereum network over bridge
    const bridger = new Bridge();
    console.log("Connected to Ethereum network!");

    // start the subspace mock blockchain
    const subspace = new Subspace(5000, relayerAddress, relayContractAddress);
    subspace.init();
    console.log("Subspace mockchain is running!");

    // for each new Subspace block, update Bridge-SC on Ethereum
    subspace.on("block", async (block: ISubspaceBlock) => {
        console.log("Created new subspace block");
        const tx = await bridger.createContractUpdate(block);
        bridger.submitContractUpdate(tx);
        console.log("Submitted update to bridge smart contract on Ethereum");
    });

    // setup the relayer for Bitcoin blockchain
    const relayer = new Relay();
    await relayer.connectToBTCRelay();
    console.log("Connected to Bitcoin blockchain");

    // for each new Bitcoin block, update Relay-SC on Subspace
    relayer.on("block", (block: IBitcoinBlock) => {
        console.log("Received a new Bitcoin block");
        const tx = subspace.createTx(relayerAddress, relayContractAddress, 1, block);
        subspace.submitTx(tx);
    });

    bridger.on("bridge-updated", () => {
        console.log("New subspace block registered on Ethereum bridge contract");
    });
}

run();
