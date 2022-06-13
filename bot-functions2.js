let searchUtils = require('./searchFunctions')


async function searchByNameAndActiveIngredients(bot, msg) {
    bot.sendMessage(msg.chat.id, "Enter the name/active ingredient of the drug you want to search for!")
        .then(async () => {
            bot.once('message', async (callback) => {
                let userInput = callback.text
                // result is the array of drug objects from user's search
                let result = await searchUtils.searchDrug(userInput)
                if (result.length == 0) {
                    bot.sendMessage(callback.chat.id, "No results found. Use the /drug to commence search again.")
                } else {
                    // display search results
                    await displaySearchResults(bot, msg, userInput, result)
                    // add listener to the search results
                    await displayDrugInformation(bot, result)
                    // bot.sendMessage(callback.chat.id, "We found " + result.length + " results related to " + userInput.toUpperCase())
                    bot.sendMessage(callback.chat.id, `
We found ${result.length} results relating to ${userInput.toUpperCase()}!
If you would like to search for more drugs, use the /drug command!
Click on the results above to display more information on the drug!
                    `)
                }
            })
        })

}


async function displaySearchResults(bot, msg, userInput, result) {

    let options = result.map((drugObj, i) => {
        let productName = drugObj.product_name
        return [
            {
                "text": productName,
                "callback_data": i
            },
        ]
    })

    let config = {
        reply_markup: {
            "inline_keyboard": options
        }
    }
    await bot.sendMessage(msg.chat.id, `Below are your search results for ${userInput.toUpperCase()}!`, config)
}

async function displayDrugInformation(bot, result) {
        bot.on("callback_query", async (callback) => {
            let drug = result[callback.data]
            try {
                bot.sendMessage(
                    callback.message.chat.id,
                    `
                    <b>Product Name</b>: ${drug.product_name}\n<b>Strength</b>: ${drug.strength}\n<b>Route of Administration</b>: ${drug.route_of_administration}\n<b>Classificaion</b>: ${drug.forensic_classification}\n<b>Dosage Form</b>: ${drug.dosage_form}\n
                    `,
                    {parse_mode: 'HTML'}
                )
            } catch (err) {
                bot.sendMessage()
            }
            
        })
}


module.exports = {
    searchByNameAndActiveIngredients
}