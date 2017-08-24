let rp = require('request-promise'),
    _ = require('underscore'),
    moment = require('moment'),
    rp_promise =  Promise.resolve()
    utils = {
        object_to_array: _object => {
            let _array = []
            _.mapObject(_object, (element, key) => {
                element.key = key
                _array.push(element)
            })
            return _array
        },
        get_url: (url, params) => {
            let param_string = ''
            for( key in params ) {
                if ( params[key] instanceof Object) {
                    params[key] = JSON.stringify( utils.object_to_array( params[key] )   )
                }
                param_string += key + '=' +  encodeURIComponent(params[key]) +'&'
            }
            return url + '?' + param_string.slice(0, -1)
        },
        get_date_time: () => {
            return moment().format('YYYY-MM-DD HH:mm:ss')
            //let date = new Date()
            //return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getseconds()}}` 
        },
        rp: (...args) => {
            console.log('rp url is '+ decodeURIComponent( args[0]))
            return rp_promise.then(() => {
                return new Promise( (resolve, reject) => {
                    return rp.apply(null, args).then(result => {
                        let _result = JSON.parse(result)
                        console.log('rp success ', JSON.stringify(_result,null, 2))
                        //return new Promise ( (resolve,_ ) => {
                             resolve(_result)
                        //}) 
                        
                    }, result=>{
                        try {
                            let _result = JSON.parse(result)
                            console.log('rp error ', JSON.stringify(_result,null, 2))
                            //return new Promise ( (_,reoject ) => {
                                reoject(_result)
                            //})
                        }catch(e){
                            reject()
                            throw 'result error '
                            console.error(`rp url ${args[0]} catch `,result)
                        }
                        
                    })
                })
            })
            
        },
        /*rp: (...args) => {
            console.log('rp url is '+ decodeURIComponent( args[0]))
            return rp.apply(null, args).then(result => {
                let _result = JSON.parse(result)
                console.log('rp success ', JSON.stringify(_result,null, 2))
                return new Promise ( (resolve,_ ) => {
                     resolve(_result)
                }) 
                
            }, result=>{
                try {
                    let _result = JSON.parse(result)
                    console.log('rp error ', JSON.stringify(_result,null, 2))
                    return new Promise ( (_,reoject ) => {
                        reoject(_result)
                    })
                }catch(e){
                    console.error(`rp url ${} catch `,result, e)
                }
                
            })
        },*/
        get_video_src: ($, url) =>{
            let src ,
                json_obj,
                json_string 
            try{
                //console.log($.html())
                //console.log($.html().match(/updateSrc\(([^)]+)/)[1])
                //console.log($.html().match(/updateSrc\(([^)]+)/)[1].replace(/\s/g,'').replace(/,]/g,']'))
                json_string = $.html().match(/updateSrc\(([^)]+)/)[1]
                                        .replace(/\s/g,'')//换行和空白
                                        .replace(/,]/g,']') //去掉,]的情况
                                        .replace(/'/g,'"')//单引号改为双引号方便json
                                        .replace(/(\s*?{\s*?|\s*?,\s*?)(['"])?([a-zA-Z0-9]+)(['"])?:/g, '$1"$3":')//无单双引号的key和value强行加
                json_obj = JSON.parse(json_string)
                src = json_obj[json_obj.length - 1].src //最后清晰度越高
            }catch(e){
                console.log(e)
                console.log(url +' get video error')
            }
            return src
        },
        console_log: (message, type) => {
            console.log(message)
        }
    }

module.exports = utils
