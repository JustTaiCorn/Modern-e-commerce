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
import { ColorsService } from './colors.service';

@ApiTags('Colors')
@Controller('colors')
export class ColorsController {
  constructor(private readonly colorsService: ColorsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all colors' })
  findAll() {
    return this.colorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get color by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.colorsService.findOne(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new color (admin only)' })
  create(@Body() body: { name: string; code: string }) {
    return this.colorsService.create(body);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update color by ID (admin only)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; code?: string },
  ) {
    return this.colorsService.update(id, body);
  }

  @Put(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update color by ID via PUT (admin only)' })
  updatePut(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; code?: string },
  ) {
    return this.colorsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete color by ID (admin only)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.colorsService.remove(id);
  }
}
