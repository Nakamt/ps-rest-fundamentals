import express from "express";
import { getItemDetail, getItems } from "./items.service";
import { validate } from "../../middleware/validation.middleware";
import { idNumberRequestSchema } from "../types";

export const itemsRouter = express.Router(); //export pq vai ser importado para o routes.ts
//fazer funcao para listagem de itens retorna como json juntamente com suas imagens
// CTRL + Corrige a importação
itemsRouter.get("/", async (req, res) => { //quando alguem acessar -> blablabla/api/items/ -> o comando abaixo vai ser executado
  const items = await getItems(); // a função ela é assincrona (async), ela espera algo externo antes de continuar
  // esse await ele segue junto com esse async, ou seja, o getItems vai recolher os itens (e isso leva tempo), por isso await vai esperar a coleta antes de continuar
  items.forEach((item)=> { //"Para cada item da lista"
    item.imageUrl = buildImageUrl(req, item.id); // vamos ter uma imagem URL para cada um
  });
  res.json(items); //converte os itens como JSON na resposta
});
//agora fazer os detalhes dos itens
itemsRouter.get("/:id",validate(idNumberRequestSchema) ,async (req, res)=>{ //':' significa que agr vm mexer URL
  // //a ideia agr e ler o id do item, ou seja /api/items/id
  // const id = parseInt(req.params.id); //como URL e lido como string: parseInt() e tipo um int() no C
  // //req.params.id serve para a gnt achar o id de certa coisa, é como se fosse um [i] dentro do for no C 
  // const item = await getItemDetail(id); //mesma ideia, espera a lista dos ItemDetail e quando coletar continua
  
  const data = idNumberRequestSchema.parse(req); //existe uma fucking funcao q se chama idItemIdUUIDRequestSchema, qria colocar ela, mas vou seguir o basico
  const item = await getItemDetail(data.params.id)
  if(item != null){ //se existir o item
    item.imageUrl = buildImageUrl(req, item.id); //adiciona a imagem em URL
    res.json(item); //converte os itens como JSON na resposta
  }else{
    res.status(404).json({message: "Item nao encontrado!"});  //caso nao existe (null), erro 404
  }
}); 


//isso aq eu n sei, mas perguntei para o chat, mas ela gera a URL da imagem para um item com base no seu ID., n entendi direto o return mas e isso q ela faz
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
function buildImageUrl(req: any, id: number): string {
  return `${req.protocol}://${req.get("host")}/images/${id}.jpg`;
}
