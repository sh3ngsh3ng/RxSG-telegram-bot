let pharmacies = require("./data/pharmacy.json")
const fs = require("fs")

let writeStream = fs.createWriteStream("pharmacy-category.json")


let result = [
    {
        "pharmacy_type": "Guardian",
        "pharmacy_branches": []
    },
    {
        "pharmacy_type": "Watson's",
        "pharmacy_branches": []
    },
    {
        "pharmacy_type": "Unity",
        "pharmacy_branches": []
    },
    {
        "pharmacy_type": "NHG",
        "pharmacy_branches": []
    },
    {
        "pharmacy_type": "Others",
        "pharmacy_branches": []
    }
]

// Example of result
/*
[
    {
        "pharmacy_type": "Guardian",
        "pharmacy_branches": [
            {"id":0,"postal_code":"59413","building_name":"Chinatown Point 4","unit_number":"34","level_number":"B1","road_name":"NEW BRIDGE ROAD","block_number":"133","pharmacy_name":"Guardian Pharmacy (Chinatown Point 4)","coordinates":[103.844697087192,1.28499883313915,0]},
            {"id":1,"postal_code":"39393","building_name":"City Link","unit_number":"67","level_number":"B1","road_name":"RAFFLES LINK","block_number":"1","pharmacy_name":"Guardian Pharmacy (City Link)","coordinates":[103.854173508666,1.29277773939561,0]}
        ]
    }
]

pharmacy_types: guardian, unity, watsons, nhg, others

*/


// print all pharmacy names
for (let i = 0; i < pharmacies.length; i++) {
    let pharmacy = pharmacies[i]
    let pharmacyName = pharmacy.pharmacy_name.toUpperCase()
    if (pharmacyName.includes("GUARDIAN")) {
        result[0].pharmacy_branches.push(pharmacy)
    } else if (pharmacyName.includes("WATSON'S")) {
        result[1].pharmacy_branches.push(pharmacy)
    } else if (pharmacyName.includes("UNITY")) {
        result[2].pharmacy_branches.push(pharmacy)
    } else if(pharmacyName.includes("NHG")) {
        result[3].pharmacy_branches.push(pharmacy)
    } else {
        result[4].pharmacy_branches.push(pharmacy)
    }
}

writeStream.write(JSON.stringify(result))
writeStream.end()