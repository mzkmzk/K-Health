jest.mock('request-promise')

let request_promise, inner_interface,
     moment = require('moment')

beforeEach(() => {
    inner_interface =  require('../src/inner_interface')
    request_promise = require('request-promise')
    request_promise.__init__()
})

it('test init reptile url', () => {
    return inner_interface.init_reptile_url([
        'QUERY_HAS_DATA_URL',
        'QUERY_NOT_HAS_DATA_URL'
    ]).then(() => {
        expect(request_promise.__param_url_array__.length).toBe(3)
    })
})

it('inner_interface get_url_tasks url is success', () => {

    inner_interface.get_url_tasks().then(() => {
         expect(request_promise.__param_url_array__[0]).toBe( 'http://k-inner-reptile.404mzk.com/v1/Creator_Url_Controller/query?where=' + encodeURIComponent(
            `[{\"condition\":\"<=\",\"value\":\"${moment().add(1,'days').format('YYYY-MM-DD HH:mm:ss')}\",\"key\":\"last_reptile_visit_start_at\"},{\"condition\":\"<>\",\"value\":\"\",\"key\":\"last_reptile_visit_end_at\"},{\"condition\":\"=\",\"value\":\"HEALTH\",\"key\":\"belong\"}]`))

    })
})