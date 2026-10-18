import { prisma } from '../prisma.js';
// Toda listagem devolve a atração com a categoria e as tags já resolvidas
const COM_RELACOES = {
categoria: true,
tags: { orderBy: { nome: 'asc' } },
};
const dadosDaAtracao = ({
nome,
descricao,
categoria,
cidade,
estado,
distanciaCentroKm,
tags,
}) => ({
nome,
descricao,
cidade: cidade ?? 'Balsas',
estado: estado ?? 'MA',
distanciaCentroKm: distanciaCentroKm ?? null,
categoria: {
connectOrCreate: { where: { nome: categoria }, create: { nome: categoria } },
},
tags: {
connectOrCreate: (tags ?? []).map((tag) => ({
where: { nome: tag },
create: { nome: tag },
})),
},
});
export async function listar(req, res) {
const { categoria, tag, q } = req.query;
const atracoes = await prisma.atracao.findMany({
where: {
categoria: categoria ? { nome: { equals: categoria, mode: 'insensitive' } } : undefined,
tags: tag ? { some: { nome: { equals: tag, mode: 'insensitive' } } } : undefined,
OR: q
? [
{ nome: { contains: q, mode: 'insensitive' } },
{ descricao: { contains: q, mode: 'insensitive' } },
]
: undefined,
},
include: COM_RELACOES,
orderBy: { nome: 'asc' },
});
res.json(atracoes);
}
export async function buscarPorId(req, res) {
const atracao = await prisma.atracao.findUnique({
where: { id: Number(req.params.id) },
include: { ...COM_RELACOES, avaliacoes: { orderBy: { criadaEm: 'desc' } } },
});
if (!atracao) {
return res.status(404).json({ erro: 'Atração não encontrada' });
}
const resumo = await prisma.avaliacao.aggregate({
where: { atracaoId: atracao.id },
_avg: { nota: true },
_count: true,
});
res.json({ ...atracao, notaMedia: resumo._avg.nota, totalAvaliacoes: resumo._count });
}
export async function criar(req, res) {
const { nome, descricao, categoria } = req.body ?? {};
if (!nome || !descricao || !categoria) {
return res.status(400).json({
erro: 'Os campos nome, descricao e categoria são obrigatórios',
});
}
const nova = await prisma.atracao.create({
data: dadosDaAtracao(req.body),
include: COM_RELACOES,
});
res.status(201).location(`/atracoes/${nova.id}`).json(nova);
}
export async function atualizar(req, res) {
const { nome, descricao, categoria } = req.body ?? {};
if (!nome || !descricao || !categoria) {
return res.status(400).json({
erro: 'Os campos nome, descricao e categoria são obrigatórios',
});
}
const dados = dadosDaAtracao(req.body);
try {
const atualizada = await prisma.atracao.update({
where: { id: Number(req.params.id) },
// set: [] desliga todas as tags atuais antes de ligar as novas
data: { ...dados, tags: { set: [], connectOrCreate: dados.tags.connectOrCreate } },
include: COM_RELACOES,
});
res.json(atualizada);
} catch (erro) {
if (erro.code === 'P2025') {
return res.status(404).json({ erro: 'Atração não encontrada' });
}
throw erro;
}
}
export async function remover(req, res) {
try {
await prisma.atracao.delete({ where: { id: Number(req.params.id) } });
res.status(204).end();
} catch (erro) {
if (erro.code === 'P2025') {
return res.status(404).json({ erro: 'Atração não encontrada' });
}
throw erro;
}
}
export async function avaliar(req, res) {
const atracaoId = Number(req.params.id);
const { visitante, nota, comentario } = req.body ?? {};
if (!visitante || !Number.isInteger(nota) || nota < 1 || nota > 5) {
return res.status(400).json({
erro: 'Informe o visitante e uma nota inteira de 1 a 5',
});
}
try {
const avaliacao = await prisma.avaliacao.create({
data: {
visitante,
nota,
comentario: comentario ?? null,
atracao: { connect: { id: atracaoId } },
},
});
res.status(201).location(`/atracoes/${atracaoId}`).json(avaliacao);
} catch (erro) {
if (erro.code === 'P2025') {
return res.status(404).json({ erro: 'Atração não encontrada' });
}
throw erro;
}
}
