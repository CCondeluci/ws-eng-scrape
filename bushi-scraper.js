// imports
const request = require('request-promise-native');
const html_parser = require('node-html-parser');

// golly gee mister i sure love node
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

module.exports.get = async (jk_card) => {
    try {
        // go get the card data from bushi's site
        let body = await request(jk_card.bushi);
        // parse and index full html response
        let full_html = html_parser.parse(body);
        // rip the card detail (praise bushi for ID-ing it) and get all table rows
        let cardDetail = full_html.querySelector("#cardDetail");
        let detailRows = cardDetail.querySelectorAll('tr');
        // sometimes, bushi doesn't index their SPs/SSPs consistently
        // fortunately, this is an easy check, albeit a little risky
        // assumption made is that JK data is well-formed, which it has been
        // set a flag for a recursive try, so we can use the right code but still get card detail
        if (detailRows.length < 1) {
            jk_card.bushiError = true;
            jk_card.bushi = jk_card.bushi.substring(0, jk_card.bushi.length - 1);
            return await module.exports.get(jk_card);
        } else {
            jk_card.bushiError = false;
        }
        // get the card name element w/ annoying quotation marks by exploiting 'katakana' field
        let cardNameElem = cardDetail.querySelector('.kana');
        // build card from table row data
        let card = {};
        for (let detailRow of detailRows) {
            // table breaks down to associated arrays
            let dataRows = detailRow.querySelectorAll('td');
            let headerRows = detailRow.querySelectorAll('th');
            for (let i = 0; i < dataRows.length; i++) {
                // table sometimes has bunk rows, so skip those
                if (headerRows[i] !== undefined) {
                    // praise bushi yet again for consistent naming conventions
                    let currHeader = headerRows[i].structuredText;
                    let currData = dataRows[i].structuredText;
                    let currDataRaw = dataRows[i];
                    // use the file time to rip color and 'side' (LOL)
                    if (currHeader == "Color" || currHeader == "Side") {
                        card[currHeader] = currDataRaw.innerHTML.match(/(?<=\/partimages\/)(.*?)(?=\s*\.gif)/gi)[0].toUpperCase();
                    } 
                    // triggers get set as an array for climaxes
                    else if (currHeader == "Trigger") {
                        let triggerCheck = currDataRaw.querySelectorAll('img');
                        let triggers = [];
                        for (let triggerImg of triggerCheck) {
                            triggers.push(triggerImg.toString().match(/(?<=\/partimages\/)(.*?)(?=\s*\.gif)/gi)[0].toUpperCase());
                        }
                        card[currHeader] = triggers;
                    }
                    // processing soul as int
                    else if (currHeader == "Soul") {
                        let soulArr = currDataRaw.querySelectorAll('img');
                        card[currHeader] = soulArr.length;
                    }
                    // SHOULD split everything off
                    else if (currHeader == "Special Attribute") {
                        card['Attributes'] = currData.split(' ・ ');
                    }
                    // processed as an array, split on effects
                    else if (currHeader == "Text") {
                        card[currHeader] = currData.split('\n');
                    }
                    // we already have this from JK, but better to take it from bushi
                    else if (currHeader == "Card No.") {
                        // sometimes bushi messes up
                        if (jk_card.bushiError) {
                            card['Code'] = jk_card.code;
                        } 
                        // sometimes bushi is right
                        else {
                            card['Code'] = currData;
                        }
                    }
                    // character, event, or climax
                    else if (currHeader == "Card Type") {
                        card['Type'] = currData;
                    }
                    // get bushi's real card name (w/ annoying quotes)
                    else if (currHeader == "Card Name") {
                        card['Name'] = cardNameElem.structuredText.trim();
                    }
                    else if (currHeader == "Illustrator") {
                        // do not add, is not used
                    }
                    else {
                        card[currHeader] = currData;
                    }
                }
            }
        }
        // add jk's image since it's better quality on average
        card['Image'] = jk_card.img;
        // return the card
        return card;
    } catch (error) {
        console.log(error);
    }
}
