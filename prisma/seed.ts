import {
  NivelCurso,
  PrismaClient,
  Role,
  StatusCurso,
  StatusTransacao,
  StatusUsuario,
  TipoAcesso,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const DEMO_PASSWORD = '123456';

const demoCourseSlugs = [
  'demo-calculo-estrutural',
  'demo-fenomenos-transporte',
  'demo-resistencia-rascunho',
];

const demoPaymentIds = [
  'demo-mp-payment-approved-001',
  'demo-mp-payment-pending-001',
  'demo-mp-payment-refused-001',
];

async function upsertDemoUser({
  nome,
  email,
  role,
  xpTotal = 0,
  nivel = 1,
  streak = 0,
  hasActiveSub = false,
}: {
  nome: string;
  email: string;
  role: Role;
  xpTotal?: number;
  nivel?: number;
  streak?: number;
  hasActiveSub?: boolean;
}) {
  const senha = await bcrypt.hash(DEMO_PASSWORD, 10);

  return prisma.user.upsert({
    where: {
      email,
    },
    update: {
      nome,
      senha,
      role,
      status: StatusUsuario.ATIVO,
      xpTotal,
      nivel,
      streak,
      hasActiveSub,
      subExpiresAt: hasActiveSub
        ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
        : null,
    },
    create: {
      nome,
      email,
      senha,
      role,
      status: StatusUsuario.ATIVO,
      xpTotal,
      nivel,
      streak,
      hasActiveSub,
      subExpiresAt: hasActiveSub
        ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
        : null,
    },
  });
}

async function resetDemoContent() {
  await prisma.transacao.deleteMany({
    where: {
      mpPaymentId: {
        in: demoPaymentIds,
      },
    },
  });

  await prisma.curso.deleteMany({
    where: {
      slug: {
        in: demoCourseSlugs,
      },
    },
  });
}

async function createDemoCourses(professorId: string) {
  const freeCourse = await prisma.curso.create({
    data: {
      titulo: 'Demo: Calculo Estrutural Aplicado',
      slug: 'demo-calculo-estrutural',
      descricao:
        'Curso gratuito para validar vitrine, detalhes do curso, aulas abertas e progresso do aluno.',
      resumo:
        'Uma trilha visual para revisar calculo aplicado a problemas estruturais.',
      categoria: 'Estruturas',
      nivel: NivelCurso.INICIANTE,
      cargaHoraria: 24,
      isPremium: false,
      preco: null,
      publico: true,
      status: StatusCurso.PUBLICADO,
      criadoPorId: professorId,
      modulos: {
        create: [
          {
            titulo: 'Base matematica para estruturas',
            descricao:
              'Revisao objetiva de funcoes, derivadas e interpretacao grafica.',
            ordem: 1,
            aulas: {
              create: [
                {
                  titulo: 'Derivadas na leitura de diagramas',
                  slug: 'derivadas-na-leitura-de-diagramas',
                  descricao:
                    'Como derivadas ajudam a interpretar variacao de esforcos internos.',
                  conteudo:
                    'Nesta aula, observe como a inclinacao de uma curva se conecta com taxa de variacao. Em engenharia, esse raciocinio aparece em diagramas, modelos fisicos e verificacoes de comportamento estrutural.',
                  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  ordem: 1,
                  duracao: 12,
                  isGratuita: true,
                  anexos: {
                    create: [
                      {
                        nome: 'Resumo de derivadas aplicadas.pdf',
                        url: '/uploads/demo/resumo-derivadas.pdf',
                        tipo: 'application/pdf',
                        tamanho: 245000,
                      },
                    ],
                  },
                  exercicios: {
                    create: [
                      {
                        titulo: 'Identificacao de taxa de variacao',
                        enunciado:
                          'Explique como a inclinacao de uma curva pode indicar crescimento ou reducao de uma grandeza fisica.',
                        resolucao:
                          'A inclinacao representa a taxa de variacao local. Valores positivos indicam crescimento, negativos indicam reducao.',
                        dificuldade: 'INICIANTE',
                        xpRecompensa: 10,
                      },
                    ],
                  },
                },
                {
                  titulo: 'Integrais como acumulacao',
                  slug: 'integrais-como-acumulacao',
                  descricao:
                    'Uma leitura pratica de integrais como acumulacao de efeitos distribuidos.',
                  conteudo:
                    'Integrais aparecem quando precisamos transformar uma distribuicao em efeito total. Pense em cargas distribuidas, areas sob curvas e grandezas acumuladas ao longo de um elemento.',
                  videoUrl: 'https://www.youtube.com/watch?v=9vKqVkMQHKk',
                  ordem: 2,
                  duracao: 16,
                  isGratuita: true,
                  exercicios: {
                    create: [
                      {
                        titulo: 'Carga distribuida equivalente',
                        enunciado:
                          'Descreva por que a area sob uma carga distribuida pode representar uma forca resultante.',
                        resolucao:
                          'A area soma pequenas parcelas de carga ao longo do comprimento, resultando na forca total equivalente.',
                        dificuldade: 'INICIANTE',
                        xpRecompensa: 12,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            titulo: 'Modelagem de problemas',
            descricao:
              'Como sair do enunciado e chegar em um modelo verificavel.',
            ordem: 2,
            aulas: {
              create: [
                {
                  titulo: 'Hipoteses e simplificacoes',
                  slug: 'hipoteses-e-simplificacoes',
                  descricao:
                    'O papel das hipoteses no modelo de engenharia.',
                  conteudo:
                    'Toda solucao tecnica nasce de hipoteses. O importante e declarar limites, entender consequencias e validar se o modelo ainda representa o fenomeno de interesse.',
                  videoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
                  ordem: 1,
                  duracao: 10,
                  isGratuita: true,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const premiumCourse = await prisma.curso.create({
    data: {
      titulo: 'Demo: Fenomenos de Transporte Premium',
      slug: 'demo-fenomenos-transporte',
      descricao:
        'Curso premium para validar acesso pago, aula gratuita de degustacao e player com videos incorporados.',
      resumo:
        'Calor, fluidos e transporte de massa com foco em raciocinio aplicado.',
      categoria: 'Fundamentos',
      nivel: NivelCurso.INTERMEDIARIO,
      cargaHoraria: 36,
      isPremium: true,
      preco: 79.9,
      publico: true,
      status: StatusCurso.PUBLICADO,
      criadoPorId: professorId,
      modulos: {
        create: [
          {
            titulo: 'Transferencia de calor',
            descricao:
              'Conducao, conveccao e radiacao vistas como mecanismos fisicos.',
            ordem: 1,
            aulas: {
              create: [
                {
                  titulo: 'Conducao e Lei de Fourier',
                  slug: 'conducao-e-lei-de-fourier',
                  descricao:
                    'Introducao visual ao fluxo de calor por conducao.',
                  conteudo:
                    'A Lei de Fourier conecta gradiente de temperatura, condutividade e fluxo de calor. Use esta aula para validar o player e o texto de apoio em curso premium.',
                  videoUrl: 'https://www.youtube.com/watch?v=aircAruvnKk',
                  ordem: 1,
                  duracao: 18,
                  isGratuita: true,
                  anexos: {
                    create: [
                      {
                        nome: 'Tabela de propriedades termicas.xlsx',
                        url: '/uploads/demo/propriedades-termicas.xlsx',
                        tipo: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        tamanho: 128000,
                      },
                    ],
                  },
                },
                {
                  titulo: 'Conveccao em superficies',
                  slug: 'conveccao-em-superficies',
                  descricao:
                    'Como interpretar coeficientes convectivos em problemas de engenharia.',
                  conteudo:
                    'A conveccao depende do movimento do fluido, geometria e propriedades. Esta aula premium ajuda a validar bloqueios futuros e organizacao de conteudo.',
                  videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
                  ordem: 2,
                  duracao: 22,
                  isGratuita: false,
                  exercicios: {
                    create: [
                      {
                        titulo: 'Interpretacao do coeficiente convectivo',
                        enunciado:
                          'Por que o coeficiente convectivo nao e uma propriedade pura do material?',
                        resolucao:
                          'Porque depende tambem do escoamento, geometria, regime e condicoes de contorno.',
                        dificuldade: 'INTERMEDIARIO',
                        xpRecompensa: 18,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            titulo: 'Escoamento de fluidos',
            descricao:
              'Conceitos iniciais para continuidade, energia e perdas.',
            ordem: 2,
            aulas: {
              create: [
                {
                  titulo: 'Equacao da continuidade',
                  slug: 'equacao-da-continuidade',
                  descricao:
                    'Conservacao de massa aplicada a escoamentos simples.',
                  conteudo:
                    'A continuidade traduz conservacao de massa. Em regime permanente, a vazao que entra deve ser compatibilizada com a vazao que sai.',
                  videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
                  ordem: 1,
                  duracao: 14,
                  isGratuita: false,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const draftCourse = await prisma.curso.create({
    data: {
      titulo: 'Demo: Resistencia dos Materiais em Rascunho',
      slug: 'demo-resistencia-rascunho',
      descricao:
        'Curso em rascunho para validar a area do professor sem aparecer na vitrine publica.',
      resumo:
        'Conteudo de teste para fluxo de criacao e edicao antes da publicacao.',
      categoria: 'Estruturas',
      nivel: NivelCurso.AVANCADO,
      cargaHoraria: 42,
      isPremium: true,
      preco: 99.9,
      publico: false,
      status: StatusCurso.RASCUNHO,
      criadoPorId: professorId,
      modulos: {
        create: [
          {
            titulo: 'Tensoes e deformacoes',
            descricao:
              'Modulo de rascunho para validar ordenacao e edicao.',
            ordem: 1,
            aulas: {
              create: [
                {
                  titulo: 'Tensao normal e area resistente',
                  slug: 'tensao-normal-e-area-resistente',
                  descricao:
                    'Aula de rascunho com video para validacao interna.',
                  conteudo:
                    'Use esta aula para testar a area do professor e revisar como o conteudo fica antes de publicar.',
                  videoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
                  ordem: 1,
                  duracao: 20,
                  isGratuita: false,
                },
              ],
            },
          },
        ],
      },
    },
  });

  return {
    freeCourse,
    premiumCourse,
    draftCourse,
  };
}

async function createStudentDemoData({
  alunoId,
  courseId,
}: {
  alunoId: string;
  courseId: string;
}) {
  await prisma.matricula.upsert({
    where: {
      userId_cursoId: {
        userId: alunoId,
        cursoId: courseId,
      },
    },
    update: {
      tipoAcesso: TipoAcesso.GRATUITO,
      progresso: 35,
      concluido: false,
    },
    create: {
      userId: alunoId,
      cursoId: courseId,
      tipoAcesso: TipoAcesso.GRATUITO,
      progresso: 35,
      concluido: false,
    },
  });

  const lessons = await prisma.aula.findMany({
    where: {
      modulo: {
        cursoId: courseId,
      },
    },
    orderBy: [
      {
        modulo: {
          ordem: 'asc',
        },
      },
      {
        ordem: 'asc',
      },
    ],
    take: 2,
  });

  for (const [index, lesson] of lessons.entries()) {
    await prisma.progressoAula.upsert({
      where: {
        userId_aulaId: {
          userId: alunoId,
          aulaId: lesson.id,
        },
      },
      update: {
        concluida: index === 0,
        tempoAssistido: index === 0 ? 720 : 240,
        concluidaEm: index === 0 ? new Date() : null,
      },
      create: {
        userId: alunoId,
        aulaId: lesson.id,
        concluida: index === 0,
        tempoAssistido: index === 0 ? 720 : 240,
        concluidaEm: index === 0 ? new Date() : null,
      },
    });
  }

  const today = new Date();

  for (let index = 0; index < 7; index += 1) {
    const data = new Date(today);
    data.setDate(today.getDate() - index);

    await prisma.progressoDiario.upsert({
      where: {
        userId_data: {
          userId: alunoId,
          data,
        },
      },
      update: {
        xpGanho: 20 + index * 5,
        exercicios: index % 3,
        calculos: index % 2,
      },
      create: {
        userId: alunoId,
        data,
        xpGanho: 20 + index * 5,
        exercicios: index % 3,
        calculos: index % 2,
      },
    });
  }
}

async function createDemoTransactions(alunoId: string) {
  await prisma.transacao.createMany({
    data: [
      {
        userId: alunoId,
        mpPaymentId: 'demo-mp-payment-approved-001',
        valorTotal: 79.9,
        status: StatusTransacao.APROVADO,
        metodoPagamento: 'credit_card',
        referenciaCompra: 'demo-fenomenos-transporte',
        linkPagamento: 'https://www.mercadopago.com.br/',
      },
      {
        userId: alunoId,
        mpPaymentId: 'demo-mp-payment-pending-001',
        valorTotal: 99.9,
        status: StatusTransacao.PENDENTE,
        metodoPagamento: 'pix',
        referenciaCompra: 'demo-resistencia-rascunho',
        linkPagamento: 'https://www.mercadopago.com.br/',
      },
      {
        userId: alunoId,
        mpPaymentId: 'demo-mp-payment-refused-001',
        valorTotal: 49.9,
        status: StatusTransacao.RECUSADO,
        metodoPagamento: 'credit_card',
        referenciaCompra: 'demo-checkout-recusado',
        linkPagamento: null,
      },
    ],
  });
}

async function main() {
  await resetDemoContent();

  const [admin, professor, aluno] = await Promise.all([
    upsertDemoUser({
      nome: 'Admin ISOMETRICA',
      email: 'admin@isometrica.dev',
      role: Role.ADMIN,
      xpTotal: 1200,
      nivel: 8,
      streak: 12,
      hasActiveSub: true,
    }),
    upsertDemoUser({
      nome: 'Professor Demo',
      email: 'professor@isometrica.dev',
      role: Role.PROFESSOR,
      xpTotal: 640,
      nivel: 5,
      streak: 6,
      hasActiveSub: true,
    }),
    upsertDemoUser({
      nome: 'Aluno Demo',
      email: 'aluno@isometrica.dev',
      role: Role.ALUNO,
      xpTotal: 260,
      nivel: 3,
      streak: 4,
      hasActiveSub: false,
    }),
  ]);

  const courses = await createDemoCourses(professor.id);

  await createStudentDemoData({
    alunoId: aluno.id,
    courseId: courses.freeCourse.id,
  });

  await createDemoTransactions(aluno.id);

  console.log('Seed demo executado com sucesso.');
  console.table([
    {
      perfil: 'Admin',
      email: admin.email,
      senha: DEMO_PASSWORD,
    },
    {
      perfil: 'Professor',
      email: professor.email,
      senha: DEMO_PASSWORD,
    },
    {
      perfil: 'Aluno',
      email: aluno.email,
      senha: DEMO_PASSWORD,
    },
  ]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
