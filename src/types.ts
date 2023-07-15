//fazendo o tipo dos users
export type TUser = {
    id: string,
    name: string,
    email: string,
    password: string,
    createdAt: string
}

//fazendo o tipo dos products
export type TProduct = {
    id:string,
    name:string
    price:number,
    description:string,
    imageUrl:string
}