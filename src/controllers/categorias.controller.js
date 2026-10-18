import { prisma } from '../prisma.js';
export async function listarCategorias(req, res) {
const categorias = await prisma.categoria.findMany({
include: { _count: { select: { atracoes: true } } },
orderBy: { nome: 'asc' },
});
res.json(categorias.map(({ id, nome, _count }) => ({ id, nome, atracoes: _count.atracoes })));
}
