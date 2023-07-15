import express, { Request, Response, query } from 'express';
import cors from 'cors'
// import { createProduct, createUser, getAllProducts, getAllUsers, products, searchProductsByName, searchUsersByName, users } from "./database";
import { TProduct, TUser } from './types';

import { db } from "../src/database/knex";
//configurando o express
const app = express()

app.use(express.json())

app.use(cors())

app.listen(3003, () => {
    console.log("Servidor rodando na porta 3003")
})


// createProduct("prod003", "SSD gamer", 349.99, "Acelere seu sistema com velocidades incríveis de leitura e gravação.", "IMAGE1")
// createProduct("prod004", "Teclado gamer", 249.99, "Maior rapidez e facilidade ao digitar.", "IMAGE2")

// console.log(products)

// console.log(searchProductsByName("gam"))
// console.log(searchUsersByName("bel"))


//END-POINTS

//TESTE
app.get("/ping", (req: Request, res: Response) => {
    res.status(200).send("Pong!")
})

//GET ALL PRODUCTS
app.get("/products", async (req: Request, res: Response) => {
    try {
        const name = req.query.name as string;

        // Verifica se o parâmetro "name" é uma string
        if (name) {
            if (typeof name !== "string") {
                res.status(422);
                throw new Error("The name must be a string.");
            }

            // Verifica se o parâmetro "name" está vazio ou possui menos de 1 caractere
            if (!name || name.length < 1) {
                res.status(400);
                throw new Error("The name must contain at least one letter.");
            }

            const response = await db.raw(`SELECT * FROM products WHERE name LIKE '%${name}%';`);
            res.status(200).send(response);
        } else {
            // Realiza uma consulta no banco de dados para obter todos os produtos
            const result = await db.raw(`SELECT * FROM products`);

            // Envia os produtos encontrados como resposta com o status 200
            res.status(200).send(result);
        }
    } catch (error) {
        // Tratamento de erros
        if (error instanceof Error) {
            res.status(500).send(error.message);
        } else {
            res.status(500).send("Unknown error.");
        }
    }
});

//GET ALL USERS
app.get("/users", async (req: Request, res: Response) => {
    try {
        const name = req.query.name as string;

        if (name) {
            if (typeof name !== "string") {
                res.status(422);
                throw new Error("The name must be a string.");
            }

            if (!name || name.length < 1) {
                res.status(400);
                throw new Error("The name must contain at least one letter.");
            }

            const response = await db.raw(`SELECT * FROM users WHERE name LIKE '%${name}%';`);
            res.status(200).send(response);
        } else {
            const result = await db.raw(`SELECT * FROM users;`);
            res.status(200).send(result);
        }
    } catch (error) {
        res.status(400).send("An error occurred.");
    }
});





//GET ALL PRODUCTS
app.get("/products", async (req: Request, res: Response) => {
    try {
        const name = req.query.name as string;

        // Verifica se o parâmetro "name" é uma string
        if (name) {
            if (typeof name !== "string") {
                res.status(422);
                throw new Error("The name must be a string.");
            }

            // Verifica se o parâmetro "name" está vazio ou possui menos de 1 caractere
            if (!name || name.length < 1) {
                res.status(400);
                throw new Error("The name must contain at least one letter.");
            }

            const response = await db.raw(`SELECT * FROM products WHERE name LIKE '%${name}%';`)
            res.status(200).send(response)
        } else {
            // Realiza uma consulta no banco de dados para obter todos os produtos
            const result = await db.raw(`SELECT * FROM products`);

            // Envia os produtos encontrados como resposta com o status 200
            res.status(200).send(result);

        }

    } catch (error) {
        // Tratamento de erros
        if (error instanceof Error) {
            res.status(500).send(error.message);
        } else {
            res.status(500).send("Unknown error.");
        }
    }
});

//CREATE USER
app.post("/users", async (req: Request<{}, TUser, TUser>, res: Response) => {
    try {
        const { id, name, email, password } = req.body;

        if (!id || !name || !email || !password) {
            res.status(400);
            throw new Error("Please fill in all fields to create a new user.");
        }

        if (typeof id !== "string" || id.length === 0) {
            res.status(422);
            throw new Error("Invalid information, ID must be a non-empty string. Please try again.");
        }

        if (id[0] !== "u") {
            res.status(422);
            throw new Error("Invalid information, ID must start with 'u'. Please try again.");
        }

        if (typeof name !== "string" || name.length === 0) {
            res.status(422);
            throw new Error("Invalid information. Name must be a non-empty string.");
        }

        if (typeof email !== "string" || !email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
            res.status(422);
            throw new Error("Incorrect email format. Please enter a valid email (e.g., name@domain.com).");
        }

        if (
            typeof password !== "string" ||
            !password.match(/^(?=.*[A-Z])(?=.*[!#@$%&])(?=.*[0-9])(?=.*[a-z]).{6,10}$/)
        ) {
            res.status(422);
            throw new Error(
                "Invalid password. The password should have 6-10 characters, including at least one uppercase letter, one lowercase letter, one digit, and one special character."
            );
        }

        const [usersIsEmpty] = await db.raw(`SELECT * FROM users;`);

        if (!usersIsEmpty && usersIsEmpty.length === 0) {
            const result = await db.raw(`
          INSERT INTO users(id, name, email, password)
          VALUES('${id}', '${name}', '${email}', '${password}');
        `);
        } else {
            const [checkId] = await db.raw(`
          SELECT * FROM users WHERE id = '${id}';
        `);

            const [checkEmail] = await db.raw(`
          SELECT * FROM users WHERE email = '${email}';
        `);

            if (checkId) {
                res.status(400);
                throw new Error("This ID is already in use. Please choose another one.");
            }

            if (checkEmail) {
                res.status(400);
                throw new Error("An account with this email already exists. Please use a different email.");
            }

            await db.raw(`
          INSERT INTO users(id, name, email, password)
          VALUES('${id}', '${name}', '${email}', '${password}');
        `);
        }

        res.status(201).send("User successfully registered.");
    } catch (error: any) {
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send('Unknown error.')
        };
    }
});


//CREATE PRODUCT 
app.post("/products", async (req: Request, res: Response) => {
    try {
        const { id, name, price, description, imageUrl } = req.body;

        if (!id || !name || !price || !description || !imageUrl) {
            res.status(400);
            throw new Error("All fields must be filled in to create a new product");
        }

        if (typeof id !== 'string' || !id.startsWith('prod')) {
            res.status(422);
            throw new Error('Invalid id format. The id must be a string starting with "prod". Please try again.');
        }


        if (typeof name !== 'string' || name.trim().length === 0) {
            res.status(422);
            throw new Error('Invalid name format. The name must be a non-empty string. Please try again.');
        }


        if (typeof price !== 'number' || price <= 0) {
            res.status(422);
            throw new Error('Invalid price format. The price must be a valid number greater than zero. Please try again.');
        }

        if (typeof description !== 'string' || description.trim().length === 0) {
            res.status(422);
            throw new Error('Invalid description format. The product must have a non-empty description. Please try again.');
        }


        if (typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
            res.status(422);
            throw new Error('Invalid imageUrl format. The product must have a non-empty imageUrl. Please try again.');
        }

        const existingProductById = await db.raw(`
        SELECT * FROM products WHERE id = '${id}';
      `);

        if (existingProductById && existingProductById.length > 0) {
            res.status(400);
            throw new Error("Product with this ID already exists");
        }

        await db.raw(`
        INSERT INTO products (id, name, price, description, image_Url)
        VALUES ('${id}', '${name}', ${price}, '${description}', '${imageUrl}');
      `);

        res.status(201).send("Product successfully registered");
    } catch (error: any) {
        if (error instanceof Error) {
            res.send(error.message);
        } else {
            res.send("Unknown error.");
        }
    }
});



//DELETE USER 
app.delete("/users/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        if (!id) {
            res.status(422);
            throw new Error("Please provide the user ID.");
        }

        if (typeof id !== "string") {
            res.status(422);
            throw new Error("Invalid information type. The user ID must be a string. Please try again.");
        }

        if (typeof (id) === "string") {
            if (id.length < 2 || id[0] !== "u") {
                res.status(422);
                throw new Error('Invalid information. The user ID must start with the letter "u" and have at least two characters. Please try again.');
            }
        }

        // Check if the user exists
        const findUser = await db.raw(`SELECT * FROM users WHERE id = '${id}';`);

        if (findUser) {
            await db.raw(`DELETE FROM users WHERE id = '${id}';`);

            res.status(200).send("User successfully deleted!");
        } else {
            res.status(200).send("User not found!");
        }
    } catch (error) {
        if (error instanceof Error) {
            res.send(error.message);
        } else {
            res.send("Unknown error.");
        }
    }
});

//DELETE PRODUCT
app.delete("/products/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        if (!id) {
            res.status(422);
            throw new Error("Please provide the product ID.");
        }

        if (typeof id !== "string") {
            res.status(422);
            throw new Error("Invalid information type. The product ID must be a string. Please try again.");
        }

        // Check if the product exists
        const existingProduct = await db.raw(`SELECT * FROM products WHERE id = '${id}';`);

        if (existingProduct && existingProduct.length > 0) {
            await db.raw(`DELETE FROM products WHERE id = '${id}';`);

            res.status(200).send("Product successfully deleted!");
        } else {
            res.status(200).send("Product not found!");
        }
    } catch (error) {
        if (error instanceof Error) {
            res.send(error.message);
        } else {
            res.send("Unknown error.");
        }
    }
});


//EDIT PRODUCTS BY ID
app.put("/products/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        const { name, price, description, imageUrl } = req.body;

        if (!id) {
            res.status(422);
            throw new Error("Please inform the product's id.");
        }

        if (typeof id === 'string') {
            if (id.substring(0, 4) !== 'prod') {
                res.status(422);
                throw new Error('Invalid information, id must start with the word "prod". Try again.');
            }
        }

        if (name) {
            if (typeof name !== 'string' || name.trim() === '' || name.length <= 0) {
                res.status(422);
                throw new Error('Invalid information type, name must be a valid string. Try again.');
            }
        }

        if (price) {
            if (typeof price === 'number') {
                if (price <= 0) {
                    res.status(422);
                    throw new Error('Invalid information, price must be a number higher than zero. Try again.');
                }
            } else {
                res.status(422);
                throw new Error('Invalid information type, price must be a number. Try again.');
            }
        }

        if (description) {
            if (typeof description !== 'string' || description.trim() === '' || description.length <= 0) {
                res.status(422);
                throw new Error('Invalid information, the description must be a valid string. Try again');
            }
        }

        if (imageUrl) {
            if (typeof imageUrl !== 'string' || imageUrl.trim() === '' || imageUrl.length <= 0) {
                res.status(422);
                throw new Error('Invalid information type, the product must have an image. Try again.');
            }
        }

      
        
        const existingProduct = await db.raw(`SELECT * FROM products WHERE id = '${id}';`);

        if (existingProduct && existingProduct.length > 0) {
      
            await db.raw(`
                UPDATE products SET
                name = '${name}',
                price = ${price},
                description = '${description}',
                image_Url = '${imageUrl}'
                WHERE id = '${id}';
            `);

            res.status(200).send("Product successfully updated!");
        } else {
            res.status(200).send("Product not found!");
        }
    } catch (error) {
        if (error instanceof Error) {
            res.send(error.message);
        } else {
            res.send("Unknown error.");
        }
    }
});