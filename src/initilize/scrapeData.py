import requests
import json
from bs4 import BeautifulSoup
import json
import os
edition = "Commander"


def getAllIDs():
    decks = []
    page = 1
    while True:
        url = f"https://archidekt.com/api/decks/v3/?deckFormat=3&page={page}"
        response = requests.get(url)
        decks.extend([deck['id'] for deck in response.json()['results']])
        if response.json()['next'].__str__() == "None":
            break
        page += 1
    return decks

def getCards(ID):
    arch_url = f"https://archidekt.com/api/decks/{ID}/?format=json"
    response = requests.get(arch_url)
    cards = []
    for card in response.json()["cards"]:
        cards.append({
            "name": card["card"]["oracleCard"]["name"],
            "manaCost": card["card"]["oracleCard"]["manaCost"], 
            "type": card["card"]["oracleCard"]["types"][0],
            "toughness": card["card"]["oracleCard"]["toughness"], 
            "power": card["card"]["oracleCard"]["power"]
        })
    return {"ID": ID, "cards": cards}
print("Fetching IDs")
IDs = getAllIDs()
decks = []
print("Fetching Decks")
c = 0
for ID in IDs:
    try:
        decks.append(getCards(ID))
        c += 1
        print(f"{c}/{len(IDs)}")
    except:
        c += 1
        print(f"{c}/{len(IDs)}")
        print(f"skipping {c}")
open("deck.json", "w").write(json.dumps(decks))