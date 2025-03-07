import express from "express";
import { addOrderItems, deleteOrder, deleteOrderItem, getOrderDetail, getOrders, upsertOrder } from "./orders.service";
import { idItemIdUUIDRequestSchema, idUUIDRequestSchema, orderItemsDTORequestSchema, orderPOSTRequestSchema, orderPUTRequestSchema, pagingRequestSchema } from "../types";
import { validate } from "../../middleware/validation.middleware";
import { create } from "xmlbuilder2";
import { checkRequiredScope } from "../../middleware/auth0middleware";
import { OrdersPermissions, SecurityPermissions } from "../../config/permissions";

export const ordersRouter = express.Router();
//o codigo segue o mesmo padrao do itens, so q com UUID, e algumas alterações
ordersRouter.get("/", checkRequiredScope(OrdersPermissions.Read),validate(pagingRequestSchema), async(req,res)=>{
//     const query = req.query; //Capturar todos os parametros dps do ? na URL e retorna como string
//     const take = query.take; //Vai pegar o valor de take (string)
//     const skip = query.skip; //Vai pegar o valor de skip (string)

//     if( take && typeof take === "string" // confirma se take foi passado e é uma string(typeof faz isso: garante o tipo de uma variavel)
//         && parseInt(take) > 0 //converte take para comparar e ver se é maior que 0
//         && skip //confirma se skip foi passado
//         && typeof skip === "string" //e se skip e uma string
//         && parseInt(skip) >= 0 // converte skip para comparar e ver se e maior ou IGUAl a 0
//         //aq eu mexi pq sim, mas ele usou '> -1'
//     ){
//         const orders = await getOrders(parseInt(skip), parseInt(take));
//         res.json(orders);

//     }else{
//         res.status(404).json({message: [
//             "Take e skip sao necessarios",
//             "Take deve ser maior que 0 e skip maior ou igual a 0"
//         ].join("\n")}); /** achei que dava p fazer quebras de linha com /n, da n
//              na real, o chat me mostrou esse jeito de quebra linhas, so to brincando com o codigo mesmo...
//              fiz mais de dois jeitos e ambos mostram que no json ele acaba colocando um \n ali no thunderclient, fica feio, mas vou dxa assim pq ta legal, aprendizado né*/
//     }
// /** Esse if else, nem sempre e bom, visto que estamos validando manualmente TUDO, mas se tivermos 
//  * MUITOS parametros para validar se fudemo, mas existe uma forma parar ver tudo automatico (vinicius13)
// nao quero apagar, pq foi um dos poucos q eu real entendi

    const data = pagingRequestSchema.parse(req); //parse vai pegar os dados de skip e take (convertido em numeros) e validar
    const orders = await getOrders(data.query.skip, data.query.take);
    res.json(orders);
});

ordersRouter.get("/:id", checkRequiredScope(OrdersPermissions.Read_Single),validate(idUUIDRequestSchema) ,async(req,res)=>{
    // const id = req.params.id;
    // const order = await getOrderDetail(id);
    // if(order != null){
    //     res.json(order);
    // }else{
    //     res.status(404).json({message: "Pedido nao encontrado"});
    // }

    const data = idUUIDRequestSchema.parse(req);
    const order = await getOrderDetail(data.params.id);
    if(order != null){
        res.json(order);
    }else{
        res.status(404).json({message: "Pedido nao encontrado"});
    } //ERREI, esqueci o krai do if else, achei q n precisava, visto que o ZOD ja ta fazendo TUDO MESMO!
    //maaas, pelo visto precisa...
});

ordersRouter.post("/", checkRequiredScope(OrdersPermissions.Create),validate(orderPOSTRequestSchema), async(req,res)=>{
    const data = orderPOSTRequestSchema.parse(req);
    const order = await upsertOrder(data.body);
    if(order != null){
        if(req.headers["accept"] == "application/xml"){
            res.status(201).send(create().ele("order", order).end());
          }else{
            res.status(201).json(order);
          }
    }else{
        if(req.headers["accept"] == "application/xml"){
            res.status(500).send(create().ele("error", {message: "Falha na criacao do pedido"}).end());
          }else{
            res.status(500).json({message: "Falha na criacao do pedido"});
          }
    } 
});//msm ideia dos outros tbm

//POST para subcoleções, mesma ideia do GET
//Mesma ideia de um POST regular tbm, muda nada so aumenta uma coisinha ou outra
ordersRouter.post("/:id/items", checkRequiredScope(OrdersPermissions.Create),validate(orderItemsDTORequestSchema), async(req,res)=>{
    const data = orderItemsDTORequestSchema.parse(req);
    const order = await addOrderItems(data.params.id, data.body);
    if(order != null){
        if(req.headers["accept"] == "application/xml"){
            res.status(201).send(create().ele("order", order).end());
          }else{
            res.status(201).json(order);
          }
    }else{
        if(req.headers["accept"] == "application/xml"){
            res.status(500).send(create().ele("error", {message: "Falha na adicao!"}).end());
          }else{
            res.status(500).json({message: "Falha na adicao!"});
          }
    }
});

ordersRouter.delete("/:id", checkRequiredScope(SecurityPermissions.Deny),validate(idUUIDRequestSchema) ,async(req,res)=>{
    const data = idUUIDRequestSchema.parse(req);
    const order = await deleteOrder(data.params.id);
    if(order != null){
        res.json(order);
    }else{
        res.status(404).json({message: "Pedido nao encontrado"});
    } //exercicio feito! so n sei testar em orders, mas acho q ta certinho!
});
//DELETE para subcolecoes e mais chato, pois vai precisar de dois ID's(order + item)
ordersRouter.delete("/:id/items/:itemId", checkRequiredScope(OrdersPermissions.Create),validate(idItemIdUUIDRequestSchema), async(req, res)=>{
    const data = idItemIdUUIDRequestSchema.parse(req);
    const order = await deleteOrderItem(data.params.id, data.params.itemId);
    if(order != null){
        if(req.headers["accept"] == "application/xml"){
            res.status(201).send(create().ele("order", order).end());
          }else{
            res.status(201).json(order);
          }
    }else{
        if(req.headers["accept"] == "application/xml"){
            res.status(404).send(create().ele("error", {message: "Pedido ou item nao encontrado!"}).end());
          }else{
            res.status(404).json({message: "Pedido ou item nao encontrado!"});
          }
    }
});

//aqui vai ser diferente, ele implementou do jeito DELE, e n de um jeito casual
// pois aqui em orders precisamos atualizar uma UNICA entidade (usaria path, mas n se usa nesse curso)
ordersRouter.put("/:id", checkRequiredScope(OrdersPermissions.Write),validate(orderPUTRequestSchema), async(req, res)=>{
    const data = orderPUTRequestSchema.parse(req);
    const orderData = {customerId: "", ...data.body}; //esses tres pontos é: pega todas as propriedades de data.body e espalhe dentro de orderData
    //ou seja, ela so garante que todas as prorpiedades do cody sejam copiadas corretamente
    const order = await upsertOrder(orderData, data.params.id);
    if(order != null){
        res.json(order);
    }else{
        res.status(404).json({message: "Pedido nao encontrado!"});
    }
});