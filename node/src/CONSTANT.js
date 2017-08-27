module.exports = {
    BASE_URL: 'http://www.sex.com',
    REPTILE_URL: [ //必须是列表
        'http://www.sex.com/videos/teen/',
        'http://www.sex.com/videos/teen/?page=2',
        'http://www.sex.com/videos/teen/?page=3'
    ],
    BELONG: 'HEALTH',
    INNER_URL: {
        QUERY_URL: 'http://k-inner-reptile.404mzk.com/v1/Creator_Url_Controller/query',
        UPDATE_URL: 'http://k-inner-reptile.404mzk.com/v1/Creator_Url_Controller/update',
        INSERT_URL: 'http://k-inner-reptile.404mzk.com/v1/Creator_Url_Controller/insert',
        QUERY_STATIC: 'http://k-inner-reptile.404mzk.com/v1/Creator_Resource_Controller/query',
        INSERT_STATIC: 'http://k-inner-reptile.404mzk.com/v1/Creator_Resource_Controller/insert'
    },
    HEALTH_URL_TYPE: {
        'LIST': 'LIST',
        'DETAIL': 'DETAIL',
        '404': '404',
        'STATIC': 'STATIC',
        'unknown': 'UNKNOWN'
    },
    STATIC_PATH: '../../static',
    STATIC_TMP: '../../static/tmp'
    
}