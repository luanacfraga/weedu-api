# Platform Settings (Support Contact) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Master users can configure a support WhatsApp number and email via a dedicated page (`/masters/settings`). Admin users see "Fazer upgrade de plano" buttons (WhatsApp + Email) in the company plan card.

**Architecture:** New `PlatformSettings` singleton table → repository → services → REST controller → frontend settings page + plan card buttons.

**Tech Stack:** Prisma, NestJS (class-validator), Next.js 14, React Query, React Hook Form + Zod, shadcn/ui.

---

### Task 1: Prisma migration — add `PlatformSettings` model

**Files:**
- Modify: `tooldo-api/src/infra/database/prisma/schema.prisma`

**Step 1: Add the model at the end of the schema**

```prisma
model PlatformSettings {
  id              String  @id @default("global")
  supportWhatsapp String? @map("support_whatsapp")
  supportEmail    String? @map("support_email")

  @@map("platform_settings")
}
```

**Step 2: Run the migration**

```bash
cd tooldo-api && npx prisma migrate dev --name add_platform_settings
```

Expected: migration file created, DB updated.

**Step 3: Verify TypeScript**

```bash
cd tooldo-api && npx tsc --noEmit
```
Expected: 0 errors.

**Step 4: Commit**

```bash
cd tooldo-api && git add prisma/migrations/ src/infra/database/prisma/schema.prisma
git commit -m "feat: add PlatformSettings model to Prisma schema"
```

---

### Task 2: Backend — domain entity + port interface + Prisma repository

**Files:**
- Create: `tooldo-api/src/core/domain/platform-settings/platform-settings.entity.ts`
- Create: `tooldo-api/src/core/ports/repositories/platform-settings.repository.ts`
- Create: `tooldo-api/src/infra/database/repositories/platform-settings.prisma.repository.ts`

**Step 1: Create the domain entity**

```ts
// tooldo-api/src/core/domain/platform-settings/platform-settings.entity.ts
export class PlatformSettings {
  constructor(
    public readonly id: string,
    public readonly supportWhatsapp: string | null,
    public readonly supportEmail: string | null,
  ) {}
}
```

**Step 2: Create the port interface**

```ts
// tooldo-api/src/core/ports/repositories/platform-settings.repository.ts
import { PlatformSettings } from '@/core/domain/platform-settings/platform-settings.entity';

export interface PlatformSettingsRepository {
  get(): Promise<PlatformSettings | null>;
  upsert(data: { supportWhatsapp?: string | null; supportEmail?: string | null }): Promise<PlatformSettings>;
}
```

**Step 3: Create the Prisma repository**

```ts
// tooldo-api/src/infra/database/repositories/platform-settings.prisma.repository.ts
import { PlatformSettings } from '@/core/domain/platform-settings/platform-settings.entity';
import type { PlatformSettingsRepository } from '@/core/ports/repositories/platform-settings.repository';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

const GLOBAL_ID = 'global';

@Injectable()
export class PlatformSettingsPrismaRepository implements PlatformSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<PlatformSettings | null> {
    const row = await this.prisma.platformSettings.findUnique({
      where: { id: GLOBAL_ID },
    });
    if (!row) return null;
    return new PlatformSettings(row.id, row.supportWhatsapp, row.supportEmail);
  }

  async upsert(data: {
    supportWhatsapp?: string | null;
    supportEmail?: string | null;
  }): Promise<PlatformSettings> {
    const row = await this.prisma.platformSettings.upsert({
      where: { id: GLOBAL_ID },
      create: {
        id: GLOBAL_ID,
        supportWhatsapp: data.supportWhatsapp ?? null,
        supportEmail: data.supportEmail ?? null,
      },
      update: {
        ...(data.supportWhatsapp !== undefined && { supportWhatsapp: data.supportWhatsapp }),
        ...(data.supportEmail !== undefined && { supportEmail: data.supportEmail }),
      },
    });
    return new PlatformSettings(row.id, row.supportWhatsapp, row.supportEmail);
  }
}
```

**Step 4: Register in DatabaseModule**

File: `tooldo-api/src/infra/database/database.module.ts`

Add the provider and export:
```ts
const platformSettingsRepositoryProvider: ClassProvider = {
  provide: 'PlatformSettingsRepository',
  useClass: PlatformSettingsPrismaRepository,
};

// Add to providers array: platformSettingsRepositoryProvider
// Add to exports array: 'PlatformSettingsRepository'
```

Add import: `import { PlatformSettingsPrismaRepository } from './repositories/platform-settings.prisma.repository';`

**Step 5: Verify TypeScript**

```bash
cd tooldo-api && npx tsc --noEmit
```
Expected: 0 errors.

**Step 6: Commit**

```bash
cd tooldo-api && git add src/core/domain/platform-settings/ src/core/ports/repositories/platform-settings.repository.ts src/infra/database/repositories/platform-settings.prisma.repository.ts src/infra/database/database.module.ts
git commit -m "feat: add PlatformSettings domain entity, port, and Prisma repository"
```

---

### Task 3: Backend — DTOs + controller + module

**Files:**
- Create: `tooldo-api/src/api/platform-settings/dto/platform-settings-response.dto.ts`
- Create: `tooldo-api/src/api/platform-settings/dto/update-platform-settings.dto.ts`
- Create: `tooldo-api/src/api/platform-settings/platform-settings.controller.ts`
- Create: `tooldo-api/src/api/platform-settings/platform-settings.module.ts`
- Modify: `tooldo-api/src/app.module.ts` — import PlatformSettingsModule

**Step 1: Create response DTO**

```ts
// tooldo-api/src/api/platform-settings/dto/platform-settings-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class PlatformSettingsResponseDto {
  @ApiProperty({ required: false, nullable: true })
  supportWhatsapp!: string | null;

  @ApiProperty({ required: false, nullable: true })
  supportEmail!: string | null;
}
```

**Step 2: Create update DTO**

```ts
// tooldo-api/src/api/platform-settings/dto/update-platform-settings.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class UpdatePlatformSettingsDto {
  @ApiPropertyOptional({ description: 'Número WhatsApp em formato E.164 (+55...)' })
  @IsOptional()
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/, { message: 'Número WhatsApp deve estar no formato E.164' })
  supportWhatsapp?: string;

  @ApiPropertyOptional({ description: 'Email de suporte' })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  supportEmail?: string;
}
```

**Step 3: Create controller**

```ts
// tooldo-api/src/api/platform-settings/platform-settings.controller.ts
import { CurrentUser } from '@/api/auth/decorators/current-user.decorator';
import { Roles } from '@/api/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/api/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/api/auth/guards/roles.guard';
import type { PlatformSettingsRepository } from '@/core/ports/repositories/platform-settings.repository';
import { UserRole } from '@/core/domain/shared/enums';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PlatformSettingsResponseDto } from './dto/platform-settings-response.dto';
import { UpdatePlatformSettingsDto } from './dto/update-platform-settings.dto';

@ApiTags('platform-settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/platform-settings')
export class PlatformSettingsController {
  constructor(
    @Inject('PlatformSettingsRepository')
    private readonly repo: PlatformSettingsRepository,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retorna as configurações da plataforma (contato de suporte)' })
  async get(): Promise<PlatformSettingsResponseDto> {
    const settings = await this.repo.get();
    return {
      supportWhatsapp: settings?.supportWhatsapp ?? null,
      supportEmail: settings?.supportEmail ?? null,
    };
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Atualiza as configurações da plataforma (apenas MASTER)' })
  async update(
    @Body() body: UpdatePlatformSettingsDto,
  ): Promise<PlatformSettingsResponseDto> {
    const updated = await this.repo.upsert({
      supportWhatsapp: body.supportWhatsapp,
      supportEmail: body.supportEmail,
    });
    return {
      supportWhatsapp: updated.supportWhatsapp,
      supportEmail: updated.supportEmail,
    };
  }
}
```

**Step 4: Create module**

```ts
// tooldo-api/src/api/platform-settings/platform-settings.module.ts
import { DatabaseModule } from '@/infra/database/database.module';
import { Module } from '@nestjs/common';
import { PlatformSettingsController } from './platform-settings.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [PlatformSettingsController],
})
export class PlatformSettingsModule {}
```

**Step 5: Register in app.module.ts**

Add `PlatformSettingsModule` to the `imports` array of `AppModule`.

**Step 6: Verify TypeScript**

```bash
cd tooldo-api && npx tsc --noEmit
```
Expected: 0 errors.

**Step 7: Commit**

```bash
cd tooldo-api && git add src/api/platform-settings/ src/app.module.ts
git commit -m "feat: add PlatformSettings controller, DTOs, and module"
```

---

### Task 4: Frontend — API client + React Query hook

**Files:**
- Create: `tooldo-app/src/lib/api/endpoints/platform-settings.ts`
- Create: `tooldo-app/src/lib/services/queries/use-platform-settings.ts`

**Step 1: Create API client**

```ts
// tooldo-app/src/lib/api/endpoints/platform-settings.ts
import { apiClient } from '../api-client'

export interface PlatformSettings {
  supportWhatsapp: string | null
  supportEmail: string | null
}

export interface UpdatePlatformSettingsRequest {
  supportWhatsapp?: string
  supportEmail?: string
}

export const platformSettingsApi = {
  get: () => apiClient.get<PlatformSettings>('/api/v1/platform-settings'),
  update: (data: UpdatePlatformSettingsRequest) =>
    apiClient.patch<PlatformSettings>('/api/v1/platform-settings', data),
}
```

**Step 2: Create React Query hooks**

```ts
// tooldo-app/src/lib/services/queries/use-platform-settings.ts
import { platformSettingsApi } from '@/lib/api/endpoints/platform-settings'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const PLATFORM_SETTINGS_KEY = ['platform-settings'] as const

export function usePlatformSettings() {
  return useQuery({
    queryKey: PLATFORM_SETTINGS_KEY,
    queryFn: () => platformSettingsApi.get(),
    staleTime: 5 * 60_000, // 5 minutes
  })
}

export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: platformSettingsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLATFORM_SETTINGS_KEY })
    },
  })
}
```

**Step 3: Verify TypeScript**

```bash
cd tooldo-app && npx tsc --noEmit 2>&1 | grep -v "phone-input-masked\|settings/page"
```
Expected: no new errors.

**Step 4: Commit**

```bash
cd tooldo-app && git add src/lib/api/endpoints/platform-settings.ts src/lib/services/queries/use-platform-settings.ts
git commit -m "feat: add platform settings API client and React Query hooks"
```

---

### Task 5: Frontend — Master settings page

**Files:**
- Create: `tooldo-app/src/app/(protected)/masters/settings/page.tsx`

**Step 1: Create the page**

```tsx
// tooldo-app/src/app/(protected)/masters/settings/page.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { MasterOnly } from '@/components/features/auth/guards/master-only'
import { getApiErrorMessage } from '@/lib/utils/error-handling'
import { usePlatformSettings, useUpdatePlatformSettings } from '@/lib/services/queries/use-platform-settings'
import { zodResolver } from '@hookform/resolvers/zod'
import { MessageCircle, Mail } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const schema = z.object({
  supportWhatsapp: z
    .string()
    .refine(
      (v) => v === '' || /^\+[1-9]\d{7,14}$/.test(v),
      'Digite no formato E.164 (ex: +5531999999999)',
    ),
  supportEmail: z
    .string()
    .refine((v) => v === '' || z.string().email().safeParse(v).success, 'Email inválido'),
})

type FormData = z.infer<typeof schema>

export default function MasterSettingsPage() {
  const { data, isLoading } = usePlatformSettings()
  const { mutateAsync, isPending } = useUpdatePlatformSettings()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { supportWhatsapp: '', supportEmail: '' },
  })

  useEffect(() => {
    if (data) {
      form.reset({
        supportWhatsapp: data.supportWhatsapp ?? '',
        supportEmail: data.supportEmail ?? '',
      })
    }
  }, [data, form])

  const onSubmit = async (values: FormData) => {
    try {
      await mutateAsync({
        supportWhatsapp: values.supportWhatsapp || undefined,
        supportEmail: values.supportEmail || undefined,
      })
      toast.success('Configurações salvas com sucesso!')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erro ao salvar configurações'))
    }
  }

  return (
    <MasterOnly>
      <PageContainer maxWidth="2xl">
        <PageHeader
          title="Configurações da plataforma"
          description="Configure os dados de contato que aparecerão para os admins realizarem upgrade de plano."
        />

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Contato de suporte
              </CardTitle>
              <CardDescription>
                Esses dados aparecem no card de plano de cada empresa como botões de "Fazer upgrade".
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-9 animate-pulse rounded-md bg-muted/60" />
                  <div className="h-9 animate-pulse rounded-md bg-muted/60" />
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="supportWhatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1 text-xs">
                            <MessageCircle className="h-3 w-3" />
                            WhatsApp (formato E.164)
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+5531999999999" className="h-9 text-sm" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="supportEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1 text-xs">
                            <Mail className="h-3 w-3" />
                            Email de suporte
                          </FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="suporte@tooldo.com" className="h-9 text-sm" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end pt-2">
                      <Button type="submit" size="sm" disabled={isPending}>
                        {isPending ? 'Salvando…' : 'Salvar'}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </MasterOnly>
  )
}
```

**Step 2: Verify TypeScript**

```bash
cd tooldo-app && npx tsc --noEmit 2>&1 | grep -v "phone-input-masked\|settings/page"
```
Expected: no new errors.

**Step 3: Commit**

```bash
cd tooldo-app && git add src/app/(protected)/masters/settings/page.tsx
git commit -m "feat: add Master platform settings page at /masters/settings"
```

---

### Task 6: Frontend — sidebar nav item + plan card upgrade buttons

**Files:**
- Modify: `tooldo-app/src/components/layout/dashboard-sidebar.tsx`
- Modify: `tooldo-app/src/app/(protected)/companies/[companyId]/settings/page.tsx`

**Step 1: Add "Configurações" nav item for Master in sidebar**

File: `tooldo-app/src/components/layout/dashboard-sidebar.tsx`

Find the `if (isMaster)` block that pushes items. Add a new item at the beginning:

```ts
{
  name: 'Configurações',
  href: '/masters/settings',
  icon: Settings2,
},
```

Add `Settings2` to the lucide-react import (already has `Settings` — use `Settings2` to avoid conflict).

**Step 2: Add upgrade buttons to the plan card**

File: `tooldo-app/src/app/(protected)/companies/[companyId]/settings/page.tsx`

Add the `usePlatformSettings` hook import:
```ts
import { usePlatformSettings } from '@/lib/services/queries/use-platform-settings'
```

Add `MessageCircle` and `Mail` to the lucide-react imports.

Inside the component, add:
```ts
const { data: platformSettings } = usePlatformSettings()
```

At the bottom of the plan card `<CardContent>`, after the subscription info box and before `</CardContent>`, add:

```tsx
{(platformSettings?.supportWhatsapp || platformSettings?.supportEmail) && (
  <div className="flex flex-wrap gap-2 pt-2">
    {platformSettings.supportWhatsapp && (
      <a
        href={`https://wa.me/${platformSettings.supportWhatsapp.replace('+', '')}?text=${encodeURIComponent('Olá! Gostaria de fazer um upgrade de plano no ToolDo.')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        Fazer upgrade via WhatsApp
      </a>
    )}
    {platformSettings.supportEmail && (
      <a
        href={`mailto:${platformSettings.supportEmail}?subject=${encodeURIComponent('Upgrade de plano - ToolDo')}`}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted/50 transition-colors"
      >
        <Mail className="h-3.5 w-3.5" />
        Falar por email
      </a>
    )}
  </div>
)}
```

**Step 3: Verify TypeScript**

```bash
cd tooldo-app && npx tsc --noEmit 2>&1 | grep -v "phone-input-masked\|settings/page"
```
Expected: no new errors.

**Step 4: Commit**

```bash
cd tooldo-app && git add src/components/layout/dashboard-sidebar.tsx src/app/(protected)/companies/\[companyId\]/settings/page.tsx
git commit -m "feat: add Master settings nav item and upgrade buttons to plan card"
```
