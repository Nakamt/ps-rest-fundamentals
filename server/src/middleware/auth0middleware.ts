import * as dotenv from "dotenv" //importa todo modulo dontev
import { auth, requiredScopes } from "express-oauth2-jwt-bearer";

dotenv.config();//Configura o dotenv para
//  carregar as variáveis de ambiente de um arquivo .env

export const validateAccessToken = auth({
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`, //vai constrir a URL como blabla.seu-dominio.auth0.com
  audience: process.env.AUTH0_AUDIENCE, //vai identificar o recurso q o token quer acessar "audiencia"
});//aqui ele vai validar tokens em cada requisição

export const checkRequiredScope = (requiredScope: string) => requiredScopes(requiredScope);
//isso aqui vai checar se um token inclui um escopo especifico tipo read:customers-single
