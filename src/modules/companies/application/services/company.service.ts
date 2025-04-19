import { PrismaService } from '@infrastructure/database/prisma.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateCompanyDto } from '../../presentation/dtos/create-company.dto';
import { UpdatePlanDto } from '../../presentation/dtos/update-plan.dto';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  private validateCNPJ(cnpj: string): boolean {
    // Remove caracteres não numéricos
    cnpj = cnpj.replace(/[^\d]/g, '');

    // Verifica se tem 14 dígitos
    if (cnpj.length !== 14) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpj)) return false;

    // Validação do primeiro dígito verificador
    let sum = 0;
    let weight = 5;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    let digit = 11 - (sum % 11);
    if (digit > 9) digit = 0;
    if (digit !== parseInt(cnpj.charAt(12))) return false;

    // Validação do segundo dígito verificador
    sum = 0;
    weight = 6;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    digit = 11 - (sum % 11);
    if (digit > 9) digit = 0;
    if (digit !== parseInt(cnpj.charAt(13))) return false;

    return true;
  }

  async register(createCompanyDto: CreateCompanyDto) {
    if (!this.validateCNPJ(createCompanyDto.cnpj)) {
      throw new BadRequestException('CNPJ inválido');
    }

    const existingCompany = await this.prisma.company.findUnique({
      where: { cnpj: createCompanyDto.cnpj },
    });

    if (existingCompany) {
      throw new BadRequestException('CNPJ já cadastrado');
    }

    return this.prisma.company.create({
      data: {
        ...createCompanyDto,
        plan: 'FREE',
      },
    });
  }

  async create(createCompanyDto: CreateCompanyDto) {
    // Verifica se já existe uma empresa com o mesmo CNPJ
    const existingCompany = await this.prisma.company.findUnique({
      where: { cnpj: createCompanyDto.cnpj },
    });

    if (existingCompany) {
      throw new ConflictException('Já existe uma empresa com este CNPJ');
    }

    return this.prisma.company.create({
      data: createCompanyDto,
    });
  }

  async findAll() {
    return this.prisma.company.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        cnpj: true,
        address: true,
        phone: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        cnpj: true,
        address: true,
        phone: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        consultants: {
          select: {
            consultant: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async updatePlan(id: string, updatePlanDto: UpdatePlanDto) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new BadRequestException('Empresa não encontrada');
    }

    return this.prisma.company.update({
      where: { id },
      data: {
        plan: updatePlanDto.plan,
      },
    });
  }

  async findConsultantCompanies(consultantId: string) {
    const consultant = await this.prisma.user.findUnique({
      where: { id: consultantId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        maxCompanies: true,
        consultantCompanies: {
          select: {
            company: {
              select: {
                id: true,
                name: true,
                cnpj: true,
                address: true,
                phone: true,
                email: true,
                plan: true,
                actionCount: true,
                maxActions: true,
                createdAt: true,
                updatedAt: true,
                users: {
                  select: {
                    id: true,
                    role: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!consultant) {
      throw new BadRequestException('Consultor não encontrado');
    }

    const companies = consultant.consultantCompanies.map((cc) => {
      const company = cc.company;
      const managers = company.users.filter(
        (user) => user.role === 'MANAGER',
      ).length;
      const collaborators = company.users.filter(
        (user) => user.role === 'COLLABORATOR',
      ).length;

      return {
        ...company,
        managers,
        collaborators,
      };
    });

    return {
      id: consultant.id,
      name: consultant.name,
      email: consultant.email,
      role: consultant.role,
      plan: consultant.plan,
      maxCompanies: consultant.maxCompanies,
      companies,
    };
  }

  async addCompanyToConsultant(
    consultantId: string,
    createCompanyDto: CreateCompanyDto,
  ) {
    const consultant = await this.prisma.user.findUnique({
      where: { id: consultantId },
      select: {
        maxCompanies: true,
        plan: true,
        consultantCompanies: {
          select: {
            companyId: true,
          },
        },
      },
    });

    if (!consultant) {
      throw new BadRequestException('Consultor não encontrado');
    }

    // Se o plano for FREE, limite é 1 empresa
    // Se o plano for PAID, usa o maxCompanies configurado
    const maxAllowedCompanies =
      consultant.plan === 'FREE' ? 1 : consultant.maxCompanies;

    if (consultant.consultantCompanies.length >= maxAllowedCompanies) {
      throw new BadRequestException(
        `Limite de empresas atingido. Plano atual: ${consultant.plan}. Limite: ${maxAllowedCompanies}`,
      );
    }

    const existingCompany = await this.prisma.company.findUnique({
      where: { cnpj: createCompanyDto.cnpj },
    });

    if (existingCompany) {
      throw new ConflictException('CNPJ já cadastrado');
    }

    const company = await this.prisma.company.create({
      data: {
        ...createCompanyDto,
        consultants: {
          create: {
            consultantId,
          },
        },
      },
    });

    return company;
  }

  async findAllForSelect() {
    return this.prisma.company.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        cnpj: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findConsultantCompaniesForSelect(consultantId: string) {
    const consultant = await this.prisma.user.findUnique({
      where: { id: consultantId },
      select: {
        consultantCompanies: {
          select: {
            company: {
              select: {
                id: true,
                name: true,
                cnpj: true,
              },
            },
          },
        },
      },
    });

    if (!consultant) {
      throw new BadRequestException('Consultor não encontrado');
    }

    return consultant.consultantCompanies
      .map((cc) => cc.company)
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
