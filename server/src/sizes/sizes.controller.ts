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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { SizesService } from './sizes.service';

@ApiTags('Sizes')
@Controller('sizes')
export class SizesController {
  constructor(private readonly sizesService: SizesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sizes' })
  findAll() {
    return this.sizesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get size by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sizesService.findOne(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new size (admin only)' })
  create(@Body() body: { name: string; code: string; sortOrder?: number }) {
    return this.sizesService.create(body);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update size by ID (admin only)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; code?: string; sortOrder?: number },
  ) {
    return this.sizesService.update(id, body);
  }

  @Put(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update size by ID via PUT (admin only)' })
  updatePut(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; code?: string; sortOrder?: number },
  ) {
    return this.sizesService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete size by ID (admin only)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sizesService.remove(id);
  }
}
