import { NextFunction, Request, Response } from "express";
import { create } from "xmlbuilder2";
import { AnyZodObject } from "zod";

export const validate = 
 (schema: AnyZodObject) =>  //a funcao validade vai receber um schema(funcao no ZOD que define regras de validaçãp)
 async (req: Request, res: Response, next: NextFunction) =>{// vai retornar uma funcao assincrona e a ideia e que 
 // cada requisicao que chegar o middleware vai validar os dados usando o schema
    const result = await schema.safeParseAsync({
        body: req.body, //valida o corpo da requisicao
        query: req.query,//valida parametros de consulta (?take=10&skip=5)
        params: req.params//valida parametros de rota (/:id)
    });//result vai ser true ou false, deu tudo certo ou deu errado algo (contendo detalhes)

    if(result.success){ //se for um sucesso entao proximo
        return next();
    }else{ //caso de erro
        if(req.headers["accept"] == "application/xml"){
            const root = create().ele("errors", {message: "Erro na validacao"});
            result.error.issues.forEach((issue)=>{ //para cada erro encontrado pelo ZOD
              root.ele("error", { //vai ter o prefixo error e indicar onde ocorreu
                path: issue.path.join(": "), // indica onde ocorreu o erro (body: name)
                message: issue.message, //Especifica o erro (name e obrigatorio)
              });
            });
            return res.status(400).send(root.end({prettyPrint: true}));
            } else{
                return res.status(400).json({message: "Validação falhou", //400 indica q o cliente forneceu dados invalidos
                    details: result.error.issues.map((issue) =>{ //result.error.issues.map = lista de erros q o ZOD encontrou
                        return{
                            path: issue.path.join(": "),//tipo se for o body q ta errado vai retornar algo (body: blablabla)
                            message: issue.message, //aqui e onde especifica o erro "body must be a string"
                         
                    };
                }),
            });
        }
    }
};