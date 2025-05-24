import os
#ucitava .env
from dotenv import load_dotenv # type: ignore 

load_dotenv()  # učitava .env 
def get_database_uri():
    user = os.getenv("POSTGRES_USER")
    password = os.getenv("POSTGRES_PASSWORD")
    db = os.getenv("POSTGRES_DB")
    host = os.getenv("POSTGRES_HOST", "postgres")
    port = os.getenv("POSTGRES_PORT", "5432")

    return f"postgresql://{user}:{password}@{host}:{port}/{db}"