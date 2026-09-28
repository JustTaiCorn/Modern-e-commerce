import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';

@ApiTags('Inventories')
@Controller('inventories')
export class InventoriesController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all inventories' })
  getAll() {
    return this.productsService.getAllInventories();
  }

  @Get(':variantId')
  @ApiOperation({ summary: 'Get inventory by variant ID' })
  getByVariant(@Param('variantId', ParseIntPipe) variantId: number) {
    return this.productsService.getInventoryByVariant(variantId);
  }

  @Patch(':variantId')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update variant inventory' })
  updateStock(
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body('quantity') quantity: number,
  ) {
    return this.productsService.updateVariantStock(variantId, quantity);
  }
}
