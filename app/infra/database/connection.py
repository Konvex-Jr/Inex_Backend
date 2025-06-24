import psycopg2

class DatabaseConnection:
    def __init__(self, user, password, dbname, host, port):
        self.conn = psycopg2.connect(
            user=user,
            password=password,
            dbname=dbname,
            host=host,
            port=port
        )
        self.conn.autocommit = True
        self.cur = self.conn.cursor()

    def run_sql_file(self, file_path: str):
        with open(file_path, 'r') as f:
            sql = f.read()
        self.cur.execute(sql)
        print(f"✅ Executed {file_path}")

    def close(self):
        self.cur.close()
        self.conn.close()
