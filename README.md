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
