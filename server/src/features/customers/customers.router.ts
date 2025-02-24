import express from "express";
import { getCustomerDetail, getCustomers } from "./customers.service";


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