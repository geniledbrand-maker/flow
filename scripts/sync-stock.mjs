#!/usr/bin/env node
/**
 * Синхронизация остатков из Obsidian-заметки в MySQL.
 *
 * Формат строки в .md:
 *   - rosa-ecuador-50 | 300
 *   - tulpan-holland   | 150
 *
 * Запуск:
 *   node scripts/sync-stock.mjs путь/к/заметке.md
 *   node scripts/sync-stock.mjs путь/к/заметке.md 2026-06-13   (дата по умолчанию — сегодня)
 */

import fs from "fs";
import mysql from "mysql2/promise";
import "dotenv/config";

const [, , mdFile, dateArg] = process.argv;

if (!mdFile) {
  console.error("Использование: node scripts/sync-stock.mjs <файл.md> [YYYY-MM-DD]");
  process.exit(1);
}

const date = dateArg ?? new Date().toISOString().slice(0, 10);
const content = fs.readFileSync(mdFile, "utf-8");

// Парсим строки вида: - slug | qty
const rows = [];
for (const line of content.split("\n")) {
  const m = line.match(/^[-*]\s+([\w-]+)\s*\|\s*(\d+)/);
  if (m) rows.push({ slug: m[1], qty: parseInt(m[2], 10) });
}

if (!rows.length) {
  console.log("Остатков не найдено в файле.");
  process.exit(0);
}

const db = await mysql.createConnection({
  host:     process.env.DB_HOST     ?? "localhost",
  port:     Number(process.env.DB_PORT ?? 3306),
  database: process.env.DB_NAME     ?? "omc",
  user:     process.env.DB_USER     ?? "omc",
  password: process.env.DB_PASSWORD ?? "omc",
});

let updated = 0;
for (const { slug, qty } of rows) {
  const [[product]] = await db.query(
    "SELECT id FROM products WHERE slug = ? AND active = 1",
    [slug]
  );
  if (!product) {
    console.warn(`  ⚠  Товар не найден: ${slug}`);
    continue;
  }
  await db.query(
    `INSERT INTO stock (product_id, available_date, qty_available)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE qty_available = VALUES(qty_available)`,
    [product.id, date, qty]
  );
  console.log(`  ✓  ${slug}: ${qty} шт на ${date}`);
  updated++;
}

await db.end();
console.log(`\nОбновлено: ${updated} из ${rows.length} позиций.`);
