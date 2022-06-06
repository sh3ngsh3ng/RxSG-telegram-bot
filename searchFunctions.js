const csvtojson = require('csvtojson')

let filePath = "./data/tp-data.csv"

// load csv data and convert to json
async function loadData() {
    return await csvtojson().fromFile(filePath)
}

// filter json for drug name and active ingredient
async function filterForNameAndActiveIngredient(arrayOfDrugs, drugName) {
    drugName = drugName.toUpperCase()
    let results = await arrayOfDrugs.filter((drugObj) => {
        return drugObj.product_name.includes(drugName) || drugObj.active_ingredients.includes(drugName)
    })
    return results
}

// function to search via drugname (both name and active ingredient)
async function searchDrug(drugName) {
    let data = await loadData(filePath)
    let result = await filterForNameAndActiveIngredient(data, drugName)
    return result
}

// async function displaySearchResultsAsOptions(bot) {
//     bot.on('message', async (msg) => {
//         let drugName = msg.text
//         let result = await searchUtils.searchDrug(drugName)
//         // display results as options
//         let options = result.map((drugObj) => {
//             let productName = drugObj.product_name
//             let productCode = drugObj.atc_code
//             return [
//                 {
//                     "text": productName,
//                     "callback_data": productCode
//                 }
//             ]
//         })

//         let config = {
//             reply_markup: {
//                 "inline_keyboard": options
//             }
//         }
        
//         bot.sendMessage(msg.chat.id, "Below are the search results! Choose 1.", config)

//         // when option chosen, display information
//     })
// }


module.exports = {
    loadData,
    searchDrug
}