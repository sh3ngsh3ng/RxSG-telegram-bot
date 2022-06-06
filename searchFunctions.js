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


module.exports = {
    loadData,
    searchDrug
}