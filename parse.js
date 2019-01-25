'use strict';

// imports
const html_parser = require('node-html-parser');
const bushi_scraper = require('./bushi-scraper');
const fs = require('fs');

// command line args
const args = process.argv.slice(2);
const filename = args[0];

// script settings
const BUSHI_SCRAPE = false;

// async flag for await, we don't want to DoS bushi
(async () => {
    // read local html file (could be replaced w/ GET)
    let jkString = fs.readFileSync(filename, 'utf8');
    // divide jktcg page into html blocks, removing the first
    let rarityBlocks = jkString.match(/((<h1>.*<\/h1>)[\s\S]*?(?=(<h1>.*<\/h1>)))/g);
    rarityBlocks.shift();
    // get the promo block (if it exists)
    let promoBlock = jkString.match(/(<h1>.*PR - Promo.*<\/h1>)[\s\S]*/g);
    if (promoBlock !== null && promoBlock[0] !== undefined && promoBlock[0] !== null) {
        rarityBlocks.push(promoBlock[0]);
    }
    // loop thru blocks, parse them with html parser\
    let setCards = [];
    for (let block of rarityBlocks) {
        // parse block, get the rarity for the current block
        let root = html_parser.parse(block);
        let rarity = root.querySelector("h1").innerHTML.trim();
        let cells = root.querySelectorAll("td");
        // loop through all card cells
        for (let cell of cells) {
            // cell structured inner HTML text follows this pattern:
            // [    'RZ/S46-E001SP',  // code
            //      'Available:\t0',  // availability
            //      'Price: $60.00',  // price
            //      'Royal Election Candidate, Felt' ] // name
            let dataArr = cell.structuredText.split('\n');
            // make sure we didn't split out a bunk cell
            if (dataArr[1] !== undefined) {
                // build the card object
                let card = {
                    code: dataArr[0],
                    availability: dataArr[1].split('\t')[1],
                    price: dataArr[2].split('$')[1],
                    name: dataArr[3],
                    rarity: rarity.split('-')[0].trim(),
                    bushi: 'https://en.ws-tcg.com/cardlist/list/?cardno=' + dataArr[0],
                    img: 'http://jktcg.com/WS_EN/' + filename.split(".")[0] + '/' + dataArr[0].replace(/[-\/]/g,'_') + ".jpg"
                }
                // go get card info from bushi if needed (probably want to throttle this)
                if (BUSHI_SCRAPE) {
                    // throttleboys
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    // get the card data
                    let bushiCard = await bushi_scraper.get(card);
                    // add JKTCG data to card
                    bushiCard.JKTCG = {
                        availability: card.availability,
                        price: card.price
                    };
                    setCards.push(bushiCard);
                } 
                // else, just get the JKTCG data
                else {
                    setCards.push(card);
                }
            }
        }
    }
    // write to file
    if (BUSHI_SCRAPE) {
        fs.writeFileSync(filename.split(".")[0] + "_jk+bushi_scraped.json", JSON.stringify(setCards));
    } else {
        fs.writeFileSync(filename.split(".")[0] + "_jk_scraped.json", JSON.stringify(setCards));
    }
    
})();
