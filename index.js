const express = require("express")
const bot = require("./bot")
require("dotenv").config()

let app = express()

app.use(express.json())

async function main() {
    app.get("/", (req,res) => {
        console.log("called")
        res.status(200)
        res.send("Server is Live")
    })

    // webhook
    // app.post(`/${process.env.API_KEY}`)

}

main()

app.listen(process.env.PORT || 9090, () => {
    console.log("Server Started")
})