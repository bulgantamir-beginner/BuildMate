1. backend болон frontend файлуудыг нэг project folder-т хийх.

2. backend folder-т "npm install" комманд ажиллуулах.

3. Database: PostgreSQL
   a. PostgreSQL татах
   b. pc_builder <- нэртэй датабаз үүсгэх

4. backend folder-т ".env" файл үүсгэж,
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=pc_builder
   DB_USER=postgres
   DB_PASSWORD=Your_Password

   GROQ_API_KEY=Your_Key_Here <- groq api key оруулах.
   (⚠️Анхаар: Хэрэв GROQ API key оруулаагүй бол AI чат бот зөвлөмжийн хэсэг ажиллахгүйг анхаарна уу.)

   ADMIN_PASSWORD=admin123
   (⚠️Анхаар: admin цэсэнд хандах нэр: admin, нууц үг: admin123)

5. backend folder-т
   node db/migrate.js
   node db/seed.js
   коммандуудыг уншуулан "table" үүсгэн, seed.js файл дах эхний ээлжинд хэрэглэгдэх бэлэн өгөгдлүүдийг суулгах.

6. frontend folder-т "npm install" комманд ажиллуулах.

7. backend кодыг "node server.js" коммандаар ажиллуулах.

8. frontend кодыг "npm run dev" коммандаар ажиллуулах.
