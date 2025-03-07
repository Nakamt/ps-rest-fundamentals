import express from "express"; // fornece funções para criar servidores
import { itemsRouter } from "./items/items.router";
import { customersRouter } from "./customers/customers.router";
import { ordersRouter } from "./orders/orders.router";
import { validateAccessToken } from "../middleware/auth0middleware";

// register routes
//vamos agrupa-los (items, customers, orders)
const apiRouter = express.Router(); // cria o roteador principal para varias rotas

apiRouter.use("/items", itemsRouter); //aq meio que explica que cada API vai ser atendida como tipo blabla/api/items, meio que pavimenta as ruas
//so items por enquanto q vai ser separado a validação de tokens
apiRouter.use("/customers", validateAccessToken ,customersRouter); //mesma coisa

apiRouter.use("/orders", validateAccessToken, ordersRouter); //mesma coisa

export const routes = express.Router();
routes.use("/api", apiRouter); //aq diz que tudo vai estar acessivel com o prefixo api ou seja: blablabla/api/router
routes.get("/", (req, res) => { // aq vai mostrar se o server está pronto quando tiver uma / logo em seguida do http://localhost:4000
  res.status(200).send("<h1>Server is ready!</h1>"); //status 200 (ok) 
});

/*a duvida é se ele ja define itemsRouter, customersRouter e ordersRouter antes ou depois de criar as pastas
items.router.ts e etc. Tipo eu sei que ele ja meio que ta definindo aqui um roteador principal que vai levar as rotas em seu determinado
destino, maS ele faz isso primeiro ou dps de fazer essas pastas? Pq antes de codar aqui, acho eu, deve ser importado o ./items/items.router por exemplo */
