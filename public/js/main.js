document.getElementById("search-for-card").addEventListener("click", () => {
  console.log("search-for-card clicked");
  document.getElementById("search-for-card").disabled = true;
  searchValue = document
    .getElementsByClassName("search-bar")[0]
    .getElementsByTagName("input")[0].value;
  console.log("searchValue", searchValue);
  if (searchValue) {
    fetch(`https://api.magicthegathering.io/v1/cards?name=${searchValue}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("data", data);
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
document.getElementById("");
