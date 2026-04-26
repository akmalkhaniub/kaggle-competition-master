import os
import requests
import json
from typing import List, Optional
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class KaggleClient:
    def __init__(self):
        self.token = os.getenv("KAGGLE_TOKEN")
        self.base_url = "https://www.kaggle.com/api/v1"
        self.headers = {
            "Authorization": f"Bearer {self.token}"
        }

    def list_competitions(self, search: Optional[str] = None, group: str = "general") -> List[dict]:
        """
        group can be: general, entered, completed
        """
        try:
            params = {"group": group}
            if search:
                params["search"] = search
            
            response = requests.get(f"{self.base_url}/competitions/list", headers=self.headers, params=params)
            response.raise_for_status()
            competitions = response.json()
            
            return [
                {
                    "id": c.get("id", 0),
                    "ref": (c.get("ref") or c.get("urlNullable", "").rstrip("/").split("/")[-1]).split("/")[-1],
                    "title": c.get("titleNullable") or c.get("title"),
                    "url": c.get("urlNullable") or c.get("url"),
                    "deadline": c.get("deadlineNullable") or str(c.get("deadline")),
                    "category": c.get("categoryNullable") or c.get("category"),
                    "reward": (c.get("rewardNullable") or c.get("reward", "")).replace("USD", "$").replace("Usd", "$"),
                    "userHasEntered": c.get("userHasEntered", False)
                }
                for c in competitions
            ]
        except Exception as e:
            print(f"Error listing competitions: {e}")
            return []

    def get_leaderboard(self, competition_ref: str):
        try:
            response = requests.get(f"{self.base_url}/competitions/leaderboard/view/{competition_ref}", 
                                   headers=self.headers)
            response.raise_for_status()
            data = response.json()
            # The API might return a list of teams
            return data[:10] if isinstance(data, list) else data
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def download_competition_data(self, competition_ref: str, path: str = "./data"):
        try:
            response = requests.get(f"{self.base_url}/competitions/data/download-all/{competition_ref}", 
                                   headers=self.headers, stream=True)
            response.raise_for_status()
            
            os.makedirs(path, exist_ok=True)
            file_path = os.path.join(path, f"{competition_ref}.zip")
            
            with open(file_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            return {"status": "success", "path": file_path}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def init_notebook(self, competition_ref: str, username: str = "akmalshahbaz"):
        try:
            notebook_dir = os.path.join(os.getcwd(), "notebooks", competition_ref)
            os.makedirs(notebook_dir, exist_ok=True)
            
            metadata = {
                "id": f"{username}/{competition_ref}-notebook",
                "title": f"{competition_ref.replace('-', ' ').title()} Starter",
                "code_file": "main.py",
                "language": "python",
                "kernel_type": "script",
                "is_private": "true",
                "enable_gpu": "false",
                "enable_internet": "true",
                "dataset_sources": [],
                "competition_sources": [competition_ref],
                "kernel_sources": []
            }
            
            with open(os.path.join(notebook_dir, "kernel-metadata.json"), 'w') as f:
                json.dump(metadata, f, indent=4)
                
            with open(os.path.join(notebook_dir, "main.py"), 'w') as f:
                f.write(f"# Starter code for {competition_ref}\nimport pandas as pd\nimport numpy as np\n\nprint('Hello Kaggle!')\n")
                
            return {"status": "success", "path": notebook_dir}
        except Exception as e:
            return {"status": "error", "message": str(e)}
