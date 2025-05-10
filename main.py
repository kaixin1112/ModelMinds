from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

app = FastAPI()
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/info", response_class=HTMLResponse)
def show_info(request: Request, data: str = ""):
    print("Scanned QR Data:", data)  # Debug log

    # Default user information
    username = "Guest"
    email = "unknown@gmail.com"

    # Parsing the scanned QR data
    try:
        lines = data.splitlines()
        for line in lines:
            if line.startswith("Username:"):
                username = line.replace("Username:", "").strip()
            elif line.startswith("Email:"):
                email = line.replace("Email:", "").strip()
    except Exception as e:
        print("QR parse error:", e)

    # Item prices for display
    prices = {
        "Plastic": 0.10,
        "Paper": 0.05,
        "Bottle": 0.15
    }

    return templates.TemplateResponse("info.html", {
        "request": request,
        "username": username,
        "email": email,
        "prices": prices
    })
