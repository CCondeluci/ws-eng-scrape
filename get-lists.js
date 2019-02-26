'use strict';

// imports
const iconvlite = require('iconv-lite');
const request = require('request-promise-native');
const fs = require('fs');

// set list
const EN_SETS = require('./en-sets');

// async flag for await
(async () => {
    for (let set of EN_SETS) {
        // get html from jk
        var options = {
            url: 'http://jktcg.com/WS_EN/' + set +'/' + set +'.html',
            encoding: null
        };
        let body = await request(options);
        let utf8String = iconvlite.decode(new Buffer(body), "utf16le");
        // write to file
        fs.writeFileSync('./jk_lists/' + set + ".html", utf8String);
    }
})();