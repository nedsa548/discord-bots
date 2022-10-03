require("dotenv").config({path: "../.env"});
const axios = require("axios");
const discord = require("discord.js");
const client = new discord.Client({ intents: ["GUILDS"] });
const web3lib = require("web3");
const web3 = new web3lib(new web3lib.providers.HttpProvider("https://api.avax.network/ext/bc/C/rpc"));

const stakingContractAddress = "0x88afdaE1a9F58Da3E68584421937E5F564A0135b";
const stakingRewardsABI = [{ "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "totalSupply", "inputs": [] }];
const stakingContract = new web3.eth.Contract(stakingRewardsABI, stakingContractAddress);

async function updatePoolInfo() {
	const pngStaked = Math.round(await stakingContract.methods.totalSupply().call() / (10 ** 18));
	const pngCirculating = Math.round((await axios.get("https://api.pangolin.exchange/png/circulating-supply")).data / (10 ** 18));

    client.user.setPresence({
    	activities: [{
    		name: `${(pngStaked / 1000000).toFixed(2).toLocaleString()}M PNG | ${(100 * pngStaked / pngCirculating).toFixed(1).toLocaleString()}%`,
        	type: 1 // // Use activity type 1 which is "Playing"
      	}]
    });

	console.log("Circulating PNG: " + pngCirculating.toLocaleString());
	console.log("Staked PNG: " + pngStaked.toLocaleString());
	console.log("Staked PNG %: " + (100 * pngStaked / pngCirculating).toFixed(1));
}

// Runs when client connects to Discord.
client.on("ready", () => {
    console.log("Logged in as", client.user.tag);
    updatePoolInfo(); // Ping server once on startup
    setInterval(updatePoolInfo, 30 * 1000); // Ping server every 30 seconds.
});

client.login(process.env.PNG_STAKING_BOT_TOKEN);