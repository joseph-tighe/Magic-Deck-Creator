import requests
import json
from bs4 import BeautifulSoup

edition = "Commander"

def getAllIDs(page):
    url = f"https://archidekt.com/api/decks/v3/?deckFormat=3&page={page}"
    response = requests.get(url)
    return [deck['id'] for deck in response.json()['results']]

def getCards(ID):
    arch_url = f"https://archidekt.com/api/decks/{ID}/?format=json"
    response = requests.get(arch_url)
    print([i["card"]["oracleCard"]["name"] for i in response.json()["cards"]])
    #print([i["card"]["oracleCard"].keys() for i in response.json()["cards"]])
getCards(getAllIDs(1)[0])