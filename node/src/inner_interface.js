let //rp = require('request-promise'),
    utils = require('./utils'),
    { rp } = utils,
    CONSTANT = require('./CONSTANT'),
    _ = require('underscore'),
    moment = require('moment'),
    inner_interface = {
        get_url_tasks: () => {
            return rp(utils.get_url(CONSTANT.INNER_URL.QUERY_URL, {
                where: {
                    last_reptile_visit_start_at: { // 被领超过一天 或者没被领的情况
                        condition: '<=',
                        value: moment().add(1,'days').format('YYYY-MM-DD HH:mm:ss') //一天内没处理
                    },
                    last_reptile_visit_end_at: { //任务未完成
                        condition: '<>',
                        value: ''
                    },
                    belong: {
                        condition: '=',
                        value: CONSTANT.BELONG
                    }
                }
            }))
            .then(result => {
               // console.log('get_url_tasks success ', JSON.stringify(JSON.parse(result),null, 2))
                return new Promise( (resolve, reject) => {
                    //console.log('result ',result)
                    if (result.total > 0) resolve(result)
                    else reject(result)
                })
            }, (...args) => {
               // console.log('get_url_tasks error ', args)
            })
        },
        query_static: url_object => {
            return rp(utils.get_url(CONSTANT.INNER_URL.QUERY_STATIC, {
                creator_url_id: url_object.id
            }))
        },
        create_static: static_object => {
            return rp(utils.get_url(CONSTANT.INNER_URL.INSERT_STATIC, { 
                creator_url_id: static_object.creator_url_id ,
                local_path: static_object.local_path
            }))
        },
        create_url_task: (reptile_array) => {
            return reptile_array.reduce((promise, current) => {
                return promise.then( () => {
                    return rp(utils.get_url(CONSTANT.INNER_URL.QUERY_URL, { url: current.url }) )
                                .then( result => {
                                    return new Promise( (resolve, reject) => {
                                        //console.log(result)

                                        if ( result && result.total == 1 ) resolve()
                                        else reject(current.url)
                                    })
                                })
                                .then(() => Promise.resolve(), url => {
                                    return rp(utils.get_url(CONSTANT.INNER_URL.INSERT_URL, current))
                                })
                })
            }, Promise.resolve())
        },
        update_url: url_object => {
            url_object.last_reptile_visit_end_at = utils.get_date_time()
            delete url_object.updated_at
            return rp(utils.get_url(CONSTANT.INNER_URL.UPDATE_URL, url_object))
        },
        init_reptile_url: (reptile_url_array) => {
            return inner_interface.create_url_task(
                _.map(reptile_url_array, element => {
                    
                    return {
                        url: element,
                        referer: 'INIT',
                        belong: CONSTANT.BELONG
                    }
                })
            )
        }
    }


module.exports = inner_interface