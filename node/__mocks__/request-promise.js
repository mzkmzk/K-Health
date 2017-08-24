const RESULT = {
        'QUERY_HAS_DATA_URL': {
            total: 1
        },
        'QUERY_NOT_HAS_DATA_URL': {
            total: 0
        }
    },
    request_promise = function(url) {
        request_promise.__param_url_array__.push(url)
        return new Promise((resolve, reject) => {
            //console.log((url))
            for(key in RESULT) {
                if ( url.indexOf(key) !== -1) {
                    process.nextTick( () => resolve(JSON.stringify(RESULT[key]))  )
                    break
                }
            }
            
        })
    }

request_promise.__init__ = function(){
    request_promise.__param_url_array__ = []
}
module.exports =  request_promise