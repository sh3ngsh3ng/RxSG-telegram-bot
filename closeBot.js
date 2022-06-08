const {bot} = require("./bot2")




async function main () {
    let result = await bot.close()
    console.log(result)
}
main()