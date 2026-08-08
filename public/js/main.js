var loadings = [];
var cards = [];

const TRASH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
  <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
</svg>`;

document.getElementById("search-for-card").addEventListener("click", () => {
  document.getElementById("search-for-card").disabled = true;
  var searchValue = document
    .getElementsByClassName("search-bar")[0]
    .getElementsByTagName("input")[0].value;
  if (searchValue) {
    fetch(searchURL(searchValue))
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("search-for-card").disabled = false;
        if (data.cards && data.cards.length > 0) {
          const card = data.cards[0];
          var manaCost = [];
          if (card.types[0] == "Land") {
            for (let color of card.colorIdentity) {
              manaCost.push("-" + color.replace("}", "").replace("{", ""));
            }
          } else {
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
          addCardToGrid(cardData);
        }
        updateCardGrid();
        updateManaDistribution();
        updateDeckCount();
        basicLandRecomendation();
      })
      .catch(() => {
        document.getElementById("search-for-card").disabled = false;
      });
  } else {
    document.getElementById("search-for-card").disabled = false;
  }
});

function addCardToGrid(card) {
  var grid = document.getElementsByClassName("card-grid")[0];
  var el = document.createElement("div");
  el.className = "card-placeholder";
  el.innerHTML =
    `<img class="card-image" src="${card.imageUrl}" alt="${card.name}" loading="lazy">
     <div class="card-label">
       <span class="card-name-label"></span>
       <span class="card-cost-label"></span>
     </div>
     <button class="card-button delete" title="Remove from deck">${TRASH_ICON}</button>`;
  el.querySelector(".card-name-label").textContent = card.name;
  el.querySelector(".card-cost-label").innerHTML = formatCost(card);
  el
    .querySelector(".card-button")
    .addEventListener("click", (e) => deleteSelf(e, card.name));
  grid.appendChild(el);
}

function formatCost(card) {
  if (card.type == "Land") return "Land";
  return card.manaCost.map(manaSymbolHTML).join("");
}

function manaSymbolHTML(symbol) {
  symbol = String(symbol).replace("{", "").replace("}", "");
  var key = "generic";
  if (symbol == "W") {
    key = "w";
  } else if (symbol == "U") {
    key = "u";
  } else if (symbol == "B") {
    key = "b";
  } else if (symbol == "R") {
    key = "r";
  } else if (symbol == "G") {
    key = "g";
  } else if (symbol == "C") {
    key = "c";
  } else if (symbol == "X") {
    key = "x";
  } else if (symbol.indexOf("W") > -1) {
    key = "w";
  } else if (symbol.indexOf("U") > -1) {
    key = "u";
  } else if (symbol.indexOf("B") > -1) {
    key = "b";
  } else if (symbol.indexOf("R") > -1) {
    key = "r";
  } else if (symbol.indexOf("G") > -1) {
    key = "g";
  }
  return `<span class="mana-symbol ms-${key}">${symbol}</span>`;
}

function deleteSelf(e, cardName) {
  cards = cards.filter((card) => card.name !== cardName);
  var node = e.target.closest(".card-placeholder");
  if (node) node.remove();
  updateCardGrid();
  updateManaDistribution();
  updateDeckCount();
  basicLandRecomendation();
}

function updateDeckCount() {
  var el = document.getElementById("deck-count");
  if (el) el.textContent = cards.length;
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
      var node = document.getElementsByClassName("card-placeholder")[
        cards.indexOf(card)
      ];
      if (!node) continue;
      if (!compareCosts(cardManaCost, manaCount)) {
        node.classList.add("cant-place");
      } else {
        node.classList.remove("cant-place");
      }
    }
  }
}

function compareCosts(cost1, cost2) {
  //A stands for Any
  //cost2 has not A
  var Diff = 0;
  for (let color in cost2) {
    //iterates through each color
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
  for (let color in cost2) {
    //iterates through each color
    if (cost1[color] > cost2[color]) {
      return color;
    } else {
      Diff += cost2[color] - cost1[color];
    }
  }
  return cost1["A"] > Diff ? "A" : "";
}

function getCost(card) {
  var manaCost = {
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
  var baseURL = `https://api.magicthegathering.io/v1/cards?name=${searchValue}`;
  if (document.getElementById("colors").value != "All Colors") {
    baseURL += `&colorIdentity=${document.getElementById("colors").value[0]}`;
  }
  if (document.getElementById("types").value != "All Types") {
    baseURL += `&types=${document.getElementById("types").value}`;
  }
  if (
    document.getElementById("mana-cost").value != "Any Mana Cost" &&
    document.getElementById("types").value != "Land"
  ) {
    baseURL += `&manaCost=${document.getElementById("mana-cost").value}`;
  }
  return baseURL;
}

function basicSearchURL(searchValue) {
  return `https://api.magicthegathering.io/v1/cards?name="${searchValue}"`;
}

function setSearchStatus(state) {
  var status = document.getElementsByClassName("search-status")[0];
  if (!status) return;
  status.classList.toggle("is-loading", state === "loading");
  status.classList.toggle("has-results", state === "ok");
  status.classList.toggle("no-results", state === "none");
}

function updateSearchResults() {
  let interval = Loading(document.getElementsByClassName("results")[0]);
  setSearchStatus("loading");
  let searchValue = document
    .getElementsByClassName("search-bar")[0]
    .getElementsByTagName("input")[0].value;
  if (searchValue && searchValue.length > 2) {
    fetch(searchURL(searchValue))
      .then((response) => response.json())
      .then((data) => {
        clearInterval(interval);
        if (
          searchValue ==
          document
            .getElementsByClassName("search-bar")[0]
            .getElementsByTagName("input")[0].value
        ) {
          var found = data.cards && data.cards.length > 0;
          document.getElementsByClassName("results")[0].innerHTML = found
            ? data.cards[0].name
            : "No results found";
          setSearchStatus(found ? "ok" : "none");
        }
      })
      .catch(() => {
        clearInterval(interval);
        document.getElementsByClassName("results")[0].innerHTML =
          "Search failed \u2014 try again";
        setSearchStatus("none");
      });
  } else {
    for (let i = 0; i < loadings.length; i++) {
      clearInterval(loadings[i]);
    }
    document.getElementsByClassName("results")[0].innerHTML =
      "Type at least 3 characters to preview the top match";
    setSearchStatus("idle");
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

  var landEl = document.getElementsByClassName("land-distribution")[0];
  var totalEl = document.getElementsByClassName("total-cards")[0];
  if (landEl) {
    landEl.innerHTML = `<p>Land Count <strong>${landCount}</strong></p>`;
  }
  if (totalEl) {
    totalEl.innerHTML = `<p>Total Cards <strong>${cards.length}</strong></p>`;
  }

  var graph = document.querySelector(".mana-distribution canvas");
  var legend = document.querySelector(".mana-legend");
  if (!graph) return;
  var ctx = graph.getContext("2d");
  var dpr = window.devicePixelRatio || 1;
  var w = graph.clientWidth || 600;
  var h = graph.clientHeight || 34;
  graph.width = w * dpr;
  graph.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  var colors = {
    W: "#e8d8a8",
    U: "#7fa8d9",
    B: "#4a4a55",
    R: "#d96a4a",
    G: "#6fbf69",
  };
  var labels = {
    W: "White",
    U: "Blue",
    B: "Black",
    R: "Red",
    G: "Green",
  };

  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctx.beginPath();
  roundRect(ctx, 0, 0, w, h, 6);
  ctx.clip();

  ctx.fillStyle = "#0d1320";
  ctx.fillRect(0, 0, w, h);

  if (landCount === 0) {
    ctx.fillStyle = "#64748c";
    ctx.font = "12px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Add lands to your deck to see the split", w / 2, h / 2);
    if (legend) legend.innerHTML = "";
    ctx.restore();
    return;
  }

  var gap = 2;
  var x = 0;
  var counts = [];
  for (let color in manaCount) {
    var share = manaCount[color] / landCount;
    if (share > 0) {
      var segW = Math.max(share * w - gap, 1);
      ctx.fillStyle = colors[color];
      ctx.fillRect(x, 0, segW, h);
      counts.push([color, manaCount[color]]);
    }
    x += share * w;
  }
  ctx.restore();

  if (legend) {
    legend.innerHTML = counts
      .map(
        ([c, n]) =>
          `<span class="legend-item"><span class="legend-swatch" style="background:${colors[c]}"></span>${labels[c]} (${n})</span>`
      )
      .join("");
  }
}

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function sumbitIfEnter(e) {
  if (e.keyCode == 13) {
    document.getElementById("search-for-card").click();
  }
};
document
  .getElementsByClassName("search-bar")[0]
  .getElementsByTagName("input")[0]
  .addEventListener("keyup", sumbitIfEnter);
document
  .getElementsByClassName("search-bar")[0]
  .getElementsByTagName("input")[0]
  .addEventListener("input", updateSearchResults);
document.getElementById("colors").addEventListener("change", updateSearchResults);
document.getElementById("types").addEventListener("change", updateSearchResults);
document
  .getElementById("mana-cost")
  .addEventListener("change", updateSearchResults);

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
  var land = normalizeCost(countMana());
  var expensive = biggestDifference(creatureCost, land);
  var landHash = {
    W: "Plains",
    U: "Island",
    B: "Swamp",
    R: "Mountain",
    G: "Forest",
  };
  var grid = document.getElementsByClassName("recomendation-grid")[0];
  if (grid) grid.innerHTML = "";
  if (expensive in landHash) {
    var x = await fetch(basicSearchURL(landHash[expensive]))
      .then((response) => response.json())
      .then((data) => data.cards[0].imageUrl);
    var name = landHash[expensive];
    var cardEl = document.createElement("div");
    cardEl.className = "recomendation-card";
    cardEl.innerHTML = `<div class="card-art" style="background-image: url(${x});"></div>
      <div class="card-name">${name}</div>`;
    cardEl.addEventListener("click", () => {
      var input = document
        .getElementsByClassName("search-bar")[0]
        .getElementsByTagName("input")[0];
      var temp = input.value;
      input.value = '"' + name + '"';
      document.getElementById("search-for-card").click();
      input.value = temp;
    });
    if (grid) grid.appendChild(cardEl);
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
    newCost[color] = Math.round((newCost[color] / sum) * 100);
  }
  return newCost;
}

function biggestDifference(cost1, cost2) {
  var max = -101;
  var index = "";
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
  var newCost = JSON.parse(JSON.stringify(cost1));
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
