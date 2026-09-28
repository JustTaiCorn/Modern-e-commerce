import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@ApiTags('Addresses')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get addresses by user ID' })
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.addressesService.findByUserId(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new address' })
  create(@Body() dto: CreateAddressDto) {
    return this.addressesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update address by ID' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressesService.update(id, dto);
  }

  @Put(':id/default')
  @ApiOperation({ summary: 'Set address as default' })
  setDefault(@Param('id', ParseIntPipe) id: number) {
    return this.addressesService.setDefault(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete address by ID' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.addressesService.remove(id);
  }
}
