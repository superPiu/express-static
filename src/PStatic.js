var fs = require('fs')
var url = require('url')
var path = require('path')
var crypto = require('crypto')
var PStatic = function(dir,opts){
    var defaultOpt = {
        maxAge:0,
        LastModify:true,
        Etag:false,
        defaultPage:'index.html'
    }
    opts = Object.assign(defaultOpt,opts)
    /*
    //express sendFile方法基本满足要求,4.*版本目前不支持etag配置
    let a = (req,res,next)=>{
        let option = Object.assign({},opts)
        option.maxAge = option.maxAge * 1000;
        let target = url.parse(req.url).pathname
        res.sendFile(__dirname+dir+target,option)
    }*/
    let myFun = (req,res,next)=>{
        let target = url.parse(req.url).pathname;//取当前请求路径
        let typeArr = ['htm','html','css','js'];//分类别设置res头
        let typeImg = ['png','jpg','jpeg'];
        if(target.indexOf('.')== -1){//无后缀路径
            target = target+opts.defaultPage
        }
        
        let fileType = target.split('.')[1];//获取文件后缀
        if(typeArr.includes(fileType)){
            ContentType = 'text/'+fileType+';charset=utf-8'
        }else{
            ContentType = 'image/'+fileType
        }
        //根据配置项设置响应对象头
        var header = {
            'Content-Type':ContentType,
            'Cache-Control':'max-age='+opts.maxAge
        }
        if(opts.LastModify == true){
           var stat = fs.statSync('.'+dir+target);
           header['Last-Modified'] = stat.mtime.toGMTString()
        }
        var etag = ''
        if(opts.Etag){
            fs.readFile('.'+dir+target,function(err,data){
                etag = crypto.createHash('md5').update(data).digest('hex')
                header['Etag'] = etag
                sendFile()
            })  
        }else{
            sendFile()
        }
        //根据配置项设置响应对象头

        var sendFile = ()=>{
             //设置响应码
            var status = '200'
            if(opts.LastModify && stat.mtime.toGMTString() === req.headers['if-modified-since'] || opts.Etag && etag === req.headers['if-none-match']){
                status = '304'
            }
            fs.readFile('.'+dir+target,function(err,data){
                if (err) {
                    console.log("失败");
                    console.log(err);
                } 
                res.writeHead(status,header)
                res.end(data)
            })
        }
            
       
        
    }
    return myFun
   
}
module.exports = PStatic
    
