import { OverdueActionNotificationCron } from '@/application/services/notification/overdue-action-notification.cron';
import { SendTestTwilioNotificationService } from '@/application/services/notification/send-test-twilio-notification.service';
import type { JwtPayload } from '@/application/services/auth/auth.service';
import { UserRole } from '@/core/domain/shared/enums';
import { BadRequestException, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly overdueActionNotificationCron: OverdueActionNotificationCron,
    private readonly sendTestTwilioNotificationService: SendTestTwilioNotificationService,
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

  @Post('test-twilio')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Send test Twilio SMS (admin only)',
    description:
      'Envia um SMS de teste via Twilio para o telefone do admin logado. Apenas para testes. Apenas usuários ADMIN.',
  })
  @ApiOkResponse({
    description: 'Result of the test send',
    schema: {
      type: 'object',
      properties: {
        sent: { type: 'boolean' },
        message: { type: 'string' },
        sentAt: { type: 'string', format: 'date-time', nullable: true },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden - Only ADMIN can access',
  })
  async sendTestTwilio(@CurrentUser() user: JwtPayload) {
    const result = await this.sendTestTwilioNotificationService.execute(
      user.sub,
    );
    if (!result.sent) {
      throw new BadRequestException(result.message);
    }
    return {
      sent: result.sent,
      message: result.message,
      sentAt: new Date().toISOString(),
    };
  }
}
