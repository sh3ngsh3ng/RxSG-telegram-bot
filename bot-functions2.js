const { bot } = require('./bot3')
let searchUtils = require('./searchFunctions')

// serach for drugs by name and active ingredients
async function searchByNameAndActiveIngredients(bot, msg) {
    bot.sendMessage(msg.chat.id, "Enter the name/active ingredient of the drug you want to search for!")
        .then(() => {
            bot.once('message', async (callback) => {
                let userInput = callback.text
                // result is the array of drug objects from user's search
                let result = await searchUtils.searchDrug(userInput)
                if (result.length == 0) {
                    bot.sendMessage(callback.chat.id, "No results found. Use the /drug to commence search again.")
                } else {
                    // display search results
                    await displaySearchResultsForDrugs(bot, msg, userInput, result)
                    // add listener to the search results
                    await displayDrugInformation(bot, result)
                    // bot.sendMessage(callback.chat.id, "We found " + result.length + " results related to " + userInput.toUpperCase())
                    bot.sendMessage(callback.chat.id, `
We found <b>${result.length}</b> results relating to ${userInput.toUpperCase()}!
If you would like to search for more drugs, use the /drug command!
Click on the results above to display more information on the drug!
                    `,{parse_mode: 'HTML'})
                }
            })
        })

}

// search for pharmacy by name and location
async function searchPharmacyByNameAndLocation(bot, msg) {
    bot.sendMessage(msg.chat.id, "Enter the name/location of the pharmacy you want to search for!")
        .then(() => {
            bot.once('message', async (callback) => {
                let userInput = callback.text
                let result = await searchUtils.filterPharmacyByNameAndLocation(userInput)

                if (result.length == 0) {
                    bot.sendMessage(callback.chat.id, "No results found. Use the /pharmacy to commence search again")
                } else {
                    //display search results
                    await displaySearchResultsForPharmacy(bot, msg, userInput, result)
                    // add listener to the search results
                    await displayPharmacyInformation(bot, result)
                    // 
                }
            })
        })
}


async function displaySearchResultsForDrugs(bot, msg, userInput, result) {

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

async function displaySearchResultsForPharmacy(bot, msg, userInput, result) {

    let options = result.map((pharmObj, i) => {
        let pharmacyName = pharmObj.pharmacy_name
        return [
            {
                "text": pharmacyName,
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

async function displayPharmacyInformation(bot, result) {
    bot.on("callback_query", async (callback) => {
        let pharmacy = result[callback.data]
        bot.sendMessage(
            callback.message.chat.id,
            `
<b>Place: </b> ${pharmacy.pharmacy_name}
<b>Road: </b> ${pharmacy.road_name}
<b>Building: </b> ${pharmacy.building_name}
<b>Block Number: </b> ${pharmacy.block_number}
<b>Level: </b> ${pharmacy.level_number}
<b>Unit: </b> ${pharmacy.unit_number}
            `,
            {parse_mode: 'HTML'}
        )
    })
}

module.exports = {
    searchByNameAndActiveIngredients,
    searchPharmacyByNameAndLocation
}