import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaymentResultDto } from './dto/payment-result.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(AccessTokenGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new order' })
  createOrder(@Body() body: CreateOrderDto, @CurrentUser() user: any) {
    return this.ordersService.create(body, user.userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all orders (admin only)' })
  getOrders() {
    return this.ordersService.findAll();
  }

  @Get('myorders')
  @ApiOperation({ summary: 'Get personal user orders' })
  getUserOrders(@CurrentUser() user: any) {
    return this.ordersService.findUserOrders(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details by ID' })
  getOrder(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findById(id);
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
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Mark order as delivered (admin only)' })
  updateOrderDelivery(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.updateDelivered(id);
  }
}
