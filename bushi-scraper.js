const request = require('request');
const html_parser = require('node-html-parser');

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

module.exports = (card_url) => {
    request(card_url, function(error, response, body) {
        if (!error) {
            let full_html = html_parser.parse(body);
            let cardDetail = full_html.querySelector("#cardDetail");
            let detailRows = cardDetail.querySelectorAll('tr');
            let card = {};
            for (let detailRow of detailRows) {
                let dataRows = detailRow.querySelectorAll('td');
                let headerRows = detailRow.querySelectorAll('th');
                for (let i = 0; i < dataRows.length; i++) {
                    if (headerRows[i] !== undefined) {
                        let currHeader = headerRows[i].structuredText;
                        let currData = dataRows[i].structuredText;
                        let currDataRaw = dataRows[i];
                        if (currHeader == "Color" || currHeader == "Side") {
                            card[currHeader] = currDataRaw.innerHTML.match(/(?<=\/partimages\/)(.*?)(?=\s*\.gif)/gi)[0].toUpperCase();
                        } 
                        else if (currHeader == "Trigger") {
                            let triggerCheck = currDataRaw.innerHTML.match(/(?<=\/partimages\/)(.*?)(?=\s*\.gif)/gi);
                            if (triggerCheck.length > 1) {
                                card[currHeader] = 'TWO SOUL';
                            } else {
                                card[currHeader] = triggerCheck[0].toUpperCase();
                            }
                        }
                        else if (currHeader == "Soul") {
                            let soulArr = currDataRaw.querySelectorAll('img');
                            card[currHeader] = soulArr.length;
                        }
                        else if (currHeader == "Special Attribute") {
                            card['Attributes'] = currData.split(' ・ ');
                        }
                        else if (currHeader == "Text") {
                            card[currHeader] = currData.split('\n');
                        }
                        else if (currHeader == "Card No.") {
                            card['Code'] = currData;
                        }
                        else if (currHeader == "Card Type") {
                            card['Type'] = currData;
                        }
                        else if (currHeader == "Card Name") {
                            // do not push to object
                        }
                        else {
                            card[currHeader] = currData;
                        }
                    }
                }
            }
            console.log(card);
        } else {
            console.log(error);
        }
    });
}
