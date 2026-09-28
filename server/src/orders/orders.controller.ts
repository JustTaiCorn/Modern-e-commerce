import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { PaymentResultDto } from './dto/payment-result.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(AccessTokenGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new order' })
  createOrder(@Body() body: any, @CurrentUser() user: any) {
    return this.ordersService.create(body, user?.userId);
  }

  @Post('user/:userId')
  @ApiOperation({ summary: 'Create new order for specific user' })
  createOrderForUser(
    @Body() body: any,
    @Param('userId', ParseIntPipe) paramUserId: number,
  ) {
    return this.ordersService.create(body, paramUserId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  getOrders() {
    return this.ordersService.findAll();
  }

  @Get('myorders')
  @ApiOperation({ summary: 'Get personal user orders' })
  getMyOrders(@CurrentUser() user: any) {
    return this.ordersService.findUserOrders(user.userId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get orders by user ID' })
  getUserOrders(@Param('userId', ParseIntPipe) userId: number) {
    return this.ordersService.findUserOrders(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details by ID' })
  getOrder(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (PATCH)' })
  patchOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Query('status') queryStatus?: string,
    @Body('status') bodyStatus?: string,
    @Body() fullBody?: any,
  ) {
    const status = queryStatus || bodyStatus || fullBody?.status;
    return this.ordersService.updateStatus(id, status);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update order status (PUT)' })
  putOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Query('status') queryStatus?: string,
    @Body('status') bodyStatus?: string,
    @Body() fullBody?: any,
  ) {
    const status = queryStatus || bodyStatus || fullBody?.status;
    return this.ordersService.updateStatus(id, status);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel order (PATCH)' })
  patchCancelOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason?: string,
  ) {
    return this.ordersService.cancelOrder(id, reason);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel order (PUT)' })
  putCancelOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason?: string,
  ) {
    return this.ordersService.cancelOrder(id, reason);
  }

  @Patch(':userId/:id/cancel')
  @ApiOperation({ summary: 'Cancel order with userId in route (PATCH)' })
  patchCancelOrderWithUser(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason?: string,
  ) {
    return this.ordersService.cancelOrder(id, reason);
  }

  @Put(':id/pay')
  @ApiOperation({ summary: 'Update order as paid' })
  updateOrderPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: PaymentResultDto,
  ) {
    return this.ordersService.updatePaid(id, body);
  }

  @Put(':id/deliver')
  @ApiOperation({ summary: 'Mark order as delivered' })
  updateOrderDelivery(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.updateDelivered(id);
  }
}
