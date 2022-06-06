const TelegramBot = require('node-telegram-bot-api')
require('dotenv').config()
let searchUtils = require('./searchFunctions')


// initialize bot
let bot;
const token = process.env.API_KEY

// Server is either on local or heroku
if (process.env.NODE_ENV === "Heroku") {
    bot = new TelegramBot(token)
    console.log(bot)
    bot.setWebHook(process.env.HEROKU_URL + token)
    // console.log(bot)
    console.log("Bot is live on Heroku")
} else {
    bot = new TelegramBot(token, {polling: true})
    console.log("Bot is live on Local")
}



// BOT COMMANDS
// Command: /start
bot.onText(/\/start/, async (msg) => {
    console.log("Bot is called")
    bot.sendMessage(
        msg.chat.id,
        `
        Hello ${msg.from.first_name}!\nI am RxSG! Your friendly <s>druglord</s> Rx Bot!\nI'm here to resolve your drug queries!\nBelow are some of my commands:
        1) /start - start Bot
        2) /end - stop Bot
        3) /drug - search for a drug (in Singapore)
        `        
        , {parse_mode: 'HTML'})
})
// 4) /druginfo - find info on drug*
// 5) /pharmacy - search for a local pharmacy
// 6) /feedback - submit a feedback\n*<b>Please note that the sources are from...</b>

// Command: /end
bot.onText(/\/end/, (msg) => {
    bot.sendMessage(
        msg.chat.id,
        `
        Goodbye ${msg.from.first_name}!\nStart me up when you need me again!
        `        
        , {parse_mode: 'HTML'})
    // bot.stopPolling()
})


// Command: /drug
bot.onText(/\/drug/, async (msg) => {
    // Function: ask user for search type and executes searchTypeName() OR searchTypeDosageForm()
    async function askForSearchType() {
        config = {
            reply_markup: {
                "inline_keyboard": [
                    [{ text: 'Search by Name & Active Ingredient', callback_data: 'name' }],
                    [{ text: 'Search by Dosage Form', callback_data: 'form' }]
                ]
            }
        }
        await bot.sendMessage(msg.chat.id, "How would you like to search for the drug?", config)
        // Bot actions based on query type selection by user
        bot.on('callback_query', async (callback) => {
            bot.removeListener("callback_query")
            if (callback.data == "name") { 
                searchTypeName()
            }  else if (callback.data == "form") {
                searchTypeDosageForm()
            }
            
        })
    }
    // Function: search for drugs by name/active ingredients
    async function searchTypeName() {
        var result = []
        var drugName = ""
        // Ask user for drug name
        bot.sendMessage(msg.chat.id, "Enter the name/active ingredient of the drug you want to search for!")
        
        // await searchUtils.displaySearchResultsAsOptions(bot)
        return bot.on('message', async (msg) => {
            bot.removeListener("message")
            drugName = msg.text
            // results of the drugs that matches user's query
            result = await searchUtils.searchDrug(drugName)
            // display results as options for user to select
            let options = result.map((drugObj, i) => {
                let productName = drugObj.product_name
                return [
                    {
                        "text": productName,
                        "callback_data": i
                    }
                ]
            })

            // add extra option to return to search again
            options.push([{"text": "Search Again", "callback_data": "search"}])
            options.push([{"text": "Change Search Type", "callback_data": "change"}])

            // add all options as inline_keybuttons
            let config = {
                reply_markup: {
                    "inline_keyboard": options
                }
            }
            
            bot.sendMessage(msg.chat.id, `Below are your search results for ${drugName.toUpperCase()}! Click for more information.`, config)

            // when option chosen, display information
            bot.on("callback_query", async (callback) => {
                if (callback.data =="search") {
                    bot.removeListener("callback_query")
                    return searchTypeName()
                } else if (callback.data == "change") {
                    bot.removeListener("callback_query")
                    return askForSearchType()
                } else {
                    let drug = result[callback.data]
                    return bot.sendMessage(
                        msg.chat.id,
                        `
                        <b>Product Name</b>: ${drug.product_name}\n<b>Strength</b>: ${drug.strength}\n<b>Route of Administration</b>: ${drug.route_of_administration}\n<b>Classificaion</b>: ${drug.forensic_classification}\n<b>Dosage Form</b>: ${drug.dosage_form}\n
                        `,
                        {parse_mode: 'HTML'}
                    )
                }
                
            })
        })
    }
    // Function: search for drugs by dosage forms
    async function searchTypeDosageForm() {
        console.log("Search by dosage Form")
        bot.sendMessage(msg.chat.id, "Work in progress")
    }

    await askForSearchType()
    

})

















