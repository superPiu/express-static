var express = require('express')
var pStatic =require('./PStatic') //自定义中间件

const app = express();
app.use(pStatic('/static',{maxAge:'1d',lastModify:true,etag:false,htmlNoCache:true}))
app.listen(8888,function(){
    console.log("serving on 8888")
})