
let exec = require('child_process').exec,
    cheerio = require('cheerio'),
    test,
    JSONC = require('json-comments'),
    http = require('http'),
    https = require('https'),
    fs = require('fs'),
    shttp = require('socks5-http-client'),
    Agent = require('socks5-http-client/lib/Agent'),
    request = require('request')

test = {
    get_video: () => {
        exec('export ALL_PROXY=socks5://127.0.0.1:1080 & curl -i http://www.sex.com/pin/54620678-enjoy/',{maxBuffer: 1024 * 500}, (error, stdout, stderr) => {
            if(error) {
                console.error(`exec error: ${error}`)
            }
            console.log(stdout)
            let $ = cheerio.load(stdout)
            console.log('video is ' + $('video').attr('src'))
            //正则匹配player.updateSrc
        })
    },
    video_src_json: () => {
        console.log( JSON.parse("[{src:'/video/stream/620286',type:'video/mp4',label:'SD',res:360},{src:'/video/stream/620286/hd',type:'video/mp4',label:'HD',res:720}]\n".replace(/'/g,'"').replace(/(\s*?{\s*?|\s*?,\s*?)(['"])?([a-zA-Z0-9]+)(['"])?:/g, '$1"$3":')))
    },
    download_video: () => {
        let local_file = '/Users/maizhikun/Learning/apache_sites/K-Health/download/videos/test-video-stream-'
            writer =  fs.createWriteStream(local_file),
            url = 'http://videos1.sex.com/stream/2017/06/19/619583.mp4'
        writer.on('finish', function() {
            console.log('download finish ' + url + ' to ' + local_file)
        })
        console.log('download start ' + url + ' to ' + local_file)
        http.get(url, function(response) {
            response.pipe(writer);
        })
    },
    download_video_by_socket5: () => {
        let local_file = '/Users/maizhikun/Learning/apache_sites/K-Health/download/videos/test-video-stream-'+ new Date().getTime() +'.mp4'
            writer =  fs.createWriteStream(local_file),
            url = 'http://www.sex.com/video/stream/619583'
        writer.on('finish', function() {
            console.log('download finish ' + url + ' to ' + local_file)
        })
        console.log('download start ' + url + ' to ' + local_file)
        request({
            url,
            agentClass: Agent,
            agentOptions: {
                socksHost: 'localhost', // Defaults to 'localhost'. 
                socksPort: 1080 // Defaults to 1080. 
            }
        }).pipe(writer);
    }

}

test.download_video_by_socket5()

module.exports = test