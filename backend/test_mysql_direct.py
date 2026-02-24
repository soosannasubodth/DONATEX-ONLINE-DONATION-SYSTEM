import MySQLdb

print("Testing direct MySQL connection...")
try:
    connection = MySQLdb.connect(
        host='127.0.0.1',
        port=3307,
        user='root',
        password='Susu@2005',
        database='donatex'
    )
    
    print("✅ Successfully connected to MySQL!")
    
    cursor = connection.cursor()
    cursor.execute("SELECT COUNT(*) FROM users")
    result = cursor.fetchone()
    print(f"\n✅ Total users in database: {result[0]}")
    
    cursor.execute("SELECT id, email, role FROM users LIMIT 10")
    users = cursor.fetchall()
    print("\nUsers in database:")
    for user in users:
        print(f"  {user[0]}: {user[1]} (Role: {user[2]})")
    
    connection.close()
    
except Exception as e:
    print(f"❌ Connection failed: {str(e)}")
    import traceback
    traceback.print_exc()
