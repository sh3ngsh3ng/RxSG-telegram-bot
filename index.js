const express = require("express")
const bot = require("./bot.js")
require("dotenv").config()

let app = express()

app.use(express.json())

async function main() {
    app.get("/", (req,res) => {
        console.log("GET request made by aws lambda")
        res.status(200).json({
            message: "live"
        })

    })

    app.post(`/from-aws`, (req,res) => {
        console.log("POST request made by aws lambda")
        console.log(bot)
        bot.processUpdate(req.body)
        res.status(200).json({
            message: "Bot received message"
        })
    })

}

main()

app.listen(process.env.PORT || 9090, () => {
    console.log("Server Started")
})