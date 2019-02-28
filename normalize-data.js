'use strict';

// imports
const fs = require('fs');

// constants
const EN_SETS = require('./en-sets');

// helper functions
// bushi's triggers are inconsistent so let's match em to encore's
function normalizeTriggers(triggers) {
    for (let i = 0; i < triggers.length; i++) {
        if (triggers[i] === "STOCK") {
            triggers[i] = "POOL";
        }
        else if (triggers[i] === "BOUNCE") {
            triggers[i] = "RETURN";
        }
    }
}
// ...any additional normalization functions would go here

// async flag for await
(async () => {
    // go through all the sets
    for (let set of EN_SETS) {
        // read sets from files
        let bushiString = fs.readFileSync('./bushi_output/' + set + '.json', 'utf8');
        let promoString = fs.readFileSync('./promo_output/' + set + '.json', 'utf8');
        let bushiCards = JSON.parse(bushiString);
        let promoCards = JSON.parse(promoString);
        // new up a card list
        let finalCards = [];
        // loop through all the official cards
        for (let card of bushiCards) {
            // normalize any inconsistent data
            normalizeTriggers(card.trigger);
            // push onto final array
            finalCards.push(card);
        }
        // loop through all promo cards
        for (let promo of promoCards) {
            // normalize any inconsistent data
            normalizeTriggers(promo.trigger);
            // push onto final array
            finalCards.push(promo);
        }
        
        // write data to file
        fs.writeFileSync('./final_output/' + set + ".json", JSON.stringify(finalCards, null, 4));
        console.log("-----------------------");
        console.log("SET DONE: " + set);
        console.log("-----------------------");
    }
})();
