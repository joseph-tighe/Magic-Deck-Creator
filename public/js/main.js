document.getElementById("search-for-card").addEventListener("click", () => {
  document.getElementById("search-for-card").disabled = true;
  searchValue = document
    .getElementsByClassName("search-bar")[0]
    .getElementsByTagName("input")[0].value;
  console.log("searchValue", searchValue);
  if (searchValue) {
    fetch(`https://api.magicthegathering.io/v1/cards?name=${searchValue}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.cards && data.cards.length > 0) {
          const card = data.cards[0];
          document.getElementsByClassName("card-grid")[0].innerHTML +=
            `<div class="card-placeholder">
              <img class="card-image" src="${card.imageUrl}" alt="${card.name}">

          </div>`;
          document.getElementById("search-for-card").disabled = false;
        }
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
