import { NextFunction, Request, Response } from "express";
//NOTFOUNDHANDLER usada depois de TODAS rotas serem processadas, pra caso de erro ela dizer que o recurso da requisição nao existe
export const notFoundHandler = ( //ele disse que todos os parametros das funções que nao produzem erro possui esses tres elementos
  //corrindo* De fato e vdd,pois o 'erro 404' nao e de fato um erro que nem os 500, isso aq ta mas pra um middleware final
  request: Request,
  response: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction //essa next meio que manda a requisição para outro filtro(middleware)
  //se nao tivesse ele o express nao ia entender que ele e um middleware de 'pode passar adiante'
  //ele tbm n e usado, pois esse middleware e a ultima carta na manga, ent depois q a requisição passar nele nao tem mais p ond ir
) => {
  const message = "Resource Not Found";

  response.status(404).json({ message });
};
