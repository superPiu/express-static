var express = require('express')
var path = require('path')
var Router = express.Router()
var PStatic =require('./PStatic') //自定义中间件
console.log(PStatic)

const app = express();
app.use(PStatic('/static',{maxAge:0,LastModify:true,Etag:true}))
app.listen(8888,function(){
    console.log("serving on 8888")
})