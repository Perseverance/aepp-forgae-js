const chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
const execute = require('../../cli-commands/utils.js').forgaeExecute;
const waitForContainer = require('../utils').waitForContainer;
const waitUntilFundedBlocks = require('../utils').waitUntilFundedBlocks;
const constants = require('../constants.json')
const fs = require('fs-extra')
const nodeConfig = require('../../cli-commands/forgae-node/config.json')
const utils = require('../../cli-commands/utils')
let executeOptions = {
	cwd: process.cwd() + constants.nodeTestsFolderPath
};
chai.use(chaiAsPromised);
const assert = chai.assert;
const defaultWallets = nodeConfig.defaultWallets


describe('ForgAE Node', () => {

	before(async () => {
		fs.ensureDirSync(`.${constants.nodeTestsFolderPath}`)

		await execute(constants.cliCommands.INIT, [], executeOptions)
		await execute(constants.cliCommands.NODE, [], executeOptions)
	})

	it('Should start the node successfully', async () => {
		let running = await waitForContainer();
		assert.isTrue(running, "node wasn't started properly");
	})

	it('Should check if the wallets are funded', async () => {

		let client = await utils.getClient(nodeConfig.config.host);
		await waitUntilFundedBlocks(client)
		for (let wallet in defaultWallets) {
			let recipientBalanace = await client.balance(defaultWallets[wallet].publicKey)
			assert.isAbove(Number(recipientBalanace), 0, `${defaultWallets[wallet].publicKey} balance is not greater than 0`);
		}
	})

	it('Should check if the wallets are funded with the exact amount', async () => {

		let client = await utils.getClient(nodeConfig.config.host);
		for (let wallet in defaultWallets) {
			let recipientBalanace = await client.balance(defaultWallets[wallet].publicKey)
			assert.equal(Number(recipientBalanace), nodeConfig.config.amountToFund, `${defaultWallets[wallet].publicKey} balance is not greater than 0`);
		}
	})

	it('Should stop the node successfully', async () => {
		await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
		let running = await waitForContainer();
		assert.isNotTrue(running, "node wasn't stopped properly");
	})

	after(async () => {

		let running = await waitForContainer();
		if (running) {
			await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
		}
		fs.removeSync(`.${constants.nodeTestsFolderPath}`)
	})
})