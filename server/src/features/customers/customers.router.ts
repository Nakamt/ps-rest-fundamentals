import express from "express";
import { getCustomerDetail, getCustomers, searchCustomers } from "./customers.service";
import { getOrdersForCustomer } from "../orders/orders.service";


export const customersRouter = express.Router();
//lista clientes + nao precisa de imagens 
// CTRL + Corrige a importação
customersRouter.get("/", async (req, res) => { //quando alguem acessar /api/customers/
  const customers = await getCustomers();
  res.json(customers);
});
//agora fazer os detalhes dos clientes
customersRouter.get("/:id", async (req, res)=>{ //: significa que agr vm mexer URL
  const id = req.params.id; //nao necessita do
  const customer = await getCustomerDetail(id);
  if(customer != null){ 
    res.json(customer);
  }else{
    res.status(404).json({message: "Cliente nao encontrado!"});
  }
});
//Essa parte aq foi o famoso ctrl C + Ctrl V e comentei as partes so para fixar na cabeça mesmo

customersRouter.get("/:id/orders", async(req, res)=>{ //cria-se função ger para obter os pedidos dos clientes
  const id = req.params.id; //recuperamemos o Id dnv com o msm comandinho
  const orders = await getOrdersForCustomer(id); //esse aq eu consegui fazer, mas n entendi muito a logica
  //ele qria fzr com q a constante orders passasse por essa funçãozinha para obter o pedido de cada cliente, mas e se nao houver esse id?
  //eu devia colocar um if else q nem no de cima? Ele n colocou, ent provavelmente nao
  res.json(orders);//volta-se em json como de costume
});
//agora faremos o pesquisa
customersRouter.get("/search/:query", async(req, res)=>{ //aq errei tbm, qm deve ser prefixado de : e o query e nao o search
  //pois o query vai ser o parametro dinamico que vai detalhar a pesquisa do nosso cliente
  const query = req.params.query;
  const customers = await searchCustomers(query); //aq eu errei, eu coloquei search em vez de customers como variavel
  //faz mais sentido customers pois estamos pegando a lista de clientes
  res.json(customers);
});