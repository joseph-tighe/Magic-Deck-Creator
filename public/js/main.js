var loadings = [];
var cards = [];
document.getElementById("search-for-card").addEventListener("click", () => {
  document.getElementById("search-for-card").disabled = true;
  searchValue = document
    .getElementsByClassName("search-bar")[0]
    .getElementsByTagName("input")[0].value;
  if (searchValue) {
    fetch(searchURL(searchValue))
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
              <button class="card-button delete"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
  <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
</svg></button>
          </div>`;
          document.getElementById("search-for-card").disabled = false;
          for (let card of cards) {
            cardDom = document.getElementsByClassName("card-placeholder")[cards.indexOf(card)];
            let nameOfCard = card.name;
            cardDom.getElementsByClassName("card-button")[0].addEventListener("click", (e)=>deleteSelf(e, nameOfCard));
          }
        }
        updateCardGrid();
        updateManaDistribution();
        basicLandRecomendation();
      });
  }
}); 
function deleteSelf(e, cardName) {
  cards.splice(cards.indexOf(cards.find(card => card.name == cardName)), 1);
  e.target.parentElement.remove();
}
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
function whichCosts(cost1, cost2) {
  //A stands for Any
  //cost2 has not A
  var Diff = 0;
  for (let color in cost2) { //iterates through each color
    if (cost1[color] > cost2[color]) {
      return color;
    } else {
      Diff += cost2[color] - cost1[color];
    }
  }
  return cost1["A"] > Diff ? "A" : "";
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
function searchURL(searchValue) {
  baseURL = `https://api.magicthegathering.io/v1/cards?name=${searchValue}`;
  document.getElementById("colors").value != "All Colors" ? baseURL += `&colorIdentity=${document.getElementById("colors").value[0]}` : "";
  document.getElementById("types").value != "All Types" ? baseURL += `&types=${document.getElementById("types").value}` : "";
  document.getElementById("mana-cost").value != "Any Mana Cost" && document.getElementById("types").value != "Land" ? baseURL += `&manaCost=${document.getElementById("mana-cost").value}` : "";
  return baseURL;
}
function basicSearchURL(searchValue) {
  baseURL = `https://api.magicthegathering.io/v1/cards?name="${searchValue}"`;
  return baseURL;
}
function updateSearchResults() {
  let interval = Loading(document.getElementsByClassName("results")[0]);
  let searchValue = document.getElementsByClassName("search-bar")[0].getElementsByTagName("input")[0].value;
  if (searchValue && searchValue.length > 2) {
    fetch(searchURL(searchValue))
      .then((response) => response.json())
      .then((data) => {
        clearInterval(interval);
        if (searchValue == document.getElementsByClassName("search-bar")[0].getElementsByTagName("input")[0].value) {
          document.getElementsByClassName("results")[0].innerHTML =
            data.cards && data.cards.length > 0
              ? data.cards[0].name
              : "No results found";
        }
      });
  } else {
    for (let i = 0; i < loadings.length; i++) {
      clearInterval(loadings[i]);
    }
    document.getElementsByClassName("results")[0].innerHTML = "";
  }
}
async function Loading(element) {
  element.innerHTML = "";
  for (let i = 0; i < loadings.length; i++) {
    clearInterval(loadings[i]);
  }
  var interval = setInterval(() => {
    if (element.innerHTML.length > 3) {
      clearInterval(interval);
    }
    element.innerHTML += ".";
    if (element.innerHTML.includes("....")) {
      element.innerHTML = "";
    }
  }, 500);
  loadings.push(interval);
  return interval;
}
function updateManaDistribution() {
  var manaCount = countMana();
  var landCount = 0;
  for (let card of cards) {
    if (card.type == "Land") {
      landCount++;
    }
  }
  document.getElementsByClassName("land-distribution")[0].innerHTML = `<p>Land Count: ${landCount}</p>`;
  document.getElementsByClassName("total-cards")[0].innerHTML = `<p>Total Cards: ${cards.length}</p>`;
  graph = document.getElementsByClassName("mana-distribution")[0].getElementsByTagName("canvas")[0];
  const ctx = graph.getContext("2d");
  ctx.clearRect(0, 0, graph.width, graph.height);
  ctx.beginPath();
  colorMap = {
    W: "#ffffff",
    U: "#0000ff",
    B: "#000000",
    R: "#ff0000",
    G: "#00ff00",
    A: "#aaaaaa",
  };
  last = 0;
  for (let color in manaCount) {
    ctx.fillStyle = colorMap[color];
    ctx.fillRect(last, 0, (manaCount[color] / landCount) * graph.width, graph.height);
    last += (manaCount[color] / landCount) * graph.width;
  }
}
document
  .getElementsByClassName("search-bar")[0]
  .getElementsByTagName("input")[0]
  .addEventListener("input", updateSearchResults);
document.getElementById("colors").addEventListener("change", updateSearchResults);
document.getElementById("types").addEventListener("change", updateSearchResults);
document.getElementById("mana-cost").addEventListener("change", updateSearchResults);
async function basicLandRecomendation() {
  //getMostNeededLand();
  var creatureCost = {
    W: 0,
    U: 0,
    B: 0,
    R: 0,
    G: 0,
    A: 0,
  };
  for (let card of cards) {
    if (card.type != "Land") {
      let cardManaCost = getCost(card);
      creatureCost = addManaCost(creatureCost, cardManaCost);
    }
  }
  creatureCost = normalizeCost(creatureCost);
  land = normalizeCost(countMana());
  let expensive = biggestDifference(creatureCost, land);
  let landHash = {
    W: "Plains",
    U: "Island",
    B: "Swamp",
    R: "Mountain",
    G: "Forest"
  };
  console.log(expensive)
  if (expensive in landHash) {
    x = await fetch(basicSearchURL(landHash[expensive]))
      .then((response) => response.json())
      .then((data) => data.cards[0].imageUrl);
    document
      .getElementsByClassName("recomendation-grid")[0]
      .innerHTML = `<div class="recomendation-card">
            <div class="card-art" style="background-image: url(${x});"></div>
            <div class="card-name">${landHash[expensive]}</div>
          </div>`;
    document.getElementsByClassName("recomendation-card")[0].addEventListener("click", () => {
      console.log((() => { return landHash[expensive] })())
      temp = document.getElementsByClassName("search-bar")[0].getElementsByTagName("input")[0].value;
      document.getElementsByClassName("search-bar")[0].getElementsByTagName("input")[0].value = '"' + (() => { return landHash[expensive] })() + '"';
      document.getElementById("search-for-card").click();
      document.getElementsByClassName("search-bar")[0].getElementsByTagName("input")[0].value = temp;
    });
  }
}

function VectorURL(card) {
  var toughness = card.toughness;
  var power = card.power;
  var manaCost = card.manaCost;
  var type = card.type;
  var name = card.name;
  var imageUrl = card.imageUrl;
  //ignores mana cost for now
  return `https://api.magicthegathering.io/v1/cards?name=${name}&toughness<=${toughness + 2}&toughness>=${toughness - 2}&power<=${power + 2}&power>=${power - 2}&types=${type}`;
}
async function VectorSearch(card) {
  URL = VectorURL(card);
  fetch(URL)
    .then((response) => response.json())
    .then((data) => {
      if (data.cards && data.cards.length > 0) {
        dist = infinity;
        closestCard = data.cards[0];
        for (let possibleCard of data.cards) {
          if (euclidDistance(card, possibleCard) < dist) {
            dist = euclidDistance(card, possibleCard);
            closestCard = possibleCard;
          }
        }
        return closestCard;
      } else {
        return null;
      }
    });
}
function normalizeCost(cost) {

  var sum = 0;
  for (let color in cost) {
    sum += cost[color];
  }
  var newCost = JSON.parse(JSON.stringify(cost));
  for (let color in newCost) {
    if (sum == 0) {
      sum = 1;
    }
    newCost[color] = Math.round(newCost[color] / sum * 100);
  }
  return newCost;
}
function biggestDifference(cost1, cost2) {
  max = -101;
  index = "";
  for (let color in cost2) {
    if (color != "A") {
      if (cost1[color] - cost2[color] > max && cost1[color] != 0) {
        max = cost1[color] - cost2[color];
        index = color;
      }
    }
  }
  return index;
}
function addManaCost(cost1, cost2) {
  newCost = JSON.parse(JSON.stringify(cost1));
  for (let color in cost2) {
    newCost[color] += cost2[color];
  }
  return newCost;
}
function getPredictionVector() {
  fetch("/api/predict/creature/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      deck: JSON.stringify(cards),
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    });
}
