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
    moment = require('moment')
    fse = require('fs-extra'),
    download = {
        by_url: (url_object) => {
            //console.log(_url)
            return new Promise( (resolve, reject) => {
                let url = url_object.url,
                    http_client = url.slice(0, 5) === 'https' ? https : http,
                    file_name = new URL(url).pathname.replace(/\//g, '-'),
                    local_file,target_file, type, file_type, writer,watcher, last_watch_length

                 local_file =  path.join(__dirname, CONSTANT.STATIC_PATH, file_name  )
            
                writer = fs.createWriteStream(local_file)
                /*watcher = fs.watch(local_file, { encoding: 'buffer' }, (eventType, filename) => {
                  if (filename && last_watch_length !== filename.length) {
                    last_watch_length = filename.length
                    console.log( parseInt( filename.length / 1024 / 1024 ) );
                    // Prints: <Buffer ...>
                  }
                });*/
                
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
                    let match = response.headers['content-type'].match(/([^/]*)\/([^/]*)/)

                    type = match[1] || '',
                    file_type = match[2]|| ''
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
                
                writer.on('drain', src => {
                     console.error( moment().format('YYYY-MM-DD HH:mm:ss') +'something is piping into the writer');
                    //   console.log(arguments) 
                })
                
                writer.on('finish', function() {
                    console.log('download finish ' + url + ' to ' + local_file)
                    target_file = path.join(__dirname, CONSTANT.STATIC_PATH,type, file_name + '.' + file_type )
                    //watcher.close()
                    download.move_file(local_file,  target_file )
                    resolve({
                        creator_url_id: url_object.id,
                        local_path:  target_file
                    })
                })
                writer.on('error', function() {
                    console.log('download error ' + url + ' to ' + local_file)
                    
                    resolve({
                        creator_url_id: url_object.id,
                        local_path: 'error'
                    })
                })
                console.log(result.length)
            })   
        },
        move_file: (source_file, target_file) => {
            //let target_dirname = path.dirname(target_file),
                //source_file_stat = fs.fstatSync(source_file),
                //target_file_Stat = fs.fstatSync(target_file)
            console.log( `${source_file} move ${target_file}` )
            console.log(fse.moveSync(source_file, target_file))
        },
        start_check: () => {}
}

module.exports = download