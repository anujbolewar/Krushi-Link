from collections.abc import Generator
from sqlalchemy import event
from sqlalchemy.engine import Engine
import logging
import time

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker
from logging.handlers import RotatingFileHandler  # Ensure RotatingFileHandler is imported

from app.core.config import settings

# Enable logging for slow queries
logging.basicConfig()
logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)

# Log slow queries exceeding 1 second
@event.listens_for(Engine, "before_cursor_execute")
def log_slow_queries(conn, cursor, statement, parameters, context, executemany):
    conn.info.setdefault("query_start_time", time.time())

@event.listens_for(Engine, "after_cursor_execute")
def log_query_duration(conn, cursor, statement, parameters, context, executemany):
    total = time.time() - conn.info["query_start_time"]
    if total > 1.0:  # Log queries taking longer than 1 second
        logging.warning(f"SLOW QUERY: {statement} took {total:.2f} seconds")


engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if settings.database_url.startswith("sqlite") else {},
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Set up structured JSON logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger("app")

# Add daily log rotation with 30-day retention
handler = RotatingFileHandler("app.log", maxBytes=10**6, backupCount=30)
formatter = logging.Formatter('{"timestamp": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s", "context": "%(name)s"}')
handler.setFormatter(formatter)
logger.addHandler(handler)

# Log unhandled exceptions
import sys

def log_unhandled_exception(exc_type, exc_value, exc_traceback):
    if issubclass(exc_type, KeyboardInterrupt):
        sys.__excepthook__(exc_type, exc_value, exc_traceback)
        return
    logger.critical("Unhandled exception", exc_info=(exc_type, exc_value, exc_traceback))

sys.excepthook = log_unhandled_exception

# Add admin email alerts for critical errors
from logging.handlers import SMTPHandler

mail_handler = SMTPHandler(
    mailhost=("smtp.example.com", 587),
    fromaddr="admin@example.com",
    toaddrs=["admin@example.com"],
    subject="Critical Error in AgroVault",
    credentials=("username", "password"),
    secure=(),
)
mail_handler.setLevel(logging.CRITICAL)
logger.addHandler(mail_handler)

