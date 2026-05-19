import { PrismaClient, NivelCurso } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  await prisma.curso.upsert({
    where: {
      slug: 'resistencia-dos-materiais',
    },
    update: {},
    create: {
      titulo: 'Resistência dos Materiais',
      slug: 'resistencia-dos-materiais',
      descricao:
        'Estude tensões, deformações, esforços internos, diagramas e critérios fundamentais para análise estrutural.',
      resumo:
        'Da tensão normal ao momento fletor: uma trilha para entender o comportamento dos elementos estruturais.',
      categoria: 'Estruturas',
      nivel: NivelCurso.INTERMEDIARIO,
      cargaHoraria: 40,
      isPremium: false,
      preco: null,
      modulos: {
        create: [
          {
            titulo: 'Fundamentos de tensão e deformação',
            descricao:
              'Base conceitual para compreender o comportamento mecânico dos materiais.',
            ordem: 1,
            aulas: {
              create: [
                {
                  titulo: 'O que é tensão normal?',
                  slug: 'o-que-e-tensao-normal',
                  descricao:
                    'Entenda a relação entre força axial, área e tensão normal.',
                  ordem: 1,
                  duracao: 18,
                  isGratuita: true,
                },
                {
                  titulo: 'Deformação específica',
                  slug: 'deformacao-especifica',
                  descricao:
                    'Como medir a variação relativa de comprimento em elementos estruturais.',
                  ordem: 2,
                  duracao: 22,
                  isGratuita: true,
                },
              ],
            },
          },
          {
            titulo: 'Diagramas de esforços internos',
            descricao:
              'Construção e interpretação de diagramas de força cortante e momento fletor.',
            ordem: 2,
            aulas: {
              create: [
                {
                  titulo: 'Introdução ao esforço cortante',
                  slug: 'introducao-ao-esforco-cortante',
                  descricao:
                    'Compreenda a origem e o comportamento da força cortante em vigas.',
                  ordem: 1,
                  duracao: 25,
                  isGratuita: true,
                },
                {
                  titulo: 'Momento fletor em vigas',
                  slug: 'momento-fletor-em-vigas',
                  descricao:
                    'Conceitos essenciais para interpretar e calcular momento fletor.',
                  ordem: 2,
                  duracao: 30,
                  isGratuita: false,
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.curso.upsert({
    where: {
      slug: 'fenomenos-de-transporte',
    },
    update: {},
    create: {
      titulo: 'Fenômenos de Transporte',
      slug: 'fenomenos-de-transporte',
      descricao:
        'Aprenda fundamentos de condução, convecção, radiação, escoamento e propriedades dos fluidos.',
      resumo:
        'Uma trilha clara para dominar transporte de calor, quantidade de movimento e massa.',
      categoria: 'Fundamentos',
      nivel: NivelCurso.INTERMEDIARIO,
      cargaHoraria: 36,
      isPremium: true,
      preco: 49.9,
      modulos: {
        create: [
          {
            titulo: 'Transferência de calor',
            descricao:
              'Fundamentos de condução, convecção e radiação aplicados à engenharia.',
            ordem: 1,
            aulas: {
              create: [
                {
                  titulo: 'Condução de calor',
                  slug: 'conducao-de-calor',
                  descricao:
                    'Entenda o fluxo de calor por condução e a Lei de Fourier.',
                  ordem: 1,
                  duracao: 28,
                  isGratuita: true,
                },
                {
                  titulo: 'Convecção térmica',
                  slug: 'conveccao-termica',
                  descricao:
                    'Introdução aos mecanismos de troca térmica por convecção.',
                  ordem: 2,
                  duracao: 26,
                  isGratuita: false,
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.curso.upsert({
    where: {
      slug: 'calculo-diferencial',
    },
    update: {},
    create: {
      titulo: 'Cálculo Diferencial',
      slug: 'calculo-diferencial',
      descricao:
        'Construa base em limites, derivadas, taxas de variação e aplicações essenciais em engenharia.',
      resumo:
        'Aprenda cálculo com foco no raciocínio que o estudante realmente precisa para avançar.',
      categoria: 'Matemática',
      nivel: NivelCurso.INICIANTE,
      cargaHoraria: 32,
      isPremium: false,
      preco: null,
      modulos: {
        create: [
          {
            titulo: 'Limites e continuidade',
            descricao:
              'Fundamentos para compreender comportamento local de funções.',
            ordem: 1,
            aulas: {
              create: [
                {
                  titulo: 'Ideia intuitiva de limite',
                  slug: 'ideia-intuitiva-de-limite',
                  descricao:
                    'Uma explicação visual e direta sobre o conceito de limite.',
                  ordem: 1,
                  duracao: 20,
                  isGratuita: true,
                },
              ],
            },
          },
        ],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed executado com sucesso.');
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });