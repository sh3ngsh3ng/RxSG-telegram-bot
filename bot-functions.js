let searchUtils = require('./searchFunctions')



function deleteMarkup(bot, message_id, chat_id) {
    bot.editMessageReplyMarkup({
        inline_keyboard: []
    }, {
        "message_id": message_id, 
        "chat_id": chat_id
    })
}



// BOT FUNCTIONS
// Function: search for drugs by dosage forms
async function searchTypeDosageForm(bot, msg) {
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
async function searchTypeName(bot, msg) {
    var result = []
    var drugName = ""
    deleteMarkup(bot, msg.message_id, msg.chat.id)

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
                    })
                    .then(() => {
                        bot.once("callback_query", async (callback) => {
                            if (callback.data =="search") {
                                searchTypeName(bot, callback.message)
                            } else if (callback.data == "change") {
                                // askForSearchType(bot, callback.message)
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
                                    searchTypeName(bot, callback.message)
                                } else if (callback.data == "change") {
                                    askForSearchType(bot, callback.message)
                                } else {
                                    deleteMarkup(bot, callback.message.message_id, callback.message.chat.id)
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
async function startDrugSearch(bot, msg) {
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
                    searchTypeName(bot, msg)
                }  else if (callback.data == "form") {
                    searchTypeDosageForm(bot, msg)
                }
            })
        })
    
}


module.exports = {
    searchTypeDosageForm,
    searchTypeName,
    startDrugSearch
}