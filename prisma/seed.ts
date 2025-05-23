import { PlanType, PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Cria o plano gratuito
  const freePlan = await prisma.plan.create({
    data: {
      type: PlanType.FREE,
      name: 'Plano Gratuito',
      description: 'Plano gratuito com funcionalidades básicas',
      price: 0,
      features: ['ACTIONS', 'COLLABORATORS'],
      limits: {
        create: [
          {
            feature: 'ACTIONS',
            limit: 30,
          },
          {
            feature: 'COLLABORATORS',
            limit: 3,
          },
        ],
      },
    },
  });

  // Cria o plano pago
  const paidPlan = await prisma.plan.create({
    data: {
      type: PlanType.PAID,
      name: 'Plano Premium',
      description: 'Plano premium com todas as funcionalidades',
      price: 99.90,
      features: ['ACTIONS', 'COLLABORATORS', 'MANAGERS', 'AI_SUGGESTIONS'],
      limits: {
        create: [
          {
            feature: 'ACTIONS',
            limit: 1000,
          },
          {
            feature: 'COLLABORATORS',
            limit: 50,
          },
          {
            feature: 'MANAGERS',
            limit: 10,
          },
          {
            feature: 'AI_SUGGESTIONS',
            limit: 1000,
          },
        ],
      },
    },
  });

  // Cria o usuário admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@weedu.com',
      password: adminPassword,
      name: 'Administrador',
      role: UserRole.ADMIN,
      plan: PlanType.FREE,
      maxCompanies: 1,
      isActive: true,
      maxActions: 30,
      currentPlanId: freePlan.id,
    },
  });

  // Cria o usuário master
  const masterPassword = await bcrypt.hash('master123', 10);
  
  const master = await prisma.user.create({
    data: {
      email: 'master@weedu.com',
      password: masterPassword,
      name: 'Master',
      role: UserRole.MASTER,
      plan: PlanType.PAID,
      maxCompanies: 999,
      isActive: true,
      maxActions: 999,
      currentPlanId: paidPlan.id,
    },
  });

  // Cria uma empresa
  const company = await prisma.company.create({
    data: {
      name: 'Weedu Tech',
      cnpj: '12345678901234',
      address: 'Rua Exemplo, 123',
      phone: '(11) 99999-9999',
      email: 'contato@weedutech.com',
      planId: paidPlan.id,
      ownerId: master.id,
      users: {
        connect: [{ id: master.id }],
      },
    },
  });

  // Cria o usuário gestor
  const managerPassword = await bcrypt.hash('gestor123', 10);
  
  const manager = await prisma.user.create({
    data: {
      email: 'gestor@weedu.com',
      password: managerPassword,
      name: 'Gestor',
      role: UserRole.MANAGER,
      plan: PlanType.PAID,
      maxCompanies: 1,
      isActive: true,
      maxActions: 100,
      currentPlanId: paidPlan.id,
      companies: {
        connect: [{ id: company.id }],
      },
    },
  });

  // Cria alguns colaboradores para o gestor
  const collaborator1Password = await bcrypt.hash('colab123', 10);
  const collaborator1 = await prisma.user.create({
    data: {
      email: 'colaborador1@weedu.com',
      password: collaborator1Password,
      name: 'Colaborador 1',
      role: UserRole.COLLABORATOR,
      plan: PlanType.FREE,
      maxCompanies: 1,
      isActive: true,
      maxActions: 30,
      currentPlanId: freePlan.id,
      managerId: manager.id,
      companies: {
        connect: [{ id: company.id }],
      },
    },
  });

  const collaborator2Password = await bcrypt.hash('colab123', 10);
  const collaborator2 = await prisma.user.create({
    data: {
      email: 'colaborador2@weedu.com',
      password: collaborator2Password,
      name: 'Colaborador 2',
      role: UserRole.COLLABORATOR,
      plan: PlanType.FREE,
      maxCompanies: 1,
      isActive: true,
      maxActions: 30,
      currentPlanId: freePlan.id,
      managerId: manager.id,
      companies: {
        connect: [{ id: company.id }],
      },
    },
  });

  // Atualiza a empresa para incluir todos os usuários
  await prisma.company.update({
    where: { id: company.id },
    data: {
      users: {
        connect: [
          { id: manager.id },
          { id: collaborator1.id },
          { id: collaborator2.id },
        ],
      },
    },
  });

  console.log('Usuário admin criado com sucesso:', admin.email);
  console.log('Usuário master criado com sucesso:', master.email);
  console.log('Usuário gestor criado com sucesso:', manager.email);
  console.log('Colaboradores criados com sucesso:', collaborator1.email, 'e', collaborator2.email);
  console.log('Empresa criada com sucesso:', company.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 