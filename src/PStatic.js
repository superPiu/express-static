let fs = require('fs')
let url = require('url')
let crypto = require('crypto')
let pStatic = function(dir,opts){
    let defaultOpt = {
        htmlNoCache:false,//支持配置html、htm后缀文件配置无缓存 true 表示禁用缓存
        maxAge:0,
        lastModify:true,
        etag:false,
        defaultPage:'index.html'
    }
    opts = Object.assign(defaultOpt,opts)
    //支持强缓存时间带单位
    if(opts.maxAge != 0){ 
        
        ((time)=>{
            let unit = time.charAt(time.length - 1)
            let val = +time.substr(0,time.length-1)
            switch (unit){
                case 's':
                   opts.maxAge = val;
                   break;
                case 'm':
                   opts.maxAge = val * 60;
                   break;
                case 'h':
                    opts.maxAge = val * 3600;
                   break;
                case 'd':
                   opts.maxAge = val * 3600 * 24;
                   break;
                case 'M':
                   opts.maxAge = val * 3600 * 24 * 30;
                   break;
                case 'y':
                   opts.maxAge = val * 3600 * 24 * 30 * 365;
                   break;
            }
        })(opts.maxAge)
    }
    /*
    //express sendFile方法基本满足要求,4.*版本目前不支持etag配置
    let a = (req,res,next)=>{
        let option = Object.assign({},opts)
        option.maxAge = option.maxAge * 1000;
        let target = url.parse(req.url).pathname
        res.sendFile(__dirname+dir+target,option)
    }*/
    function myFun(req,res,next){
        let target = url.parse(req.url).pathname;//取当前请求路径
        const typeArr = ['htm','html','css','js'];//分类别设置res头
        const typeImg = ['png','jpg','jpeg'];
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
        let header = {
            'Content-Type':ContentType,
            'Cache-Control':'max-age='+opts.maxAge
        }
        var lastModifyTime = ''
        var etag = ''
        if((fileType === 'html' || fileType === 'htm') && opts.htmlNoCache){
            header['Cache-Control'] = 'no-cache'
            sendFile()
        }else{
            let p1 = new Promise(function(resolve,reject){
                if(opts.lastModify){
                    fs.stat('.'+dir+target,function(err,stats){
                        if(err){
                            console.log('文件状态读取失败')
                        }
                        else{
                            lastModifyTime = stats.mtime.toGMTString()
                            header['Last-Modified'] = lastModifyTime
                        }
                        resolve()
                    }); 
                }else{
                    resolve()
                }
            })
            let p2 = new Promise(function(resolve,reject){
                if(opts.etag){
                    fs.readFile('.'+dir+target,function(err,data){
                        if(err){
                            console.log("文件读取失败")
                        }
                        else{
                            etag = crypto.createHash('md5').update(data).digest('hex')
                            header['Etag'] = etag
                        }
                        resolve()
                    })  
                }else{
                    resolve()
                }
            })
            Promise.all([p1,p2]).then(()=>{
                sendFile()
            })
             
        }
        //根据配置项设置响应对象头

        function sendFile(){
             //设置响应码
            let status = '200'
            if(!(opts.htmlNoCache && (fileType == 'html'|| fileType == '.htm')) && (opts.lastModify && lastModifyTime === req.headers['if-modified-since'] || opts.etag && etag === req.headers['if-none-match'])){
                status = '304'
                res.writeHead(status,header)
                res.end()
            }else{
                fs.readFile('.'+dir+target,function(err,data){
                    if (err) {
                        res.writeHead('404')
                        res.end('资源未找到')
                    } else {
                        res.writeHead(status,header)
                        res.end(data)
                    }
                    
                })
            }
            
        } 
        
    }
    return myFun
   
}
module.exports = pStatic
    
