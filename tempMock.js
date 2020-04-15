const demo = require("@temp/demo");


const funct = ()=>{
    
    return demo.connect()+   demo.disconnect();

}

module.exports = {funct};