import os
import glob
import sqlite3
import pandas as pd
import json  # Import json
from datetime import datetime

# 1. Define the Keep List
KEEP_FILES = [
    "test_scenario_micro_100.csv",
    "test_simulation_mixed_500.csv",
    "dummy_300_natural_progression.csv",
    "test_scenario_major_100.csv",
    "test_scenario_medium_100.csv"
]

UPLOADS_DIR = "uploads"
DB_PATH = "sql_app.db"

def clean_files():
    print("--- Cleaning File System ---")
    if not os.path.exists(UPLOADS_DIR):
        print("Uploads dir not found!")
        return

    all_files = os.listdir(UPLOADS_DIR)
    for f in all_files:
        if f not in KEEP_FILES:
            path = os.path.join(UPLOADS_DIR, f)
            try:
                os.remove(path)
                print(f"Deleted: {f}")
            except Exception as e:
                print(f"Error deleting {f}: {e}")
        else:
            print(f"Kept: {f}")

def seed_database():
    print("\n--- Seeding Database ---")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Clear existing datasets to avoid duplicates/ghosts
    cursor.execute("DELETE FROM datasets")
    print("Cleared 'datasets' table.")

    # Insert Keep Files
    for filename in KEEP_FILES:
        filepath = os.path.join(UPLOADS_DIR, filename)
        if not os.path.exists(filepath):
            print(f"Warning: File {filename} not found on disk, skipping DB insert.")
            continue

        # Get file stats
        try:
            df = pd.read_csv(filepath)
            row_count = len(df)
            col_count = len(df.columns)
            
            # Serialize as proper JSON, not Python string
            schema_info = json.dumps({col: str(df[col].dtype) for col in df.columns})
            
            # Simple summary
            summary_stats = json.dumps({
                "row_count": row_count,
                 "class_distribution": df['leak_status'].value_counts().to_dict() if 'leak_status' in df.columns else {}
            })
            
            # Insert
            # Schema: id, name, file_path, row_count, column_count, is_synthetic, owner_id, created_at, ...
            # We assume owner_id = 1 (Admin/Default)
            
            cursor.execute("""
                INSERT INTO datasets (
                    name, file_path, row_count, column_count, 
                    is_synthetic, owner_id, schema_info, summary_stats, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                filename.replace(".csv", "").replace("_", " ").title(), # Nice Display Name
                filepath,
                row_count,
                col_count,
                1, # dictionary boolean in sqlite often 1/0
                1, # owner_id
                schema_info,
                summary_stats,
                datetime.now()
            ))
            print(f"Inserted DB Record: {filename}")
            
        except Exception as e:
            print(f"Failed to process {filename}: {e}")

    conn.commit()
    conn.close()
    print("Database sync complete.")

def fix_gitignore():
    print("\n--- Updating .gitignore ---")
    try:
        with open(".gitignore", "r") as f:
            lines = f.readlines()
        
        new_lines = []
        for line in lines:
            if line.strip() == "uploads/" or line.strip() == "uploads":
                print("Removed 'uploads/' from .gitignore")
                continue # Skip this line
            new_lines.append(line)
            
        with open(".gitignore", "w") as f:
            f.writelines(new_lines)
            
    except Exception as e:
        print(f"Gitignore update failed: {e}")

if __name__ == "__main__":
    clean_files()
    seed_database()
    fix_gitignore()
