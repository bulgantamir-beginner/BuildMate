1. backend болон frontend файлуудыг нэг project folder-т хийх.

2. backend folder-т "npm install" комманд уншуулах.

3. backend folder-т
node db/migrate.js
node db/seed.js
node server.js
коммандуудыг уншуулах.

5. backend folder-т ".env" файл үүсгэж,
DB_HOST=Your_DB_Host
DB_PORT=Your_DB_Port
DB_NAME=Your_Database
DB_USER=Your_DB_User_Name
DB_PASSWORD=Your_Password
GROQ_API_KEY=Your_Key_Here <- groq api key оруулах.
ADMIN_PASSWORD=admin123  (admin цэсэнд хандах нэр: admin, нууц үг: admin123)

6. frontend folder-т "npm install" комманд уншуулах.

7. backend кодыг "node server.js" коммандаар ажиллуулах.

8. frontend кодыг "npm run dev" коммандаар ажиллуулах.
