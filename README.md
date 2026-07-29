## Cuadernos y reportes

<!-- [Forzado](https://colab.research.google.com/github/frautn/F2/blob/main/ondas/forzadas.ipynb) -->

- [16_diffbot_EDA Report](https://htmlpreview.github.io/?https://raw.githubusercontent.com/frautn/mapa/main/mdp/16_diffbot_EDA.html)


## Environment

```
python3 -m venv venv

source venv/bin/activate

pip install ipykernel
```

For handling env files:
```
pip install python-dotenv
```


### Working with Gemini

https://ai.google.dev/gemini-api/docs

Querying Gemini through its API requires the Google Studio API key, and the library google-genai (**select Interactions API**, not the generateContent API). This library is in development, with often drastic changes, and conda packages might be outdated. We need to use python venv for this.

```
pip install -U google-genai
```

### OCR

```
pip install pillow pydantic
```

### Others

```
pip install pandas openpyxl matplotlib notebook
```

Google News scraper:

https://github.com/ranahaani/GNews 

```
pip install gnews

```

### Useful commands

Adding files that are excluded in .gitignore:
```
git add -f path_to_file
```
