To access a non-public Google Sheet shared with you using Python, the standard and most secure method is using a **Service Account** or **OAuth 2.0 Client ID** via the official Google API libraries (`gspread` and `google-auth`).

### Prerequisites & Setup

1. **Enable the APIs**:
* Go to the [Google Cloud Console](https://console.cloud.google.com/).
* Create a project (or select an existing one).
* Enable both the **Google Sheets API** and **Google Drive API**.


2. **Create a Service Account**:
* Go to **IAM & Admin > Service Accounts**.
* Click **Create Service Account**, name it, and grant it permissions if needed (default is usually fine).
* Go to the **Keys** tab of the newly created service account $\rightarrow$ **Add Key** $\rightarrow$ **Create new key** $\rightarrow$ choose **JSON**.
* A `.json` file will download. Rename it to `credentials.json` and place it in your Python project directory.


3. **Share the Sheet**:
* Open your downloaded `credentials.json` file and locate the `"client_email"` address.
* Open the shared Google Sheet in your browser, click **Share**, and add that `client_email` address as a **Viewer** or **Editor**.


4. **Install Required Libraries**:
```bash
pip install gspread google-auth

```



---

### Python Code

```python
import gspread
from google.oauth2.service_account import Credentials

# Define the scopes required
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]

# Authenticate using the service account credentials JSON file
creds = Credentials.from_service_account_file("credentials.json", scopes=SCOPES)
client = gspread.authorize(creds)

# Option A: Open sheet by URL (recommended)
sheet_url = "https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit"
spreadsheet = client.open_by_url(sheet_url)

# Option B: Open sheet by title
# spreadsheet = client.open("Exact Name of the Sheet")

# Select the first worksheet (tab)
worksheet = spreadsheet.get_worksheet(0)

# Extract data
all_records = worksheet.get_all_records()  # Returns data as a list of dictionaries
# all_values = worksheet.get_all_values()  # Alternative: Returns raw 2D list

# Example output
for row in all_records[:5]:  # Print first 5 rows
    print(row)

```

---

### Working with Pandas DataFrames

If you want to pull the data directly into a pandas DataFrame for analysis:

```python
import pandas as pd

# Convert records directly to DataFrame
df = pd.DataFrame(worksheet.get_all_records())
print(df.head())

```