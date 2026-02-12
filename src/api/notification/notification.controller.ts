import { OverdueActionNotificationCron } from '@/application/services/notification/overdue-action-notification.cron';
import { UserRole } from '@/core/domain/shared/enums';
import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
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

}
