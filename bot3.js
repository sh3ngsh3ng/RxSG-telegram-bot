const TelegramBot = require('node-telegram-bot-api')
require('dotenv').config()
const botFunctions = require('./bot-functions2') 

// initialize bot
let bot;
const token = process.env.API_KEY

// Server is either on local or heroku
if (process.env.NODE_ENV === "Heroku") {
    bot = new TelegramBot(token)
    bot.setWebHook(process.env.AWS_LAMBDA_FUNCTION_URL)
    console.log("WebHook set. Bot is live on Heroku")
} else {
    bot = new TelegramBot(token, {polling: true})
    console.log("Bot is live on Local")
}



// Things to do:
// 1) Rewrite logic for searchTypeName function
// 2) Error handling for no search results


// BOT COMMANDS
// Command: /start
bot.onText(/\/start/, async (msg) => {
    console.log(`Bot is called by ${msg.from.first_name}`)
    console.log("Bot is currently on local server")
    bot.sendMessage(
        msg.chat.id,
        `
<b>PLEASE NOTE THAT BOT IS STILL CURRENTLY UNDER DEVELOPMENT</b>
${process.env.NODE_ENV == "Local"? "local": null}
Hello <b>${msg.from.first_name}! </b>

I am RxSG! Your friendly <s>druglord</s> Rx Bot!
I'm here to resolve your drug queries!

Below are some of my commands:
  1) /start - start Bot
  2) /end - stop Bot
  3) /drug - search for a drug (in Singapore)

If you wish to contribute or have some suggestions, please feel free to contact me at @ysh3ng
        `        
        , {parse_mode: 'HTML'})
})
// Additional commands to add
// 4) /druginfo - find info on drug*
// 5) /pharmacy - search for a local pharmacy
// 6) /feedback - submit a feedback\n*<b>Please note that the sources are from...</b>

// Command: /end
bot.onText(/\/end/, async (msg) => {
    console.log(msg)
    bot.sendMessage(
        msg.chat.id,
        `
        Goodbye ${msg.from.first_name}!\nStart me up when you need me again!
        `        
        , {parse_mode: 'HTML'})
})




// Command: /drug
bot.onText(/\/drug/, async (msg) => {
    // remove all listeners (start afresh)
    bot.removeListener("callback_query")
    bot.removeListener("message")
    console.log(`${msg.from.first_name} is currently searching for drugs`)
    // entry function for searching drugs
    // await botFunctions.startDrugSearch(bot, msg)
    let config = {
        reply_markup: {
            "inline_keyboard": [
                [{ text: 'Search by Name & Active Ingredient', callback_data: 'name' }],
                // [{ text: 'Search by Dosage Form', callback_data: 'form' }]
            ]
        },
        force_reply: true
    }

    bot.sendMessage(msg.chat.id, "How would you like to search for the drug? Select an option below.", config)
        .then((payload) => {
            bot.once("callback_query", async (callback) => {
                if (callback.data == "name") {
                    botFunctions.searchByNameAndActiveIngredients(bot, callback.message)
                } else {
                    bot.sendMessage(msg.chat.id, "Something went wrong. Please try again.")
                }
                // else if (callback.data == "form") {
                //     // botFunctions.searchTypeDosageForm(bot, callback.message)
                // }
            })
        })
})


// bot.on("message", (msg) => {
//     if (msg.text !== "/start" && msg.text !== "/end" && msg.text !== "/drug") {
//         bot.sendMessage(msg.chat.id, "Sorry, I do not understand the command.")
//     }
// })








module.exports = {
    bot
}
