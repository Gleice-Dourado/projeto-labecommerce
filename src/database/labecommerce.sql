-- Active: 1689207991288@@127.0.0.1@3306


-- criando tabela de pessoas usuárias --

CREATE TABLE
    users (
        id TEXT PRIMARY KEY UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TEXT DEFAULT (DATETIME('now', 'localtime')) NOT NULL
    );

    DROP TABLE users;

-- populando a tabela users

INSERT INTO
    users (
        id,
        name,
        email,
        password
    )
VALUES (
        "u001",
        "Fulano",
        "fulano@email.com",
        "fulano123"
    ), (
        "u002",
        "Sicrano",
        "sicrano@email.com",
        "sicrano123",
        "02-07-2023"
    ), (
        "u003",
        "Beltrana",
        "beltrana@email.com",
        "beltrana123",
        "03-07-2023"
    );

-- criando a tabela de produtos

CREATE TABLE
    products (
        id TEXT PRIMARY KEY UNIQUE NOT NULL,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT NOT NULL
    );

-- populando a tabela products

INSERT INTO
    products (
        id,
        name,
        price,
        description,
        image_url
    )
VALUES (
        "prod001",
        "Mouse gamer",
        250,
        "Melhor mouse do mercado!",
        "https://picsum.photos/seed/Mouse%20gamer/400"
    ), (
        "prod002",
        "Monitor",
        900,
        "Monitor LED Full HD 24 polegadas",
        "https://picsum.photos/seed/Monitor/400"
    ), (
        "prod003",
        "SSD 256GB",
        350,
        "Rápido e eficiente!",
        "https://picsum.photos/seed/Mouse%20gamer/400"
    ), (
        "prod004",
        "Memória ram 8GB",
        300,
        "Melhor do mercado!",
        "https://picsum.photos/seed/Mouse%20gamer/400"
    ), (
        "prod005",
        "Teclado Gamer",
        200,
        "Silencioso e não trava!",
        "https://picsum.photos/seed/Mouse%20gamer/400"
    );

--

--get all users

SELECT * FROM users;

--get all products funcionalidade 1

SELECT * FROM products;

--get all products funcionalidade 2

SELECT * FROM products WHERE name LIKE '%GAMER%';

-- create a new user

INSERT INTO
    users (
        id,
        name,
        email,
        password
    )
VALUES (
        "u008",
        "luisa",
        "luisa@email.com",
        "Abc@1234"
       
    );

--create a new product

INSERT INTO
    products(
        id,
        name,
        price,
        description,
        image_url
    )
VALUES (
        'prod006',
        'webcam',
        150,
        'A melhor camera',
        'http://www.minhaloja.com/webcam'
    );


DROP TABLE products;
-- delete user by id

DELETE FROM users WHERE id = "u002";

-- delete product by id

DELETE FROM products WHERE id = "prod003";

-- edit product by id

UPDATE products
SET
    id = "prodteste1",
    name = "teste",
    price = 1,
    description = "teste",
    image_url = "teste"
WHERE id = 'prod001';

--criando a tabela de pedidos

CREATE TABLE
    purchases (
        id TEXT PRIMARY KEY UNIQUE NOT NULL,
        buyer TEXT NOT NULL,
        total_price REAL NOT NULL,
        created_at TEXT DEFAULT (DATETIME('now', 'localtime')) NOT NULL,
        FOREIGN KEY (buyer) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
    );

SELECT * FROM purchases;

--populando a tabela de pedidos

INSERT INTO
    purchases(
        id,
        buyer,
        total_price,
        created_at
    )
VALUES (
        'p001',
        'u001',
        250.00,
        '01-02-2023'
    );

--atualizando

UPDATE purchases
SET
    id = "p001",
    buyer = "u003",
    total_price = 256.75,
    created_at = '01-02-2023'
WHERE id = 'p001';

--juntando as duas tabelas(recibo)

SELECT
    purchases.id AS purchase_Id,
    users.id AS buyer_id,
    users.name AS buyer_name,
    users.email,
    purchases.total_price,
    purchases.created_at
FROM purchases
    INNER JOIN users ON purchases.buyer = users.id;

--Tabela de relação purchases_products

CREATE TABLE
    purchases_products (
        purchase_id TEXT NOT NULL,
        -- não pode ser UNIQUE
        product_id TEXT NOT NULL,
        -- não pode ser UNIQUE
        quantity INTEGER NOT NULL,
        FOREIGN KEY (purchase_id) REFERENCES purchases (id) ON UPDATE CASCADE ON DELETE CASCADE FOREIGN KEY (product_id) REFERENCES products (id) ON UPDATE CASCADE ON DELETE CASCADE
    );

INSERT INTO
    purchases_products (
        purchase_id,
        product_id,
        quantity
    )
VALUES ('p001', 'prod004', 1), ('p001', 'prod002', 2), ('p002', 'prod004', 10);

--junção das tabelas

SELECT *
FROM purchases_products
    INNER JOIN purchases ON purchases_products.purchase_id = purchases.id
    INNER JOIN products ON purchases_products.product_id = products.id;

