const TelegramBot = require('node-telegram-bot-api')
require('dotenv').config()
let searchUtils = require('./searchFunctions')

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


// BOT FUNCTIONS
// Function: search for drugs by dosage forms
async function searchTypeDosageForm(msg) {
    console.log("Search by dosage Form")
    // bot sends message that force user to reply to
    bot.sendMessage(msg.chat.id, "Please type in name of drug", {
        reply_markup: {
            force_reply: true,
            input_field_placeholder: "Brand Name or Active Ingredients"
        }
    })
    // payload is information of the previous msg sent by bot
    .then((payload) => {
        // once user reply to the particular msg, callback function is called
        bot.onReplyToMessage(payload.chat.id, payload.message_id, (callback) => {
            bot.sendMessage(msg.chat.id, "You have chosen =>" + callback.text)
        })
    })
}

// Function: search for drugs by name/active ingredients (rewrite function)
async function searchTypeName(msg) {
    var result = []
    var drugName = ""
    // Ask user for drug name
    bot.sendMessage(msg.chat.id, "Enter the name/active ingredient of the drug you want to search for!")
        .then(() => {
            bot.once('message', async (msg) => {
                drugName = msg.text
                // results of the drugs that matches user's query
                result = await searchUtils.searchDrug(drugName)


                if (result.length == 0) {

                    let options = [
                        [{"text": "Search Again", "callback_data": "search"}],
                        [{"text": "Change Search Type", "callback_data": "change"}]
                    ]
                    bot.sendMessage(msg.chat.id, "No results found", {
                        reply_markup: {
                            "inline_keyboard": options,
                            "one_time_keyboard": true,
                            "resize_keyboard": true
                        }
                        // reply_markup: {
                        //     "keyboard": options,
                        //     "one_time_keyboard": true,
                        //     "resize_keyboard": true
                        // }
                    })
                    .then((callback) => {
                        bot.once("callback_query", async (callback) => {
                            if (callback.data =="search") {
                                bot.editMessageReplyMarkup({
                                    inline_keyboard: []
                                }, {
                                    "message_id": callback.message.message_id, 
                                    "chat_id": callback.message.chat.id
                                })
                                searchTypeName(callback.message)
                            } else if (callback.data == "change") {
                                askForSearchType(callback.message)
                            }
                        })
                    })
                } else {
                    // display results as options for user to select


                    let options = result.map((drugObj, i) => {
                        let productName = drugObj.product_name
                        return [
                            {
                                "text": productName,
                                "callback_data": i
                            },
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
                    
                    // reply user with results
                    bot.sendMessage(msg.chat.id, `Below are your search results for ${drugName.toUpperCase()}! Click for more information.`, config)
                        .then(() => {
                            // when option chosen, display information
                            bot.once("callback_query", async (callback) => {
                                if (callback.data =="search") {
                                    // console.log(msg.chat.id == callback.message.chat.id)
                                    searchTypeName(msg)
                                } else if (callback.data == "change") {
                                    askForSearchType(msg)
                                } else {
                                    // get drug obj from option chosen by user
                                    let drug = result[callback.data]
                                    // send user drug details
                                    bot.sendMessage(
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
            })
        })

}

// Function: entry function for user to choose how they want to search for drugs
async function startDrugSearch(msg) {
    config = {
        reply_markup: {
            "inline_keyboard": [
                [{ text: 'Search by Name & Active Ingredient', callback_data: 'name' }],
                [{ text: 'Search by Dosage Form', callback_data: 'form' }]
            ],
        },
        force_reply: true
    }
    bot.sendMessage(msg.chat.id, "How would you like to search for the drug?", config)
        .then(() => {
            // wait for a callback query depending on what the user chose
            bot.once('callback_query', async (callback) => {
                if (callback.data == "name") { 
                    searchTypeName(msg)
                }  else if (callback.data == "form") {
                    searchTypeDosageForm(msg)
                }
            })
        })
    
}



// BOT COMMANDS
// Command: /start
bot.onText(/\/start/, async (msg) => {
    console.log(`Bot is called by ${msg.from.first_name}`)
    console.log("Bot is currently on local server")
    bot.sendMessage(
        msg.chat.id,
        `
<b>PLEASE NOTE THAT BOT IS STILL CURRENTLY UNDER DEVELOPMENT</b>

Hello <b>${msg.from.first_name}! </b>

I am RxSG! Your friendly <s>druglord</s> Rx Bot!
I'm here to resolve your drug queries!

Below are some of my commands:
  1) /start - start Bot
  2) /end - stop Bot
  3) /drug - search for a drug (in Singapore)

If you wish to contribute or have some suggestions, please feel free to contact me at....
        `        
        , {parse_mode: 'HTML'})
})
// Additional commands to add
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
    console.log(`${msg.from.first_name} is currently searching for drugs`)

    // entry function for searching drugs
    await startDrugSearch(msg)

})


module.exports = {
    bot
}












