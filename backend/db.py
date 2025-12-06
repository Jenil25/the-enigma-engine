import pymysql
from flask import g
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_config():
    return {
        'host': os.getenv('DB_HOST', 'localhost'),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', 'password'),
        'database': os.getenv('DB_NAME', 'enigma_engine_db'),
        'port': int(os.getenv('DB_PORT', 3306)),
        'cursorclass': pymysql.cursors.DictCursor
    }

def get_db():
    if 'db' not in g:
        try:
            config = get_db_config()
            g.db = pymysql.connect(**config)
        except pymysql.MySQLError as e:
            print(f"Error connecting to MySQL: {e}")
            return None
    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    db = get_db()
    if db is None:
        print("Could not connect to database to initialize.")
        return
    
    cursor = db.cursor()
    try:
        with open('schema.sql', 'r') as f:
            sql_script = f.read()
            statements = sql_script.split(';')
            for statement in statements:
                if statement.strip():
                    cursor.execute(statement)
        db.commit()
        print("Database initialized successfully.")
    except pymysql.MySQLError as e:
        print(f"Error initializing database: {e}")
    finally:
        cursor.close()
