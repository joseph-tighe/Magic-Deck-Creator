import fs from 'fs';
var i = 0;
var cards = [];
fs.writeFileSync(`./public/json/cards.json`, "[");
fs.writeFileSync(`./public/json/cardsID.json`, "[");
for (let page = 1; page <= 940; page++) {
    let data = await fetch(`https://api.magicthegathering.io/v1/cards?page=${page}&pageSize=100`);
    data = await data.json();
    if (data.cards.length === 0) {
        console.log(`page ${page} is empty`);
        break;
    }
    data.cards.forEach(card => {
        if (!cards.some(c => c === card.name)) {
            cards.push(card.name);
            fs.appendFileSync(`./public/json/cards.json`, JSON.stringify(card) + ",\n");
            let name = card.name.replaceAll('"', '\\"');
            fs.appendFileSync(`./public/json/cardsID.json`, `{"id": ${i}, "name":"${name}"},` + "\n");
            i++;
        }
    });
    console.log(`completed page ${page} and ${i} cards`);
}
fs.appendFileSync(`./public/json/cards.json`, "]");
fs.appendFileSync(`./public/json/cardsID.json`, "]");