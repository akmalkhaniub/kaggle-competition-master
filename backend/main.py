from fastapi import FastAPI, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from kaggle_client import KaggleClient
import os
import asyncio
import json

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

# WebSocket Manager for Progress
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_text(json.dumps(message))

manager = ConnectionManager()

@app.websocket("/ws/progress")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/competitions")
async def get_competitions(search: str = Query(None), group: str = Query("general")):
    return client.list_competitions(search=search, group=group)

@app.get("/competitions/{ref}/leaderboard")
async def get_leaderboard(ref: str):
    return client.get_leaderboard(ref)

@app.get("/competitions/{ref}/ai-summary")
async def get_ai_summary(ref: str, title: str, category: str):
    return client.get_ai_summary(title, category)

@app.post("/competitions/{ref}/download")
async def download_data(ref: str):
    path = os.path.join(os.getcwd(), "downloads", ref)
    
    def progress_handler(percent):
        asyncio.run(manager.broadcast({
            "type": "download_progress",
            "ref": ref,
            "progress": percent
        }))
        
    # Run in thread to not block event loop
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, client.download_competition_data, ref, path, progress_handler)

@app.post("/competitions/{ref}/init-notebook")
async def init_notebook(ref: str):
    return client.init_notebook(ref)

@app.post("/cli/execute")
async def execute_cli(command: str = Query(...)):
    return client.run_cli_command(command)

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
