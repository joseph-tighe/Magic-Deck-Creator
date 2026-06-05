/*interface Card {
  name: string;
  imageUrl: string;
  manaCost: string;
  type: string;
}*/
var cards = [];
document.getElementById("search-for-card").addEventListener("click", () => {
  document.getElementById("search-for-card").disabled = true;
  searchValue = document
    .getElementsByClassName("search-bar")[0]
    .getElementsByTagName("input")[0].value;
  if (searchValue) {
    fetch(`https://api.magicthegathering.io/v1/cards?name=${searchValue}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.cards && data.cards.length > 0) {
          const card = data.cards[0];
          if (card.types[0] == "Land") {
            var manaCost = [];
            for (let color of card.colorIdentity) {
              manaCost.push("-" + color.replace("}", "").replace("{", ""));
            }
          } else {
            var manaCost = [];
            for (let cost of card.manaCost.split("}{")) {
              manaCost.push(cost.replace("}", "").replace("{", ""));
            }
          }
          const cardData = {
            name: card.name,
            imageUrl: card.imageUrl,
            manaCost: manaCost,
            type: card.types[0],
          };
          cards.push(cardData);

          document.getElementsByClassName("card-grid")[0].innerHTML +=
            `<div class="card-placeholder">
              <img class="card-image" src="${card.imageUrl}" alt="${card.name}">

          </div>`;
          document.getElementById("search-for-card").disabled = false;
        }
        updateCardGrid();
      });
  }
});
document
  .getElementsByClassName("search-bar")[0]
  .getElementsByTagName("input")[0]
  .addEventListener("input", () => {
    searchValue = document
      .getElementsByClassName("search-bar")[0]
      .getElementsByTagName("input")[0].value;
    console.log("searchValue", searchValue);
    if (searchValue) {
      fetch(`https://api.magicthegathering.io/v1/cards?name=${searchValue}`)
        .then((response) => response.json())
        .then((data) => {
          document.getElementsByClassName("results")[0].innerHTML =
            data.cards && data.cards.length > 0
              ? data.cards[0].name
              : "No results found";
        });
    } else {
      document.getElementsByClassName("results")[0].innerHTML = "";
    }
  });
function countMana() {
  var manaCount = {
    W: 0,
    U: 0,
    B: 0,
    R: 0,
    G: 0,
  };
  for (let card of cards) {
    if (card.type == "Land") {
      for (let color of card.manaCost) {
        if (color.includes("W")) {
          manaCount.W++;
        } else if (color.includes("U")) {
          manaCount.U++;
        } else if (color.includes("B")) {
          manaCount.B++;
        } else if (color.includes("R")) {
          manaCount.R++;
        } else if (color.includes("G")) {
          manaCount.G++;
        }
      }
    }
  }
  return manaCount;
}
function updateCardGrid() {
  //counts mana and flags cards that can't be placed
  var manaCount = countMana();
  for (let card of cards) {
    if (card.type != "Land") {
      var cardManaCost = getCost(card);
      if (!compareCosts(cardManaCost, manaCount)) {
        document
          .getElementsByClassName("card-grid")[0]
          .getElementsByClassName("card-placeholder")
          [cards.indexOf(card)].classList.add("cant-place");
      } else {
        document
          .getElementsByClassName("card-grid")[0]
          .getElementsByClassName("card-placeholder")
          [cards.indexOf(card)].classList.remove("cant-place");
      }
    }
  }
      
}
function compareCosts(cost1, cost2) {
  //A stands for Any
  //cost2 has not A
  var Diff = 0;
  for (let color in cost2) { //iterates through each color
    if (cost1[color] > cost2[color]) {
      return false;
    } else {
      Diff += cost2[color] - cost1[color];
    }
  }
  return cost1["A"] <= Diff;
}
function getCost(card) {
  manaCost = {
    W: 0,
    U: 0,
    B: 0,
    R: 0,
    G: 0,
    A: 0,
  };
  for (let cost of card.manaCost) {
    if (cost.includes("W")) {
      manaCost.W++;
    } else if (cost.includes("U")) {
      manaCost.U++;
    } else if (cost.includes("B")) {
      manaCost.B++;
    } else if (cost.includes("R")) {
      manaCost.R++;
    } else if (cost.includes("G")) {
      manaCost.G++;
    } else {
      manaCost.A += parseInt(cost);
    }
  }
  return manaCost;
}