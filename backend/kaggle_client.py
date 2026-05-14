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

    def get_submissions(self, competition_ref: str):
        """Fetch list of user submissions for a competition"""
        try:
            response = requests.get(f"{self.base_url}/competitions/submissions/list/{competition_ref}", 
                                   headers=self.headers)
            response.raise_for_status()
            data = response.json()
            return [
                {
                    "ref": s.get("ref"),
                    "totalBytes": s.get("totalBytes"),
                    "date": s.get("date"),
                    "description": s.get("description"),
                    "status": s.get("status"),
                    "publicScore": s.get("publicScore"),
                    "privateScore": s.get("privateScore")
                }
                for s in data
            ]
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def submit_result(self, competition_ref: str, file_path: str, message: str):
        """Submit a CSV file to a competition"""
        command = f'kaggle competitions submit -c {competition_ref} -f "{file_path}" -m "{message}"'
        return self.run_cli_command(command)

    def push_kernel(self, competition_ref: str):
        """Push a local notebook to Kaggle Kernels"""
        notebook_dir = os.path.join(os.getcwd(), "notebooks", competition_ref)
        if not os.path.exists(notebook_dir):
            return {"status": "error", "message": f"Notebook directory not found: {notebook_dir}"}
        
        command = f'kaggle kernels push -p "{notebook_dir}"'
        return self.run_cli_command(command)

    def analyze_dataset(self, competition_ref: str):
        """Unzip downloaded data and use Gemini to provide EDA insights"""
        download_path = os.path.join(os.getcwd(), "downloads", competition_ref)
        zip_file = os.path.join(download_path, f"{competition_ref}.zip")
        
        if not os.path.exists(zip_file):
            return {"status": "error", "message": "Dataset not downloaded. Please download first."}
        
        try:
            import zipfile
            import pandas as pd
            
            # Extract basic info from the zip
            extract_to = os.path.join(download_path, "extracted")
            os.makedirs(extract_to, exist_ok=True)
            
            data_context = []
            with zipfile.ZipFile(zip_file, 'r') as z:
                # Only look at the first 3 files to keep it fast
                files = [f for f in z.namelist() if f.endswith('.csv')][:3]
                for file_name in files:
                    z.extract(file_name, extract_to)
                    df = pd.read_csv(os.path.join(extract_to, file_name), nrows=5)
                    data_context.append({
                        "filename": file_name,
                        "columns": list(df.columns),
                        "sample": df.to_dict(orient='records')
                    })
            
            # Now prompt Gemini
            api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
            if not api_key:
                return {"status": "error", "message": "API key missing for AI analysis"}

            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            prompt = f"""
            Analyze this Kaggle dataset structure and provide technical insights for a competition:
            Competition: {competition_ref}
            Files and sample data: {json.dumps(data_context)}
            
            Return JSON with:
            - "overview": General data quality and size assessment.
            - "features": List of 3 key features and why they matter.
            - "risks": Potential pitfalls (e.g. leakage, missing values).
            - "target": Identified target variable and its nature.
            """
            
            response = model.generate_content(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
            
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def compare_competitions(self, comp1: dict, comp2: dict):
        """Use Gemini to compare two competitions and recommend one"""
        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        if not api_key:
            return {"status": "error", "message": "API key missing"}

        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            prompt = f"""
            Compare these two Kaggle competitions and recommend the best one for a developer:
            
            Comp 1: {json.dumps(comp1)}
            Comp 2: {json.dumps(comp2)}
            
            Return JSON with:
            - "winner": The title of the recommended competition.
            - "reason": A short reason for the recommendation.
            - "comparison": A list of objects with "label", "val1", and "val2" comparing metrics like prize, difficulty, and type.
            """
            
            response = model.generate_content(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def summarize_discussions(self, competition_ref: str):
        """Fetch top discussion topics and summarize them using Gemini"""
        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        if not api_key:
            return {"status": "error", "message": "API key missing"}

        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            prompt = f"""
            Generate a 'Community Wisdom' summary for the Kaggle competition: {competition_ref}.
            Based on the category and nature of this competition, identify:
            1. 'Gold Nuggets': 3 specific technical tricks often discussed for this type of challenge.
            2. 'Common Pitfalls': 2 mistakes that often drop people on the leaderboard.
            3. 'Winning Stack': Recommended libraries and architectures.
            
            Return JSON with:
            - "nuggets": List of objects with "title" and "description".
            - "pitfalls": List of strings.
            - "stack": List of strings.
            """
            
            response = model.generate_content(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def generate_baseline_code(self, competition_ref: str, schema_context: dict):
        """Generate a professional baseline Python script using Gemini based on the dataset schema"""
        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        if not api_key:
            return {"status": "error", "message": "API key missing"}

        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            prompt = f"""
            Write a professional, high-performance Kaggle baseline script for: {competition_ref}.
            
            Dataset Context:
            {json.dumps(schema_context)}
            
            The script should include:
            1. Data loading (assuming files are in ./data/{competition_ref}/extracted/)
            2. Basic feature engineering (handling missing values, encoding).
            3. A robust Cross-Validation loop (StratifiedKFold if applicable).
            4. A model (use LightGBM, XGBoost, or CatBoost).
            5. Generation of a submission.csv.
            
            Return ONLY the Python code, no markdown formatting or extra text.
            """
            
            response = model.generate_content(prompt)
            code = response.text.replace('```python', '').replace('```', '').strip()
            
            # Save the code to a file
            notebook_dir = os.path.join(os.getcwd(), "notebooks", competition_ref)
            os.makedirs(notebook_dir, exist_ok=True)
            baseline_path = os.path.join(notebook_dir, "baseline.py")
            
            with open(baseline_path, 'w') as f:
                f.write(code)
                
            return {
                "status": "success",
                "code": code,
                "path": baseline_path
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def troubleshoot_error(self, competition_ref: str, error_text: str):
        """Use Gemini to analyze a Kaggle traceback/error and suggest a fix"""
        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        if not api_key:
            return {"status": "error", "message": "API key missing"}

        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            prompt = f"""
            Analyze this Kaggle error/traceback for competition {competition_ref} and provide a diagnosis:
            
            Error Log:
            {error_text}
            
            Return JSON with:
            - "diagnosis": A short explanation of the root cause (e.g. OOM, data mismatch).
            - "fix": 2-3 specific technical steps to resolve the issue.
            - "severity": One word (Low, Medium, High).
            """
            
            response = model.generate_content(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def log_experiment(self, competition_ref: str, data: dict):
        """Save a local experiment record to data/experiments.json"""
        try:
            data_dir = os.path.join(os.getcwd(), "data")
            os.makedirs(data_dir, exist_ok=True)
            db_path = os.path.join(data_dir, "experiments.json")
            
            experiments = {}
            if os.path.exists(db_path):
                with open(db_path, 'r') as f:
                    experiments = json.load(f)
            
            if competition_ref not in experiments:
                experiments[competition_ref] = []
            
            # Add timestamp and ID
            import datetime
            data["timestamp"] = datetime.datetime.now().isoformat()
            data["id"] = len(experiments[competition_ref]) + 1
            
            experiments[competition_ref].append(data)
            
            with open(db_path, 'w') as f:
                json.dump(experiments, f, indent=4)
                
            return {"status": "success", "data": data}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def get_experiments(self, competition_ref: str):
        """Fetch all experiments for a competition"""
        try:
            db_path = os.path.join(os.getcwd(), "data", "experiments.json")
            if not os.path.exists(db_path):
                return []
            
            with open(db_path, 'r') as f:
                experiments = json.load(f)
                return experiments.get(competition_ref, [])
        except Exception as e:
            return {"status": "error", "message": str(e)}
