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
            `<div class="card-placeholder recomendation">
              <img class="card-image" src="${card.imageUrl}" alt="${card.name}">

          </div>`;
          document.getElementById("search-for-card").disabled = false;
        }
        updateCardGrid();
        updateManaDistribution();
      });
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
function searchURL(searchValue) {
  baseURL = `https://api.magicthegathering.io/v1/cards?name=${searchValue}`;
  document.getElementById("colors").value != "All Colors" ? baseURL += `&colorIdentity=${document.getElementById("colors").value[0]}` : "";
  document.getElementById("types").value != "All Types" ? baseURL += `&types=${document.getElementById("types").value}` : "";
  document.getElementById("mana-cost").value != "Any Mana Cost" && document.getElementById("types").value != "Land" ? baseURL += `&manaCost=${document.getElementById("mana-cost").value}` : "";
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
    console.log(color, manaCount[color] / landCount);
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