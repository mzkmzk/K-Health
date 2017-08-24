let http = require('http'),
    https = require('https'),
    fs = require('fs'),
    queue = require('queue'),
    path = require('path'),
    _url  = require('url'),
    URL = _url.URL,
    Agent = require('socks5-http-client/lib/Agent'),
    request = require('request'),
    CONSTANT = require('./CONSTANT'),
    download = {
        by_url: (url_object) => {
            //console.log(_url)
            return new Promise( (resolve, reject) => {
                let url = url_object.url,
                    http_client = url.slice(0, 5) === 'https' ? https : http,
                    file_name = new URL(url).pathname.replace(/\//g, '-'),
                    local_file, writer,watcher, last_watch_length

                /*if (type === 'IMAGE'){
                    local_file = path.join(__dirname, '../../','./download','./images/', file_name +'.png')
                    
                }else if (type === 'VIDEO'){
                    local_file = path.join(__dirname, '../../','./download','./videos/', file_name + '.mp4')
                    
                }*/
                 local_file =  path.join(__dirname, CONSTANT.STATIC_PATH, file_name +'.mp4' )
                //console.log(local_file)
                writer = fs.createWriteStream(local_file)
                /*watcher = fs.watch(local_file, { encoding: 'buffer' }, (eventType, filename) => {
                  if (filename && last_watch_length !== filename.length) {
                    last_watch_length = filename.length
                    console.log( parseInt( filename.length / 1024 / 1024 ) );
                    // Prints: <Buffer ...>
                  }
                });*/
                writer.on('finish', function() {
                    console.log('download finish ' + url + ' to ' + local_file)
                    //watcher.close()

                    resolve({
                        creator_url_id: url_object.id,
                        local_path: local_file
                    })
                })
                console.log('download start ' + url + ' to ' + local_file)
                let result = request({
                            url,
                            agentClass: Agent,
                            agentOptions: {
                                socksHost: 'localhost', // Defaults to 'localhost'. 
                                socksPort: 1080 // Defaults to 1080. 
                            }
                        })
                .on('response', function(response) {
                    let match = response.headers['content-type'].match(/([^/]*)\/([^/]*)/),
                        type = match[1] || '',
                        file_type = match|| ''
                    console.log(response.statusCode) // 200 
                    console.log(response.headers['content-type']) // 'image/png' 
                    console.log( parseInt(response.headers['content-length'] / 1024 / 1024) +'M' ) // 'image/png' 

                        /*if ( parseInt(response.headers['content-length'] / 1024 / 1024) >= 10  ){
                            result.pipe(writer);
                        }else {
                            resolve({
                                creator_url_id: url_object.id,
                                local_path: 'to so smart'
                            })
                        }*/
                  })
                .on('error', function(err) {
                    console.log(err)
                  })
                .pipe(writer)
            })
            
        }
}

module.exports = download