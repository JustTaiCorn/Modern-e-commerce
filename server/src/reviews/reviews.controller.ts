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
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('products/:productId/reviews')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Tạo đánh giá sản phẩm (yêu cầu đơn hàng đã nhận thành công - DELIVERED)',
  })
  create(
    @Param('productId', ParseIntPipe) productId: number,
    @CurrentUser() user: any,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(productId, user.userId, dto);
  }

  @Get('products/:productId/reviews')
  @ApiOperation({
    summary: 'Lấy danh sách đánh giá của sản phẩm có phân trang',
  })
  findByProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() query: QueryReviewDto,
  ) {
    return this.reviewsService.findByProduct(productId, query);
  }

  @Get('reviews/user/:userId')
  @ApiOperation({ summary: 'Lấy danh sách đánh giá của một người dùng' })
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.reviewsService.findByUser(userId);
  }

  @Put('reviews/:id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chỉnh sửa đánh giá của chính mình' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, user.userId, dto);
  }

  @Delete('reviews/:id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa đánh giá của chính mình hoặc admin' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const isAdmin =
      user.roles &&
      (Array.isArray(user.roles)
        ? user.roles.includes(Role.ADMIN)
        : user.roles === Role.ADMIN);
    return this.reviewsService.removeByUserOrAdmin(id, user.userId, !!isAdmin);
  }
}
