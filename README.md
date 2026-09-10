## Cuadernos en /public


| Archivo |  Contenido                 | Enlace |
|---------------------------------|------| ---|
| 20_compara_resultados_busqueda | Compara entre AppsScript y GNews | [![](/assets/colab-badge-es.svg)](https://colab.research.google.com/github/frautn/mapa/blob/compara/public/20_compara_resultados_busqueda.ipynb) |


<!-- - [16_diffbot_EDA Report](https://htmlpreview.github.io/?https://raw.githubusercontent.com/frautn/mapa/main/mdp/16_diffbot_EDA.html)  -->


## Environment

```
python3 -m venv venv

source venv/bin/activate

pip install -r requirements.txt
```


### Working with Gemini

https://ai.google.dev/gemini-api/docs

Querying Gemini through its API requires the Google Studio API key, and the library google-genai (**select Interactions API**, not the generateContent API). This library is in development, with often drastic changes, and conda packages might be outdated. We need to use python venv for this.

```
pip install -U google-genai
```


### Others


Google News scraper:

https://github.com/ranahaani/GNews 

```
pip install gnews
```

Accessing Google Drive, you need the credentials.
```
pip install gspread
```

#### Diffbot

https://github.com/diffbot/diffbot-python


### Useful commands

Adding files that are excluded in .gitignore, such as csv files with data:
```
git add -f path_to_file
```

## TODO

- requirements.txt for cloud instance: without packages such as jupyter