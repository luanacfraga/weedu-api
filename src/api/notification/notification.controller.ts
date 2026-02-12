import { CurrentUser } from '@/api/auth/decorators/current-user.decorator';
import type { JwtPayload } from '@/application/services/auth/auth.service';
import { OverdueActionNotificationCron } from '@/application/services/notification/overdue-action-notification.cron';
import { UserRole } from '@/core/domain/shared/enums';
import type {
  ActionNotificationRepository,
  NotificationWithTitle,
} from '@/core/ports/repositories/action-notification.repository';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly overdueActionNotificationCron: OverdueActionNotificationCron,
    @Inject('ActionNotificationRepository')
    private readonly actionNotificationRepository: ActionNotificationRepository,
  ) {}

  @Post('trigger-overdue')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.MASTER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Trigger overdue action notifications manually',
    description:
      'Executes the overdue action notification job immediately. Only accessible by MASTER and ADMIN users.',
  })
  @ApiOkResponse({
    description: 'Notification job executed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Notification job triggered' },
        executedAt: {
          type: 'string',
          format: 'date-time',
          example: '2026-02-09T12:00:00.000Z',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden - Only MASTER and ADMIN can access',
  })
  async triggerOverdueNotifications() {
    await this.overdueActionNotificationCron.handleOverdueActionNotification();

    return {
      message: 'Notification job triggered',
      executedAt: new Date().toISOString(),
    };
  }

  @Get('my-history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Histórico de notificações do usuário autenticado' })
  @ApiOkResponse({ description: 'Lista das últimas 20 notificações' })
  async getMyHistory(
    @CurrentUser() user: JwtPayload,
  ): Promise<NotificationWithTitle[]> {
    return this.actionNotificationRepository.findByUserIdWithTitle(
      user.sub,
      20,
    );
  }
}
