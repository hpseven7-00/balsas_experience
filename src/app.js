import express from 'express';
import atracoesRoutes from './routes/atracoes.routes.js';
import categoriasRoutes from './routes/categorias.routes.js';
const app = express();
const PORTA = process.env.PORT || 3000;
app.use(express.json());
app.get('/', (req, res) => {
res.json({
nome: 'Balsas Experience API',
versao: '2.0.0',
descricao: 'API de experiências turísticas em Balsas-MA, com PostgreSQL e Prisma',
});
});
app.get('/health', (req, res) => {
res.json({ status: 'ok' });
});
app.use('/atracoes', atracoesRoutes);
app.use('/categorias', categoriasRoutes);
// Qualquer caminho que não casou com as rotas acima
app.use((req, res) => {
res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
});
// Middleware de erro: quatro parâmetros, sempre por último
app.use((erro, req, res, next) => {
console.error(erro);
// P2002: violação de campo único, como duas categorias com o mesmo nome
if (erro.code === 'P2002') {
return res.status(409).json({ erro: `Já existe registro com esse ${erro.meta?.target}` });
}
const status = erro.status ?? 500;
const mensagem = status === 500 ? 'Erro interno no servidor' : 'Corpo da requisição inválido';
res.status(status).json({ erro: mensagem });
});
app.listen(PORTA, '0.0.0.0', () => {
console.log(`Servidor executando na porta ${PORTA}`);
});