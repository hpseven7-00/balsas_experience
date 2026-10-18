# Balsas Experience API

API REST de atrações turísticas de Balsas-MA. O serviço permite consultar e filtrar atrações, criar e atualizar registros, registrar avaliações e consultar categorias com a quantidade de atrações. Os dados são persistidos em PostgreSQL e acessados pelo Prisma ORM.

## Equipe

| Integrante | Matrícula | Contribuição |
| --- | --- | --- |
| Hágape Latan | A informar | A informar |
| Demais integrantes | A informar ou remover se não houver | A informar |

Complete a tabela com os nomes completos e as contribuições de toda a equipe antes da entrega.

## Tecnologias

| Tecnologia | Versão declarada | Uso |
| --- | --- | --- |
| Node.js | 22 ou superior | Execução do servidor JavaScript |
| Express | ^5.2.1 | Rotas HTTP e middleware |
| Prisma CLI | 7.10.0 | Schema e migrações |
| Prisma Client | 7.10.0 | Consultas ao banco no código Node.js |
| Prisma PostgreSQL adapter | 7.10.0 | Conexão do Prisma com PostgreSQL pelo driver `pg` |
| PostgreSQL | 15 ou superior recomendado | Persistência relacional |
| `pg` | ^8.16.3 | Driver PostgreSQL |
| `dotenv` | ^17.2.3 | Carregamento de variáveis de ambiente locais |

## Pré-requisitos

- Node.js 22 ou superior e npm.
- Um banco PostgreSQL acessível, por exemplo, um projeto Neon.
- Git.

## Instalação e execução

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/hpseven7-00/balsas_experience.git
cd balsas_experience
npm ci
```

Crie um arquivo `.env` na raiz e configure a URL do banco. Use a connection string do seu próprio banco; nunca publique a senha:

```dotenv
DATABASE_URL="postgresql://USUARIO:SENHA@HOST/neondb?sslmode=require"
```

O arquivo `.env.example` contém somente um modelo sem credenciais. O `.env` real está excluído pelo `.gitignore`.

Aplique as migrações versionadas e gere o Prisma Client:

```bash
npm run build
```

Para carregar os dados de demonstração e iniciar o servidor em modo de desenvolvimento:

```bash
npm run seed
npm run dev
```

A API fica disponível em `http://localhost:3000`. O comando `npm run seed` apaga e recria os dados das tabelas; use-o somente em um banco de desenvolvimento vazio ou descartável. Para iniciar sem reinicialização automática, execute `npm start`.

## Modelo de dados

- **Categoria**: `id`, `nome` (único); uma categoria pode classificar várias atrações.
- **Atracao**: `id`, `nome`, `descricao`, `cidade`, `estado`, `distanciaCentroKm` (opcional), `criadaEm`, `categoriaId`; relaciona-se com uma categoria, várias tags e várias avaliações.
- **Tag**: `id`, `nome` (único); pode estar associada a várias atrações.
- **Avaliacao**: `id`, `visitante`, `nota`, `comentario` (opcional), `criadaEm`, `atracaoId`; pertence a uma atração e é removida junto com ela.

Tags ficam em uma tabela separada porque uma atração pode ter várias tags e a mesma tag pode ser usada por várias atrações; uma tabela de ligação representa essa relação muitos-para-muitos sem duplicar texto em arrays.

## Endpoints

| Método | Caminho | O que faz | Respostas esperadas |
| --- | --- | --- | --- |
| `GET` | `/` | Identifica a API | `200` |
| `GET` | `/health` | Verifica se a aplicação está ativa | `200` |
| `GET` | `/atracoes` | Lista atrações; aceita `categoria`, `tag` e `q` | `200` |
| `GET` | `/atracoes/:id` | Busca atração, relações, avaliações e resumo das notas | `200`, `404` |
| `POST` | `/atracoes` | Cria atração | `201`, `400` |
| `PUT` | `/atracoes/:id` | Substitui atração e relações | `200`, `400`, `404` |
| `DELETE` | `/atracoes/:id` | Remove atração e avaliações relacionadas | `204`, `404` |
| `POST` | `/atracoes/:id/avaliacoes` | Registra avaliação com nota de 1 a 5 | `201`, `400`, `404` |
| `GET` | `/categorias` | Lista categorias com contagem de atrações | `200` |

Exemplo de criação:

```http
POST /atracoes
Content-Type: application/json
```

```json
{
  "nome": "Parque de Lazer",
  "descricao": "Espaço destinado ao lazer e à convivência.",
  "categoria": "Lazer",
  "cidade": "Balsas",
  "estado": "MA",
  "distanciaCentroKm": 3,
  "tags": ["lazer", "família", "parque"]
}
```

Exemplo de resposta (`201 Created`; os IDs são gerados pelo banco):

```json
{
  "id": 9,
  "nome": "Parque de Lazer",
  "descricao": "Espaço destinado ao lazer e à convivência.",
  "cidade": "Balsas",
  "estado": "MA",
  "distanciaCentroKm": 3,
  "criadaEm": "2026-10-17T12:00:00.000Z",
  "categoriaId": 2,
  "categoria": { "id": 2, "nome": "Lazer" },
  "tags": [
    { "id": 1, "nome": "lazer" },
    { "id": 2, "nome": "família" },
    { "id": 16, "nome": "parque" }
  ]
}
```

Outras requisições úteis:

```http
GET /atracoes?categoria=Natureza%20e%20Aventura&tag=cachoeira
GET /atracoes?q=rio
GET /atracoes/1
POST /atracoes/1/avaliacoes
Content-Type: application/json

{"visitante":"Hágape","nota":5,"comentario":"Ótima visita."}
```

## Publicação

Repositório: [github.com/hpseven7-00/balsas_experience](https://github.com/hpseven7-00/balsas_experience)

API publicada: **URL a informar**. Substitua este campo pelo endereço do serviço no Render antes da entrega.

No Render, configure `DATABASE_URL` como variável de ambiente, o comando de build como `npm install && npm run build` e o comando de inicialização como `npm start`. Não envie o `.env` para o repositório.