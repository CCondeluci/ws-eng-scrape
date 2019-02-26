'use strict';

// imports
const fs = require('fs');
const request = require('request-promise-native');
const sharp = require('sharp');

// constants
const EN_SETS = require('./en-sets');
const width = 130;
const height = 182;

// golly gee mister i sure love node
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

// recursive function for 3 tries per image
async function recursiveLookup (options, count) {
    if (count > 3) {
        return false;
    }
    try {
        let body = await request(options);
        return body;
    } catch (error) {
        count++;
        console.log('Failed request...retrying... attempt #' + count);
        recursiveLookup(options, count);
    }
}

// async flag for await, we don't want to DoS bushi
(async () => {
    // go through all the sets
    for (let set of EN_SETS) {
        // read bushi-parsed set from file
        let bushiString = fs.readFileSync('./bushi_output/' + set + '.json', 'utf8');
        let cards = JSON.parse(bushiString);
        // go get the image for every card, compress it, then save it off
        for (let card of cards) {
            // throttleboys
            // await new Promise(resolve => setTimeout(resolve, 5000));
                
            // get the card image
            var options = {
                url: card.image,
                encoding: null
            };
            
            let body = await recursiveLookup(options, 0);
            if (body) {
                let imgBuffer = Buffer.from(body);

                // make set img directory if it doesn't already exist
                if (!fs.existsSync('./images/' + card.side + card.release)){
                    fs.mkdirSync('./images/' + card.side + card.release);
                }

                if (card.type === 'Climax') {
                    sharp(imgBuffer).resize(height, width).png().toFile('./images/' + card.side + card.release + '/' + card.sid + '.gif');
                } else {
                    sharp(imgBuffer).resize(width, height).png().toFile('./images/' + card.side + card.release + '/' + card.sid + '.gif');
                }
                console.log("DONE: " + card.side + card.release + '/' + card.sid);
            } else {
                console.log("COULD NOT GET: " + card.side + card.release + '/' + card.sid);
            }
        }
    }
})();

