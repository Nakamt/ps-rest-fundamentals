import { PrismaClient } from "@prisma/client";
import { Item, ItemDTO, ItemDetail } from "../types";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import TTLCache from "@isaacs/ttlcache";

const prisma = new PrismaClient();

const options = { ttl: 1000 * 60 * 60 * 24}; //tempo q um item vive no cache (1000ms = 1s) e depois converte em 24hr
const cache = new TTLCache(options);//esse cache vai armazenar e expirar automaticamente os dados em 24hr
const listKey = "item-list";//chave para recuperar e armazenar dados cache

export function getItems(): Promise<Item[]> {

  const cacheItems = cache.get<Item[]>(listKey); //queremos pegar os dados no cache com a chave listKey
  if(cacheItems != undefined){ //se os dados forem ecnontrados no cache
    return Promise.resolve(cacheItems); //se achar retorna um promessa resolvida, ou seja, nao necessita ir atras no banco de dados dando uma resposta mais rapida
  }

  return prisma.item.findMany({ //aqui cmç à busca no banco de dados
    select: { //select vai filtrar os dados com apenas id e name
      id: true,
      name: true,
    },
  }).then((items)=>{ //se a busca no banco de dados for concluida com sucesso
    cache.set(listKey, items); //aqui salvamos os dados retornados do banco no cache
    return items; //Aqui retorna os itens na primeira busca, se nao encontrou nada no cache encontrou no banco de dados
  });
}//OBS: NAO CONSIGO DEBUGAR O CODIGO, NAO SEI O PQ E N SEI CORRIGIR

export function getItemDetail(itemId: number): Promise<ItemDetail | null> {
  const cacheItems = cache.get<ItemDetail>(itemId);//enquanto no outro [] armazena um array de item, aq vai armazenar UM item
  if(cacheItems != undefined){ 
    return Promise.resolve(cacheItems); 
  }

  return prisma.item.findFirst({
    where: { id: itemId },
  }).then((item)=>{
    cache.set(itemId, item);
    return item;//exercicio feito, so errei ali em cima colocando '[]'
  });
}

export function upsertItem(
  item: ItemDTO,
  itemId?: number | null
): Promise<Item | null> {
  return prisma.item.upsert({
    where: {
      id: itemId || -1,
    },
    update: {
      name: item.name,
      description: item.description,
    },
    create: {
      name: item.name,
      description: item.description,
    },
  }).then((item)=>{
    cache.set(item.id, item);//atualiza cache com item atualizado
    cache.delete(listKey);//deleta tudo q tinha antes, forçando uma autalização futura
    return item;//retorna item atualizado
  });
}

export function deleteItem(itemId: number): Promise<Item | null> {
  return prisma.item
    .delete({
      where: { id: itemId },
    })
    .catch((error) => {
      if (
        error instanceof PrismaClientKnownRequestError &&
        (error as PrismaClientKnownRequestError).code == "P2025"
      ) {
        return Promise.resolve(null);
      } else {
        throw error;
      }
    }).then((item)=>{
      if(item != null){ //so vamos fzr a limpeza do cache se um item realmente for deletado
        cache.delete(item.id);//remove item deletado
        cache.delete(listKey);//remove tudo para forçar atualização
      }
      return item;//retorna null, item deletado
    });
}
