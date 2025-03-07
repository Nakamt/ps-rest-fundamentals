import { NextFunction, Request, Response } from "express";
import { InsufficientScopeError, InvalidTokenError, UnauthorizedError } from "express-oauth2-jwt-bearer";

export const errorHandler = (
  error: Error,
  request: Request,
  response: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
//atualizando erro para escopos
  if(error instanceof InsufficientScopeError){ //se o token nao inclui o escopo necessario
    const message = "Permissao negada";
    response.status(error.status).json({message}); 
    return;
  }

//atualizando erro para tokens invalidos/nao autorizados
if(error instanceof InvalidTokenError){ //se o token for invalido
  const message = "Credenciais ruins";
  response.status(error.status).json({message}); //essa aq n entendi, n sei direito qual status q vai colocar caso de esse erro
  return;//duvida anterior sanada
}

if(error instanceof UnauthorizedError){ //se o token nao tem permissao para acessar recurso desejado
  const message = "Necessita autorizacao";
  response.status(error.status).json({message}); 
  return;
}

  const status = 500;//se nao for erro de token, erro do servidor F
  const message = "Internal Server Error";

  response.status(status).json({ message });
};
