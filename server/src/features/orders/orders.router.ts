import express from "express";
import { getOrderDetail, getOrders } from "./orders.service";
import { idUUIDRequestSchema, pagingRequestSchema } from "../types";
import { validate } from "../../middleware/validation.middleware";

export const ordersRouter = express.Router();
//o codigo segue o mesmo padrao do itens, so q com UUID, e algumas alterações
ordersRouter.get("/", validate(pagingRequestSchema), async(req,res)=>{
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

ordersRouter.get("/:id",validate(idUUIDRequestSchema) ,async(req,res)=>{
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