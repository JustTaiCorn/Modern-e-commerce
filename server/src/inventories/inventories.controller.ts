import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { InventoriesService } from './inventories.service';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@ApiTags('Inventories')
@Controller('inventories')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(Role.ADMIN, 'admin', 'STAFF', 'staff')
@ApiBearerAuth()
export class InventoriesController {
  constructor(private readonly inventoriesService: InventoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all inventories or filter by productId' })
  findAll(@Query('productId') productId?: string) {
    const pId = productId ? parseInt(productId, 10) : undefined;
    return this.inventoriesService.findAll(pId);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get inventories by product ID' })
  findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.inventoriesService.findByProduct(productId);
  }

  @Get(':variantId')
  @ApiOperation({ summary: 'Get inventory by variant ID' })
  findOne(@Param('variantId', ParseIntPipe) variantId: number) {
    return this.inventoriesService.findOne(variantId);
  }

  @Patch(':variantId')
  @ApiOperation({ summary: 'Update stock quantity for a variant' })
  updateStock(
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.inventoriesService.updateStock(variantId, dto.quantity);
  }

  @Put(':variantId')
  @ApiOperation({ summary: 'Update stock quantity for a variant (PUT)' })
  updateStockPut(
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.inventoriesService.updateStock(variantId, dto.quantity);
  }
}
