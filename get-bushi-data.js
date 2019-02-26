'use strict';

// imports
const bushi_scraper = require('./bushi-scraper');
const fs = require('fs');

// constants
const EN_SETS = require('./en-sets');

// async flag for await, we don't want to DoS bushi
(async () => {
    // go through all the sets
    for (let set of EN_SETS) {
        // read jk-parsed set from file
        let jkString = fs.readFileSync('./jk_output/' + set + '.json', 'utf8');
        let cards = JSON.parse(jkString);
        // new up a card list
        let bushiCards = [];
        for (let card of cards) {
            // throttleboys
            // await new Promise(resolve => setTimeout(resolve, 5000));
                
            // get the card data
            let bushiCard = await bushi_scraper.get(card, 0);
            console.log("DONE: " + bushiCard.side + bushiCard.release + '/' + bushiCard.sid);
            bushiCards.push(bushiCard);
        }

        // get all the cards that failed to match and put them in
        let finalOutput = [];
        let errorOutput = [];
        for (let outputCard of bushiCards) {
            if (outputCard.NO_BUSHI_DATA === true) {
                errorOutput.push(outputCard);
            } else {
                finalOutput.push(outputCard);
            }
        }
        
        // write data to file
        fs.writeFileSync('./bushi_output/' + set + ".json", JSON.stringify(finalOutput, null, 4));
        fs.writeFileSync('./failed_bushi_output/' + set + ".json", JSON.stringify(errorOutput, null, 4));
        console.log("-----------------------");
        console.log("SET DONE: " + set);
        console.log("-----------------------");
    }
})();