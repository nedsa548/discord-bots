require("dotenv").config({path: "../.env"});
const axios = require("axios");
const discord = require("discord.js");
const client = new discord.Client({ intents: ["GUILDS"] });
const web3lib = require("web3");
const web3 = new web3lib(new web3lib.providers.HttpProvider("https://songbird-api.flare.network/ext/C/rpc"));

const stakingContractAddress = "0x7428A089A79B24400a620F1Cbf8bd0526cFae777";
const stakingRewardsABI = [{"type":"function","stateMutability":"view","outputs":[{"type":"uint96","name":"balance","internalType":"uint96"},{"type":"uint160","name":"sumOfEntryTimes","internalType":"uint160"}],"name":"totalValueVariables","inputs":[]}];
const stakingContract = new web3.eth.Contract(stakingRewardsABI, stakingContractAddress);

const tokenABI = [{ "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "totalSupply", "inputs": [] }];
const tokenContract = new web3.eth.Contract(tokenABI, "0xb2987753D1561570f726Aa373F48E77e27aa5FF4");

async function updatePoolInfo() {
	const psbStaked = Math.round((await stakingContract.methods.totalValueVariables().call()).balance / (10 ** 18));
	const psbCirculating = Math.round(await tokenContract.methods.totalSupply().call() / (10 ** 18));

    client.user.setPresence({
    	activities: [{
    		name: `${(psbStaked / 1000000).toFixed(2).toLocaleString()}M PSB | ${(100 * psbStaked / psbCirculating).toFixed(1).toLocaleString()}%`,
        	type: 1 // Use activity type 1 which is "Playing"
      	}]
    });

	console.log("Circulating PSB: " + psbCirculating.toLocaleString());
	console.log("Staked PSB: " + psbStaked.toLocaleString());
	console.log("Staked PSBG %: " + (100 * psbStaked / psbCirculating).toFixed(1));
}



// Runs when client connects to Discord.
client.on("ready", () => {
    console.log("Logged in as", client.user.tag);
    updatePoolInfo(); // Ping server once on startup
    setInterval(updatePoolInfo, 30 * 1000); // Ping server every 30 seconds.
});

client.login(process.env.PSB_STAKING_BOT_TOKEN);