require("dotenv").config({path: "../.env"});
const axios = require("axios");
const discord = require("discord.js");
const client = new discord.Client({ intents: ["GUILDS"] });

async function getPrice() {
    const token0 = await axios.get("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=pangolin-songbird");
    const token1 = await axios.get("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=songbird");

    updatePrice(token0.data[0].current_price.toFixed(4), token0.data[0].price_change_percentage_24h.toFixed(1), "$", "");

    setTimeout(() => updatePrice((token0.data[0].current_price / token1.data[0].current_price).toFixed(3), (token0.data[0].price_change_percentage_24h - token1.data[0].price_change_percentage_24h).toFixed(1), "", "SGB"), 60000);
}

async function updatePrice(price, priceChange, prefix, suffix) {
    if (priceChange > 0) {
        priceChange = "+" + priceChange;
    }

    client.user.setPresence({
        activities: [{
            name: `${prefix}${price} ${suffix} | ${priceChange}%`,
            type: 1 // Use activity type 1 which is "Playing"
        }]
    });

    console.log(`Updated price to: ${prefix}${price} ${suffix}`);
}


// Runs when client connects to Discord.
client.on("ready", () => {
    console.log("Logged in as", client.user.tag);
    getPrice(); // Ping server once on startup
    setInterval(getPrice, 120 * 1000); // Ping server every 120 seconds.
});

client.login(process.env.PSB_PRICE_BOT_TOKEN);