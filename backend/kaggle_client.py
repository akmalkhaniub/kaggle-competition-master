import os
import requests
import json
import subprocess
from typing import List, Optional, Callable
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
            return data[:15] if isinstance(data, list) else data
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def download_competition_data(self, competition_ref: str, path: str = "./data", progress_callback: Optional[Callable] = None):
        try:
            response = requests.get(f"{self.base_url}/competitions/data/download-all/{competition_ref}", 
                                   headers=self.headers, stream=True)
            response.raise_for_status()
            
            total_size = int(response.headers.get('content-length', 0))
            os.makedirs(path, exist_ok=True)
            file_path = os.path.join(path, f"{competition_ref}.zip")
            
            downloaded = 0
            with open(file_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)
                        if progress_callback and total_size > 0:
                            percent = int((downloaded / total_size) * 100)
                            progress_callback(percent)
            
            return {"status": "success", "path": file_path}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def run_cli_command(self, command: str):
        """Execute a kaggle CLI command and return output"""
        try:
            # Ensure the command starts with 'kaggle' for security
            if not command.startswith("kaggle "):
                return {"status": "error", "message": "Only 'kaggle' CLI commands are allowed."}
            
            result = subprocess.run(command, shell=True, capture_output=True, text=True)
            return {
                "status": "success" if result.returncode == 0 else "error",
                "stdout": result.stdout,
                "stderr": result.stderr
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def get_ai_summary(self, title: str, category: str):
        """Use Gemini to generate a competition strategy"""
        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        
        if not api_key:
            return {
                "summary": f"This {category} competition, '{title}', is a great opportunity to apply machine learning. Without an API key, we recommend a standard approach.",
                "strategy": "1. Perform thorough EDA to understand feature distributions.\n2. Create a robust cross-validation strategy.\n3. Experiment with Gradient Boosting models like XGBoost or LightGBM.\n4. Document your feature engineering experiments.",
                "difficulty": "Unknown"
            }
        
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            prompt = f"""
            Analyze this Kaggle competition and provide a concise winning strategy:
            Title: {title}
            Category: {category}
            
            Return the result in JSON format with:
            - "summary": A 2-sentence overview of the challenge.
            - "strategy": A numbered list of 3-4 specific technical steps.
            - "difficulty": One word (Easy, Medium, Hard).
            """
            
            response = model.generate_content(prompt)
            # Simple cleanup in case of markdown formatting in response
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            print(f"AI Summary Error: {e}")
            return {
                "summary": f"Error generating summary for {title}.",
                "strategy": "Check your API key and connection.",
                "difficulty": "N/A"
            }

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
