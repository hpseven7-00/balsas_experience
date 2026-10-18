import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
// O adaptador é quem conversa com o PostgreSQL. Da versão 7 em diante ele é obrigatório
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
// Uma instância para o processo inteiro: cada PrismaClient abre um pool de conexões
export const prisma = new PrismaClient({ adapter });
