import * as dotenv from "dotenv";
import express from "express";
import { notFoundHandler } from "./middleware/not-found.middleware";
import { errorHandler } from "./middleware/error.middleware";
import { routes } from "./features/routes";
import xmlparser from "express-xml-bodyparser";
import cors from "cors";

dotenv.config();

if (!process.env.PORT) {
  throw new Error("Missing required environment variables");
}

const PORT = parseInt(process.env.PORT, 10);
const app = express();

app.use(express.json());
app.use(xmlparser({explicitArray: false, explicitRoot: false}))

//queremos que cada solicitação passe pelo CORS, então ele é aplicado antes das rotas!
app.use(cors());

// register routes
app.use("/", routes); //chama o roteador ANTES do middleware
//As requisições PRIMEIRO vao passar pelas rotas e se corresponder a uma rota dentro de routes ela sera processada imediatamente

// register middleware
app.use(express.static("public")); //vai servir arquivos estaticos
app.use(errorHandler); // e os dois aqui sao middlewares de erro, caso as rotas capturem erros
app.use(notFoundHandler);
//mas ai chega a pergunta: Se as rotas ja sao chamadas antes e vao ser enviadas em seus devidos lugares, esses middlewares de erro sao necessarios?
// Fui pesquisar mais afundo e é exatamente esse o proposito, de deixar eles depois para notificar algo indesejado(erros)
//essa ideia de middleware ainda ta muito abstrata, vou seguir o video, caso nao entenda muito bem, vou manter esse comentario assim

// start server
app.listen(PORT, () =>
  console.log(`Server ready at: http://localhost:${PORT}`)
);
