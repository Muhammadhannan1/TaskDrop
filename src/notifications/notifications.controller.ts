import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'utils/middlewares/jwt.auth.guard';
import { RolesGuard } from 'utils/middlewares/roles.guard';
import { NotificationRoutes } from './routes';
import { testNotificationDTO } from './dto/testCreate.dto';

@Controller(NotificationRoutes.root)
@ApiTags('Notification Controller')
export class NotificationsController {
  constructor(
    @Inject(NotificationsService)
    private readonly _notification: NotificationsService,
  ) {}

  // testing notification
  @ApiOperation({ summary: 'Create a notification' })
  @ApiResponse({
    status: 201,
    description: 'The notification has been created.',
  })
  @ApiBody({ description: 'test create notification' })
  @Post(NotificationRoutes.test)
  create(@Body() payload: testNotificationDTO) {
    return this._notification.test(payload);
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Successful' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiOperation({ summary: 'Create Single Staff' })
  @Get(NotificationRoutes.listMy)
  @UseGuards(JwtAuthGuard, RolesGuard)
  GetMyNotifications(@Req() req: any) {
    return this._notification.get(req.user_details);
  }
}
