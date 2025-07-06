import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Req,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreateCardDTO } from './dto/createCard.request';
import { InitiatePaymentDTO } from './dto/initiatePayment.request';
import { RefundDTO } from './dto/refund.request';
import { PaymentApiRoutes } from './routes';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { UserType } from 'utils/Enums/user/types';
import { JwtAuthGuard } from 'utils/middlewares/jwt.auth.guard';
import { RolesGuard } from 'utils/middlewares/roles.guard';
import { Roles } from 'utils/roles.decorator';
import { CardsService } from './sub-services/cards.service';

@Controller(PaymentApiRoutes.Root)
@ApiTags('Payment Controller')
export class PaymentController {
  constructor(
    private readonly paymentsService: PaymentService,
    private readonly cardsService: CardsService,
  ) {}

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created as stripe customer',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid user',
  })
  @ApiOperation({ summary: 'Create user as stripe customer' })
  @Post(PaymentApiRoutes.CreateCustomer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.USER)
  createStripeCustomer(@Req() req: any) {
    return this.cardsService.createStripeCustomer(req.user_details);
  }

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Card added successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid card data',
  })
  @ApiOperation({ summary: 'Add a new card' })
  @Post(PaymentApiRoutes.AddCard)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.USER)
  addCard(@Req() req: any, @Body() createCardDto: CreateCardDTO) {
    return this.cardsService.addCard(req.user_details, createCardDto);
  }

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Card detached successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid card data',
  })
  @ApiOperation({ summary: 'detach a  card' })
  @Post(PaymentApiRoutes.DetachCard)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.USER)
  detachCard(
    @Req() req: any,
    @Param('paymentMethodId') paymentMethodId: string,
  ) {
    return this.cardsService.removeCard(req.user_details._id, paymentMethodId);
  }

  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Cards listed successfully',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiOperation({ summary: 'List all saved cards for a user' })
  @Get(PaymentApiRoutes.ListMyCard)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.USER)
  listCards(@Req() req: any) {
    return this.cardsService.listCards(req.user_details);
  }

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment intent started successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid payment data',
  })
  @ApiOperation({ summary: 'Start a new payment (create a payment intent)' })
  @Post(PaymentApiRoutes.Initiate)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.USER)
  startPayment(@Req() req: any, @Body() payload: InitiatePaymentDTO) {
    return this.paymentsService.initiatePayment(req.user_details, payload);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment authorized successfully',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiOperation({ summary: 'Accept/Authorize the payment' })
  @Patch(PaymentApiRoutes.Accept)
  @UseGuards(JwtAuthGuard, RolesGuard)
  authorizePayment(@Param('paymentIntentId') paymentIntentId: string) {
    return this.paymentsService.authorizePayment(paymentIntentId);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment captured successfully',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiOperation({ summary: 'Capture payment after vendor approval' })
  @Patch(PaymentApiRoutes.Capture)
  @UseGuards(JwtAuthGuard, RolesGuard)
  capturePayment(@Param('paymentIntentId') paymentIntentId: string) {
    return this.paymentsService.confirmAndCapturePayment(paymentIntentId);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment cancelled successfully',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiOperation({ summary: 'Cancel a payment' })
  @Patch(PaymentApiRoutes.Cancel)
  @UseGuards(JwtAuthGuard, RolesGuard)
  cancelPayment(@Param('paymentIntentId') paymentIntentId: string) {
    return this.paymentsService.cancelPayment(paymentIntentId);
  }

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment refunded successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid refund data',
  })
  @ApiOperation({ summary: 'Refund a payment' })
  @Post(PaymentApiRoutes.Refund)
  @UseGuards(JwtAuthGuard, RolesGuard)
  refundPayment(@Body() payload: RefundDTO) {
    return this.paymentsService.refundPayment(payload);
  }

  // test payment method (create)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Card added successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid card data',
  })
  @ApiOperation({ summary: 'Add a new card' })
  @Post('create/paymentMethod')
  @UseGuards(JwtAuthGuard)
  createpaymentMethod(@Req() req: any) {
    return this.paymentsService.createTestPaymentMethod(req.user_details.email);
  }
}
