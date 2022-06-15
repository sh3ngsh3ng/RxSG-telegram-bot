const csvtojson = require('csvtojson')
const axios = require('axios')
const fs = require('fs')
const { bot } = require('./bot3')
const HTMLParser = require('node-html-parser');

let drugFilePath = "./data/tp-data.csv"
// let pharmaciesFilePath = "./data/pharmacy-locations.geojson"
let pharmacies = require("./data/pharmacy.json")
// load csv data of drugs and convert to json
async function loadDrugData() {
    return await csvtojson().fromFile(drugFilePath)
}

// function used to create pharmacy.json
function createPharmacyJson() {
    // let test = HTMLParser.parse(jsonData.features[0].properties.Description)
    // console.log(test.querySelectorAll("td").length)
    // for(let i = 0; i < 9; i++) {
    //     console.log(test.querySelectorAll("td")[i].text)
    // }
    // console.log(typeof(test.querySelectorAll("td")))
    // console.log(test)
    let rawData = fs.readFileSync(pharmaciesFilePath)
    let jsonData = JSON.parse(rawData)
    let listOfPharmacy = jsonData.features
    console.log(jsonData.features.length)

    let result = []
    for (let i = 0; i < jsonData.features.length; i++) {
        let pharmacy = HTMLParser.parse(listOfPharmacy[i].properties.Description)
        let location = listOfPharmacy[i].geometry.coordinates
        result.push({
            "id": i,
            "postal_code": pharmacy.querySelectorAll("td")[0].text,
            "building_name": pharmacy.querySelectorAll("td")[1].text,
            "unit_number": pharmacy.querySelectorAll("td")[2].text,
            "level_number": pharmacy.querySelectorAll("td")[3].text,
            "road_name": pharmacy.querySelectorAll("td")[4].text,
            "block_number": pharmacy.querySelectorAll("td")[5].text,
            "pharmacy_name": pharmacy.querySelectorAll("td")[6].text,
            "coordinates": location
        })

    }

    // console.log(result)

    let writeStream = fs.createWriteStream('pharmacy.json')

    writeStream.write(JSON.stringify(result))
    writeStream.end()
}

// function: filter pharmacy by name (searching in pharmacy_name, building_name, road_name)
function filterPharmacyByNameAndLocation(userInput) {
    let result = pharmacies.filter((drugObj) => {
        let pharmacyName = drugObj.pharmacy_name.toUpperCase().includes(userInput.toUpperCase())
        let buildingName = drugObj.building_name.toUpperCase().includes(userInput.toUpperCase())
        let roadName = drugObj.road_name.toUpperCase().includes(userInput.toUpperCase())
        return pharmacyName || buildingName || roadName
    })
    return result
}

// function: filter pharmacy by postal code (plus minus 10 from user's input)
function filterPharmacyByPostalCode(userInput) {
    userInput = parseInt(userInput)
    let result = pharmacies.filter((drugObj) => {
        let postalCode = parseInt(drugObj.postal_code)
        return (postalCode - userInput <= 10) && (postalCode - userInput >= -10)
    })
    return result
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
async function searchDrug(userInput) {
    let data = await loadDrugData(drugFilePath)
    let result = await filterForNameAndActiveIngredient(data, userInput)
    return result
}

// loadPharmaciesData()

module.exports = {
    loadDrugData,
    searchDrug,
    filterPharmacyByNameAndLocation
}