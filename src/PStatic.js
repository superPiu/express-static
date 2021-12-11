const fs = require('fs')
const url = require('url')
const crypto = require('crypto')
const utils = require('./utils')
const pStatic = function(dir,opts){
    const defaultOpt = {
        htmlNoCache:false,//支持配置html、htm后缀文件配置无缓存 true 表示禁用缓存
        maxAge:0,
        lastModify:true,
        etag:false,
        defaultPage:'index.html'
    }
    opts = Object.assign(defaultOpt,opts)
    
    function myFun(req,res,next){
        let target = url.parse(req.url).pathname;//取当前请求路径
        const typeArr = ['htm','html','css','js'];//分类别设置res头
        if(target.indexOf('.')== -1){//无后缀路径
            target = target+opts.defaultPage
        }
        
        let fileType = target.split('.')[1];//获取文件后缀
        if((fileType === 'html' || fileType === 'htm') && opts.htmlNoCache){
            //配置html文件无缓存
            opts.maxAge = 0;
        }
        //支持强缓存时间带单位
        if(opts.maxAge != 0){ 
            opts.maxAge = utils.unitToSecond(opts.maxAge) //时间单位转换
        }
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
        let lastModifyTime = ''
        let etag = ''
        let ifCacheHit = false;//是否命中304缓存
        let p1 = new Promise(function(resolve,reject){
            if(opts.lastModify){
                fs.stat(__dirname+dir+target,function(err,stats){
                    if(err){
                        console.log('文件状态读取失败')
                    }
                    else{
                        lastModifyTime = stats.mtime.toGMTString()
                        header['Last-Modified'] = lastModifyTime
                        if(lastModifyTime === req.headers['if-modified-since']){
                            ifCacheHit = true;
                        }
                    }
                    resolve('')
                }); 
            }else{
                resolve('')
            }
        })
        let p2 = new Promise(function(resolve,reject){
            if(opts.etag){
                fs.readFile(__dirname+dir+target,function(err,data){
                    if(err){
                        console.log("文件读取失败")
                    }
                    else{
                        etag = crypto.createHash('md5').update(data).digest('hex')
                        header['Etag'] = etag
                        if(etag === req.headers['if-none-match']){
                            ifCacheHit = true;
                        }
                    }
                    resolve(data)
                })  
            }else{
                resolve('')
            }
        })
        if(opts.lastModify && opts.etag){
            Promise.race([p1,p2]).then((data)=>{
                sendFile(data)
            }).catch((err)=>{
                console.log(err)
            })
        }else{
            Promise.all([p1,p2]).then((data)=>{
                sendFile(data[0] || data[1])
            }).catch((err)=>{
                console.log(err)
            })
        }

        function sendFile(data){
             //设置响应码
            let status = '200'
            if(ifCacheHit){
                status = '304'
                res.writeHead(status,header)
                res.end()
            }else{
                if(data != ''){//如果生成etag的时候读文件成功就不需要再次读取文件内容
                    res.writeHead(status,header)
                    res.end(data)
                }else{
                    fs.readFile(__dirname+dir+target,function(err,data){
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
        
    }
    return myFun
   
}
module.exports = pStatic
    
