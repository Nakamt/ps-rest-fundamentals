import express from "express";
import { deleteItem, getItemDetail, getItems, upsertItem } from "./items.service";
import { validate } from "../../middleware/validation.middleware";
import { idNumberRequestSchema, itemPOSTRequestSchema, itemPUTRequestSchema } from "../types";
import { create } from "xmlbuilder2";
import { checkRequiredScope, validateAccessToken } from "../../middleware/auth0middleware";
import { ItemsPermissions, SecurityPermissions } from "../../config/permissions";

export const itemsRouter = express.Router(); //export pq vai ser importado para o routes.ts
//fazer funcao para listagem de itens retorna como json juntamente com suas imagens
// CTRL + Corrige a importação
itemsRouter.get("/", async (req, res) => { //quando alguem acessar -> blablabla/api/items/ -> o comando abaixo vai ser executado
  const items = await getItems(); // a função ela é assincrona (async), ela espera algo externo antes de continuar
  // esse await ele segue junto com esse async, ou seja, o getItems vai recolher os itens (e isso leva tempo), por isso await vai esperar a coleta antes de continuar
  items.forEach((item)=> { //"Para cada item da lista"
    item.imageUrl = buildImageUrl(req, item.id); // vamos ter uma imagem URL para cada um
  })

  if (req.headers["accept"] == "application/xml"){ //tem q ser em XML? se sim: if se nao: JSON
    const root = create().ele("items"); //create cria um novo doc XML e .ele(items) add um no raiz chamado items
    items.forEach((i)=>{ //percorre a lista de items adicionando cada um ao XML (i) e igual ao for[i] em C
      root.ele("item", i); //para cada item na lista cria-se um prefixo <item>
    });
    res.status(200).send(root.end({prettyPrint: true})); //.end({ prettyPrint: true }) finaliza o XML formatado de forma bonita
  }else{
    res.json(items); //converte os itens como JSON na resposta
  }

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

    if (req.headers["accept"] == "application/xml"){ 
      res.status(200).send(create().ele("item", item).end()); //cria doc XML + cria nó <item> e insere os dados do item
      //ESQUECI UM ()DEPOIS DO END E CRASHOU O SERVER
    }else{
      res.json(item); 
    }

  }else{

    if (req.headers["accept"] == "application/xml"){ 
      res.status(404).send(create().ele("error", {message: "Item nao encontrado!"}).end()); 
      //cria doc XML + cria nó <error> e insere a mensagem
    }else{
      
      res.status(404).json({message: "Item nao encontrado!"});  //caso nao existe (null), erro 404
    }
    
  }
}); 

itemsRouter.post("/", validateAccessToken, checkRequiredScope(ItemsPermissions.Create) ,validate(itemPOSTRequestSchema), async(req,res)=>{
  const data = itemPOSTRequestSchema.parse(req); //verifica se foi passado adequadamente o corpo estrutura
  const item = await upsertItem(data.body); //insere o novo item
  if(item != null){
    res.status(201).json(item); //deu certo = 201
  }else{
    res.status(500).json({message: "Criacao de entidade falhou!"}); //errou = 500 falha
  } //exercicios feitos facilmente, 
});

//agora vamos fazer um Delete, q e semelhante ao GET
itemsRouter.delete("/:id", validateAccessToken, checkRequiredScope(SecurityPermissions.Deny),validate(idNumberRequestSchema), async(req, res)=>{
  const data = idNumberRequestSchema.parse(req);
  const item = await deleteItem(data.params.id);
  if(item != null){
    res.json(item); //aqui poderia colocar um 204 ou um 200 fld q foi um sucesso excluir, mas como n sei o proceder do curso, vou deixar assim! WORD 
  }else{
    res.status(404).json({message: "Item nao encontrado"});
  }
});

//put e path e BEM distinto de get e post
itemsRouter.put("/:id", validateAccessToken,checkRequiredScope(ItemsPermissions.Write) ,validate(itemPUTRequestSchema), async(req, res)=>{
  const data = itemPUTRequestSchema.parse(req);
  const item = await upsertItem(data.body, data.params.id);
  if(item != null){
    res.json(item);
  }else{
    res.status(404).json({message: "Item nao encontrado!"});
  }
}); //ainda n sei o pq nao utiliza ali em cima o /:id, mas ok, se ele usou so / deve ser utilizado ent so /

//isso aq eu n sei, mas perguntei para o chat, mas ela gera a URL da imagem para um item com base no seu ID., n entendi direto o return mas e isso q ela faz
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
function buildImageUrl(req: any, id: number): string {
  return `${req.protocol}://${req.get("host")}/images/${id}.jpg`;
}
