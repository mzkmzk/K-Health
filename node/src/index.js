let CONSTANT = require('./CONSTANT'),
    inner_interface = require('./inner_interface'),
    handle_url = require('./handle_url')

/*new Reptile({
    url_array: CONSTANT.REPTILE_URL
})*/


var go_health = function(){
    inner_interface
    .init_reptile_url(CONSTANT.REPTILE_URL)
    .then( result => {
        //console.log('then')
        return new Promise( (resolve, reject) =>{
            inner_interface.get_url_tasks()
                .then(result => {
                    //console.log('result ',result)
                    resolve(result)
                }, reject)
        })
        
    })
    .then((result) =>{
        //console.log(result)
        return handle_url.handle(result.data)
    },function(){})
    .catch(err => {
        console.log(err)
    })
}

go_health()

