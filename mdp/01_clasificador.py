from pathlib import Path

import pandas as pd

base_dir = Path.cwd()
excel_path = base_dir / ".." / "data" / "Monitoreo noticias – Mapa de la Policía.xlsx"

df = pd.read_excel(excel_path)

# excel_path = (Path(__file__).resolve().parent / ".." / "data" / "Monitoreo noticias – Mapa de la Policía.xlsx").resolve()
# df = pd.read_excel(excel_path)

for index, row in df.iterrows():
    print(f"Row {index}:")
    print(row.to_dict())
    print("-" * 40)
