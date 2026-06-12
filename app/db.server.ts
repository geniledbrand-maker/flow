import mysql from "mysql2/promise";

// .server.ts — не попадёт в клиентский бандл (RR7 convention)
const pool = mysql.createPool({
  host:     process.env.DB_HOST     ?? "localhost",
  port:     Number(process.env.DB_PORT ?? 3306),
  database: process.env.DB_NAME     ?? "omc",
  user:     process.env.DB_USER     ?? "omc",
  password: process.env.DB_PASSWORD ?? "omc",
  waitForConnections: true,
  connectionLimit: 10,
  timezone: "+03:00",
});

export default pool;
