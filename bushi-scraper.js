const request = require('request');
const html_parser = require('node-html-parser');

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

module.exports = (card_url) => {
    request(card_url, function(error, response, body) {
        if (!error) {
            let full_html = html_parser.parse(body);
            let cardDetail = full_html.querySelector("#cardDetail");
            console.log(cardDetail.structuredText);
        } else {
            console.log(error);
        }
    });
}
