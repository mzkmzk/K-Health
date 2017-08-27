
let cheerio = require('cheerio'),
    inner_interface = require('./inner_interface'),
    CONSTANT = require('./CONSTANT'),
    download = require('./download'),
    utils = require('./utils'),
    exec = require('child_process').exec,
    _url  = require('url'),
    URL = _url.URL,
    moment = require('moment'),
    queue = require('queue'),
    handle_url_q = new queue({
        concurrency:  1,
        autostart: true
    });

handle_url_q.on('error', function(err, job){
    console.log(arguments)
    throw 'qqqq'
    return false
})
let handle_url = {
    /**
     * url_object 属性
     * url: 必有
     * type: 可选 
     */
    handle: url_object => {
        //console.log(url_object)
        if (url_object instanceof Array) {
            url_object.map( url_object_one => {
                return handle_url.handle(url_object_one)
            })
            return 
        }
        //console.log(url_object)
       
        handle_url_q.push(cb => {
            let url = url_object.url
            if ( url_object.type === 'STATIC' ) {
                handle_url.handle_static(url_object)
                    .then(() => {
                        //console.log(1111)
                        cb()
                    })
                    .catch(console.log)

                return 
            }
            console.info(url+ ' 开始被拉取')
            exec('export ALL_PROXY=socks5://127.0.0.1:1080 & curl -i '+ url,{maxBuffer: 1024 * 500}, (error, stdout, stderr) => {
                if(error) {
                    console.error(`exec error: ${error}`)
                }
                if ( stdout.trim() === '') {
                    console.log(url + 'content is empty')
                    cb()
                    return
                }
                let $ = cheerio.load(stdout),
                    url_type = handle_url.check_url_type($, url)

                if ( url_type ===  'LIST') {
                    handle_url.handle_health_list(url_object, $ )
                        .then(function(){
                            cb()
                        })
                }else if ( url_type === 'DETAIL'){
                    handle_url.handle_health_detail(url_object, $)
                        .then(function(){
                            cb()
                        })
                }else if (url_type === '404'){
                    handle_url.handle_health_404(url_object)
                        .then(function(){
                            cb()
                        })
                }else {
                    console.log('handle url is not handle')
                    handle_url.handle_health_unknown(url_object)
                        .then(function(){})
                    cb()
                }
                //cb()
            })
        })
        /*return new Promise( (resolve, reject) => {
            
        })*/
    },
    handle_static: url_object => {
        console.log(url_object)
        return inner_interface.query_static(url_object)
            .then(result => {
                if (result.total === 0 ){
                    return download.by_url(url_object)
                        .then( static_object => {
                            return inner_interface.create_static(static_object)
                        })
                }
            })
            .then( () => {
                //url_object.last_reptile_visit_end_at = utils.get_date_time()
                return inner_interface.update_url(url_object)
            })
    },
    handle_health_unknown: (url_object) => {
        url_object.type = CONSTANT.HEALTH_URL_TYPE['unknown']
        return inner_interface.update_url(url_object)
    },
    handle_health_404: url_object => {
        url_object.type = CONSTANT.HEALTH_URL_TYPE['404']
        return inner_interface.update_url(url_object)
    },
    handle_health_detail: (url_object, $) => {
        let health_content = {
            title: ''
        }
        console.info(url_object.url +' 捕抓到: ' + utils.get_video_src($, url_object.url) + '视频')
        if ( utils.get_video_src($, url_object.url) ) {
                
                inner_interface.update_url(url_object)
                return inner_interface.create_url_task([{
                    url:  CONSTANT.BASE_URL +  utils.get_video_src($, url_object.url),//$(element).attr('href'),
                    referer: url_object.url,
                    type: CONSTANT.HEALTH_URL_TYPE.STATIC,
                    belong: CONSTANT.BELONG
                }])
             //download.by_url(CONSTANT.BASE_URL + utils.get_video_src($, url),'VIDEO')
        }else {

            console.info(utils.get_video_src($, url_object.url) + ': 为非法url')
            return Promise.resolve()
        }
    },
    handle_health_list: (url_object, $) => {
        console.log(new URL(url_object.url))
        let current_url = new URL(url_object.url),
            page = current_url.searchParams.get('page'),
            detail_page_array = $('.image_wrapper'),
            next_page = page ?  parseInt(page)  + 1 : 2,
            next_page_url = current_url.searchParams.set('page',next_page),
            detail_page_array_url = []
        
        console.info(url_object.url +' 捕抓到: ' + detail_page_array.length + '个详情页')
        //抓取所有详情
        detail_page_array.each((index, element) => {
            //上交
            detail_page_array_url.push($(element))
            //this.start( CONSTANT.BASE_URL +  $(element).attr('href'), 'DETAIL')
        })
        console.log(detail_page_array_url)
        return detail_page_array_url.reduce( (promise, current) => {
            return promise.then( () => {
                return inner_interface.create_url_task([{
                            url:  CONSTANT.BASE_URL +  $(current).attr('href'),
                            referer: url_object.url,
                            type: CONSTANT.HEALTH_URL_TYPE.DETAIL,
                            belong: CONSTANT.BELONG
                        }])
            })
        }, Promise.resolve())
        .then(() => {
            console.log(`捕抓到下一页列表 ${next_page_url} ${current_url}`)
            //开始下一页
            //this.start(next_page_url)
            inner_interface.create_url_task([{
                url: current_url,
                referer: url_object.url,
                type: CONSTANT.HEALTH_URL_TYPE.LIST,
                belong: CONSTANT.BELONG
            }])
        })
        .then( () => {
            url_object.type = CONSTANT.HEALTH_URL_TYPE.LIST
            url_object.last_reptile_visit_end_at = utils.get_date_time()
            return inner_interface.update_url(url_object)
        })
        
    },

    check_url_type: ($, url) => {

        let type
        if ($('.pagination').length === 1) { //有分页的列表页
            type = CONSTANT.HEALTH_URL_TYPE.LIST
        }else if ($('video').length === 1) { //有video标签的详情页
            type = CONSTANT.HEALTH_URL_TYPE.DETAIL
        }else if ($('#error_page').length === 1){ //有错误id的404页面
            type =  CONSTANT.HEALTH_URL_TYPE['404']
        }
        console.info(url + ' 的类型是: ' + type)
        return type
    }

}

module.exports = handle_url