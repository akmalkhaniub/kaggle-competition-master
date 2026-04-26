from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from kaggle_client import KaggleClient
import os

app = FastAPI(title="Kaggle Competition Master API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = KaggleClient()

@app.get("/competitions")
async def get_competitions(search: str = Query(None), group: str = Query("general")):
    return client.list_competitions(search=search, group=group)

@app.get("/competitions/{ref}/leaderboard")
async def get_leaderboard(ref: str):
    return client.get_leaderboard(ref)

@app.post("/competitions/{ref}/download")
async def download_data(ref: str):
    path = os.path.join(os.getcwd(), "downloads", ref)
    return client.download_competition_data(ref, path=path)

@app.post("/competitions/{ref}/init-notebook")
async def init_notebook(ref: str):
    return client.init_notebook(ref)

@app.get("/health")
async def health_check():
    # Simple check if kaggle credentials are set
    username = os.environ.get("KAGGLE_USERNAME")
    key = os.environ.get("KAGGLE_KEY")
    config_exists = os.path.exists(os.path.expanduser("~/.kaggle/kaggle.json"))
    
    return {
        "status": "ok",
        "kaggle_config": {
            "env_vars_set": bool(username and key),
            "config_file_exists": config_exists
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
