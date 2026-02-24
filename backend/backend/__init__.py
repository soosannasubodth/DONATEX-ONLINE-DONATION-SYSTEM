# Optional MySQL support - only needed for MySQL database backend
try:
    import pymysql
    pymysql.version_info = (2, 2, 6, 'final', 0)  # mimic mysqlclient version
    pymysql.install_as_MySQLdb()
except ImportError:
    pass  # SQLite or other database backend is being used
