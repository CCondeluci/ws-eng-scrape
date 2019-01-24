'use strict';

const html_parser = require('node-html-parser');
const bushi_scraper = require('./bushi-scraper');
const fs = require('fs');

const args = process.argv.slice(2);
const filename = args[0];

// read local html file (could be replaced w/ GET)
let jkString = fs.readFileSync(filename, 'utf8');
// divide jktcg page into html blocks, removing the first
let rarityBlocks = jkString.match(/((<h1>.*<\/h1>)[\s\S]*?(?=(<h1>.*<\/h1>)))/g);
rarityBlocks.shift();
// get the promo block
let promoBlock = jkString.match(/(<h1>.*PR - Promo.*<\/h1>)[\s\S]*/g)[0];
rarityBlocks.push(promoBlock);
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
        if (dataArr[1] !== undefined) {
            let cardObj = {
                code: dataArr[0],
                availability: dataArr[1].split('\t')[1],
                price: dataArr[2].split('$')[1],
                name: dataArr[3],
                rarity: rarity.split('-')[0].trim(),
                bushi: 'https://en.ws-tcg.com/cardlist/list/?cardno=' + dataArr[0],
                img: 'http://jktcg.com/WS_EN/' + filename.split(".")[0] + '/' + dataArr[0].replace(/[-\/]/g,'_') + ".jpg"
            }
            setCards.push(cardObj);
        }
    }
}
// write to file
fs.writeFileSync(filename.split(".")[0] + "_scaped.json", JSON.stringify(setCards));
// test bushiscrape
bushi_scraper('https://en.ws-tcg.com/cardlist/list/?cardno=RZ/S46-E001SP');
