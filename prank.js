const TelegramBot = require('node-telegram-bot-api')
require('dotenv').config()
const token = process.env.API_KEY

let bot = new TelegramBot(token)

// for (let i = 0; i< 20; i++) {
//     bot.sendMessage(351870834, "Hello there!!!!")
// }


bot.sendMessage(351870834, "HAHAHA")

