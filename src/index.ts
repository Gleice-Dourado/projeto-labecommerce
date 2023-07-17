import express, { Request, Response, query } from 'express';
import cors from 'cors'
import { TProduct, TPurchase, TUser } from './types';
import { db } from "../src/database/knex";

const app = express()

app.use(express.json())

app.use(cors())

app.listen(3003, () => {
    console.log("Servidor rodando na porta 3003")
})

//END-POINTS

//TESTE
app.get("/ping", (req: Request, res: Response) => {
    res.status(200).send("Pong!")
})

//GET ALL PRODUCTS
app.get("/products", async (req: Request, res: Response) => {
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

            const response = await db('products').where('name', 'like', `%${name}%`)

            res.status(200).send(response);
        } else {

            const result = await db('products');

            res.status(200).send(result);
        }
    } catch (error) {

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

            const response = await db('users').where('name', 'like', `%${name}%`);

            res.status(200).send(response);
        } else {
            const result = await db('users');

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


// GET PURCHASE BY ID
app.get("/purchases/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        if (!id) {
            res.status(422).send("Please provide the purchase ID.");
            return;
        }

        const [purchase] = await db("purchases").where({ id });

        if (!purchase) {
            res.status(404).send("Purchase not found.");
        }

        const [buyer] = await db("users").where({ id: purchase.buyer_id }); 

        if (!buyer) {
            res.status(404).send("Buyer not found.");
        }

        const products = await db("purchases_products")
            .where({ purchase_id: id })
            .join("products", "purchases_products.product_id", "=", "products.id")
            .select(
                "products.id",
                "products.name",
                "products.price",
                "products.description",
                "products.image_url",
                "purchases_products.quantity"
            );

        const response = {
            purchaseId: purchase.id,
            buyerId: buyer.id,
            buyerName: buyer.name,
            buyerEmail: buyer.email,
            totalPrice: purchase.total_price,
            createdAt: purchase.created_at,
            products: products,
        };

        res.status(200).send(response);
    } catch (error) {
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

        const newUser = {
            id,
            name,
            email,
            password
        }

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


        const [usersIsEmpty] = await db('users');

        if (!usersIsEmpty && usersIsEmpty.length === 0) {

            await db('users').insert(newUser)

        } else {
            const [checkId] = await db('users').where({ id: id })

            const [checkEmail] = await db('users').where({ email: email })

            if (checkId) {
                res.status(400);
                throw new Error("This ID is already in use. Please choose another one.");
            }

            if (checkEmail) {
                res.status(400);
                throw new Error("An account with this email already exists. Please use a different email.");
            }

            await db('users').insert(newUser)

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
app.post("/products", async (req: Request<{}, TProduct, TProduct>, res: Response) => {
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

        const [existingProductById] = await db('products').where({ id: id });

        if (existingProductById && existingProductById.length > 0) {
            res.status(400);
            throw new Error("Product with this ID already exists");
        }

        const newProduct = {
            id,
            name,
            price,
            description,
            image_Url: imageUrl
        }

        await db('products').insert(newProduct)

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

        const findUser = await db('users').where({ id: id })

        if (findUser) {
            await db('users').del().where({ id: id });

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

        const existingProduct = await db('products').where({ id: id })

        if (existingProduct && existingProduct.length > 0) {
            await db('products').del().where({ id: id });

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


//EDIT PRODUCTS BY ID                         parâmetro   corpo req  resposta
app.put("/products/:id", async (req: Request<{ id: string }, TProduct, TProduct>, res: Response) => {
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

        const [existingProduct] = await db("products").where({ id: id })

        if (existingProduct) {

            const updateProduct = {
                id: id || existingProduct.id,
                name: name || existingProduct.name,
                price: price || existingProduct.price,
                description: description || existingProduct.description,
                image_Url: imageUrl || existingProduct.image_Url
            }

            await db('products').update(updateProduct).where({ id: id })

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

//CREATE PURCHASE 
app.post("/purchases", async (req: Request<{}, {}, TPurchase>, res: Response) => {
    try {
        const { id, buyer, products } = req.body;

        if (!id || !buyer || !products || products.length === 0) {
            res.status(400);
            throw new Error("All fields must be filled in to create a new purchase");
        }


        if (typeof id !== 'string' || !id.startsWith('pur')) {
            res.status(422);
            throw new Error('Invalid id format. The id must be a string starting with "pur". Please try again.');
        }

        const [existingPurchase] = await db('purchases').where({ id });
        if (existingPurchase) {
            res.status(409);
            throw new Error(`Purchase with id ${id} already exists. Please use a different id.`);
        }

        const [existingUser] = await db('users').where({ id: buyer });
        if (!existingUser) {
            res.status(404);
            throw new Error("Buyer not found");
        }

        let total_price = 0;
        for (let product of products) {
            const [existingProduct] = await db('products').where({ id: product.id });
            if (!existingProduct) {
                res.status(404);
                throw new Error(`Product with id ${product.id} not found`);
            }
            total_price += existingProduct.price * product.quantity;
        }


        const newPurchase = {
            id,
            buyer_id: buyer,
            total_price,

        }
        await db('purchases').insert(newPurchase);


        for (let product of products) {
            const purchaseProduct = {
                purchase_id: id,
                product_id: product.id,
                quantity: product.quantity
            }
            await db('purchases_products').insert(purchaseProduct);
        }

        res.status(201).send("Order successfully placed");
    } catch (error: any) {
        if (error instanceof Error) {
            res.send(error.message);
        } else {
            res.send("Unknown error.");
        }
    }
});



//DELETE PURCHASE BY ID
app.delete("/purchases/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        if (!id) {
            res.status(422);
            throw new Error("Please provide the purchase ID.");
        }

        if (typeof id !== "string") {
            res.status(422);
            throw new Error("Invalid information type. The purchase ID must be a string. Please try again.");
        }

        if (id.length < 3 || id.substring(0, 3) !== "pur") {
            res.status(422);
            throw new Error('Invalid information. The purchase ID must start with the letters "pur" and have at least three characters. Please try again.');
        }

        const findPurchase = await db("purchases").where({ id });

        if (findPurchase.length > 0) {
            await db('purchases').del().where({ id });

            // Delete the products associated with the purchase in the "purchases_products" table
            await db('purchases_products').where({ purchase_id: id }).del();

            res.status(200).send("Order successfully canceled");
        } else {
            res.status(404).send("Order not found");
        }
    } catch (error) {
        if (error instanceof Error) {
            res.send(error.message);
        } else {
            res.send("Unknown error.");
        }
    }
});
