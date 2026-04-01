import os
import sys

# Allow 'from backend.X import ...' when this file is run directly
_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import backend.models  # registers all models with Base before create_all / drop_all
from backend.database import engine, Base
from backend.seed import init_db
from backend.routes import warehouses, products, orders, order_items
from backend.json_api import router as json_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(warehouses.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(order_items.router)
app.include_router(json_router)

Base.metadata.create_all(bind=engine)
init_db()

if __name__ == "__main__":
    import subprocess
    import threading
    import webbrowser
    import uvicorn

    host = "127.0.0.1"
    port = 8000

    _frontend_dir = os.path.join(_project_root, "frontend-react")
    _vite = subprocess.Popen("npm run dev", cwd=_frontend_dir, shell=True)

    def open_browser():
        webbrowser.open("http://localhost:5173")

    threading.Timer(3.0, open_browser).start()

    try:
        uvicorn.run(app, host=host, port=port)
    finally:
        _vite.terminate()


