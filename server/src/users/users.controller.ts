import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new staff member' })
  createStaff(@Body() body: any) {
    return this.usersService.createStaff(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Put(':id/lock')
  @ApiOperation({ summary: 'Lock a user account' })
  lockUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.lockUser(id);
  }

  @Put(':id/unlock')
  @ApiOperation({ summary: 'Unlock a user account' })
  unlockUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.unlockUser(id);
  }

  @Put(':id/roles')
  @ApiOperation({ summary: 'Assign a role to user' })
  assignRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { id?: number; name?: string; roleId?: number },
  ) {
    return this.usersService.assignRole(id, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Put('change/:id')
  @ApiOperation({ summary: 'Update user profile (alternative route)' })
  updateChange(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user profile (PUT)' })
  updatePut(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user by ID' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
