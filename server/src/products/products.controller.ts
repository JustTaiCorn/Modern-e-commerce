import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateInventoryDto } from 'src/inventories/dto/update-inventory.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products (paginated and searchable)' })
  findMany(@Query() query: QueryProductDto) {
    return this.productsService.findMany(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findById(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product (admin only)' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Post(':id/upload-image')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Upload product images with optional variant association (admin only)' })
  uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('variantId') bodyVariantId?: string,
    @Query('variantId') queryVariantId?: string,
  ) {
    const rawVid = bodyVariantId ?? queryVariantId;
    const variantId = rawVid ? parseInt(String(rawVid), 10) : undefined;
    return this.productsService.uploadImages(
      id,
      files,
      Number.isNaN(variantId) ? undefined : variantId,
    );
  }

  @Delete(':id/images/:imageId')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete product image (admin only)' })
  deleteImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    return this.productsService.deleteImage(id, imageId);
  }

  @Patch(':id/images/:imageId')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product image classification or sort (admin only)' })
  updateImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @Body() body: { variantId?: number | null; isMain?: boolean; sortOrder?: number },
  ) {
    return this.productsService.updateImage(id, imageId, body);
  }

  @Put(':id')
  @Patch(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product by ID (admin only)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete product by ID (admin only)' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.delete(id);
  }

  // --- Inventory ---

  @Get(':id/variants')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN, 'admin', 'STAFF', 'staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get variants with stock for a product (admin only)' })
  getVariantsByProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getVariantsByProduct(id);
  }

  @Patch('variants/:variantId/stock')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN, 'admin', 'STAFF', 'staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update stock count for a variant (admin only)' })
  updateVariantStock(
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.productsService.updateVariantStock(variantId, dto.quantity);
  }
}
