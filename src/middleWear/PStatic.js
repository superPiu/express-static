var fs = require('fs')
var url = require('url')
var path = require('path')
var PStatic = function(dir,opts){
    let a = (req,res,next)=>{
        let target = url.parse(req.url).pathname
        //res.send(dir)
        res.sendFile(__dirname+dir+target)
        next()
    }
    return a
   
}
module.exports = PStatic
    
