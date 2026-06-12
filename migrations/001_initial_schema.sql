-- OMC: оптовый магазин цветов
-- Запуск: docker compose exec mysql mysql -u omc -pomc omc < migrations/001_initial_schema.sql

CREATE TABLE IF NOT EXISTS products (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  name        VARCHAR(200) NOT NULL,
  category    ENUM('flower','greenery','bouquet','supply') NOT NULL DEFAULT 'flower',
  unit        ENUM('stem','bunch','kg','piece') NOT NULL DEFAULT 'stem',
  image_url   VARCHAR(500),
  description TEXT,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ежедневные остатки (скрипт из Obsidian обновляет каждый день)
CREATE TABLE IF NOT EXISTS stock (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id     INT UNSIGNED NOT NULL,
  available_date DATE NOT NULL,
  qty_available  INT UNSIGNED NOT NULL DEFAULT 0,
  qty_reserved   INT UNSIGNED NOT NULL DEFAULT 0,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_product_date (product_id, available_date),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Ценовые уровни (розница / опт / VIP и т.п.)
CREATE TABLE IF NOT EXISTS price_tiers (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  discount_pct DECIMAL(5,2) NOT NULL DEFAULT 0.00  -- % скидки от base_price
);

-- Базовые цены на товар (+ опциональный override на уровень)
CREATE TABLE IF NOT EXISTS prices (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id  INT UNSIGNED NOT NULL,
  tier_id     INT UNSIGNED,                         -- NULL = base price для всех
  price       DECIMAL(10,2) NOT NULL,
  valid_from  DATE NOT NULL DEFAULT (CURRENT_DATE),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (tier_id)    REFERENCES price_tiers(id) ON DELETE SET NULL
);

-- Клиенты (оптовые покупатели)
CREATE TABLE IF NOT EXISTS clients (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(200) NOT NULL,
  email      VARCHAR(200),
  phone      VARCHAR(30),
  tier_id    INT UNSIGNED,
  notes      TEXT,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tier_id) REFERENCES price_tiers(id) ON DELETE SET NULL
);

-- Заявки (черновик → подтверждено → отгружено → отменено)
CREATE TABLE IF NOT EXISTS orders (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_id     INT UNSIGNED,
  status        ENUM('draft','confirmed','shipped','cancelled') NOT NULL DEFAULT 'draft',
  delivery_date DATE,
  comment       TEXT,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id        INT UNSIGNED NOT NULL,
  product_id      INT UNSIGNED NOT NULL,
  qty             INT UNSIGNED NOT NULL,
  price_at_order  DECIMAL(10,2) NOT NULL,  -- снапшот цены на момент заявки
  notes           VARCHAR(500),
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- Seed: базовые уровни
INSERT IGNORE INTO price_tiers (id, name, discount_pct) VALUES
  (1, 'Базовый', 0),
  (2, 'Опт',    10),
  (3, 'VIP',    20);

-- Seed: несколько тестовых позиций
INSERT IGNORE INTO products (id, slug, name, category, unit) VALUES
  (1, 'rosa-ecuador-50', 'Роза Эквадор 50 см', 'flower', 'stem'),
  (2, 'rosa-ecuador-70', 'Роза Эквадор 70 см', 'flower', 'stem'),
  (3, 'tulpan-holland',  'Тюльпан Голландия',  'flower', 'stem'),
  (4, 'evkalipt',        'Эвкалипт',           'greenery','bunch');

INSERT IGNORE INTO prices (product_id, tier_id, price, valid_from) VALUES
  (1, NULL, 55.00, CURRENT_DATE),
  (2, NULL, 75.00, CURRENT_DATE),
  (3, NULL, 35.00, CURRENT_DATE),
  (4, NULL, 120.00, CURRENT_DATE);

-- Seed: остатки на сегодня
INSERT INTO stock (product_id, available_date, qty_available)
  SELECT id, CURRENT_DATE, 500 FROM products
  ON DUPLICATE KEY UPDATE qty_available = 500;
