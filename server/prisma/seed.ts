import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, OrderStatus } from '../generated/prisma/client';
import * as argon2 from 'argon2';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLEAN DATABASE
// ─────────────────────────────────────────────────────────────────────────────
async function cleanDatabase() {
  console.log('🧹 Cleaning existing database records...');

  await prisma.paymentResult.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.shippingDetail.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.variantAttributeValue.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productAttributeValue.deleteMany();
  await prisma.productAttributeType.deleteMany();

  // Delete subcategories first to respect self-referential relations
  await prisma.category.deleteMany({ where: { parentId: { not: null } } });
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.address.deleteMany();
  await prisma.session.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  console.log('✨ Database cleaned successfully.');
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SEED FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  await cleanDatabase();

  console.log('🌱 Starting ATINO Menswear seed...');

  // 1. Roles & Users
  console.log('👤 Seeding Roles and Users...');
  const roleNames = ['admin', 'staff', 'user'];
  const roleMap: Record<string, number> = {};

  for (const name of roleNames) {
    const role = await prisma.role.create({ data: { name } });
    roleMap[name] = role.id;
  }

  const defaultPassword = await hashPassword('123456');

  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@atino.vn',
      password: defaultPassword,
      fullName: 'Nguyễn Quản Trị (Admin)',
      phone: '0901234567',
      bio: 'Quản trị viên hệ thống ATINO Menswear',
      profile_img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      isActive: true,
      isVerified: true,
      roles: {
        create: [{ roleId: roleMap['admin'] }],
      },
    },
  });

  const staffUser = await prisma.user.create({
    data: {
      username: 'staff',
      email: 'staff@atino.vn',
      password: defaultPassword,
      fullName: 'Trần Nhân Viên (Staff)',
      phone: '0912345678',
      bio: 'Nhân viên vận hành bán hàng ATINO',
      profile_img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      isActive: true,
      isVerified: true,
      roles: {
        create: [{ roleId: roleMap['staff'] }],
      },
    },
  });

  const vipUser = await prisma.user.create({
    data: {
      username: 'user',
      email: 'user@atino.vn',
      password: defaultPassword,
      fullName: 'Lê Khách Hàng (VIP)',
      phone: '0923456789',
      bio: 'Khách hàng thân thiết Gold VIP ATINO',
      profile_img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      isActive: true,
      isVerified: true,
      roles: {
        create: [{ roleId: roleMap['user'] }],
      },
      addresses: {
        create: [
          {
            fullName: 'Lê Khách Hàng',
            phone: '0923456789',
            street: 'Tầng 8, Tòa nhà Keangnam Landmark 72, Phạm Hùng',
            ward: 'Phường Mễ Trì',
            district: 'Quận Nam Từ Liêm',
            province: 'Hà Nội',
            country: 'Vietnam',
            isDefault: true,
          },
          {
            fullName: 'Lê Khách Hàng',
            phone: '0923456789',
            street: '123 Đường Nguyễn Trãi',
            ward: 'Phường Thanh Xuân Bắc',
            district: 'Quận Thanh Xuân',
            province: 'Hà Nội',
            country: 'Vietnam',
            isDefault: false,
          },
        ],
      },
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      username: 'customer',
      email: 'customer@atino.vn',
      password: defaultPassword,
      fullName: 'Phạm Văn Mua Sắm',
      phone: '0934567890',
      bio: 'Khách hàng thành viên ATINO',
      profile_img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
      isActive: true,
      isVerified: true,
      roles: {
        create: [{ roleId: roleMap['user'] }],
      },
      addresses: {
        create: [
          {
            fullName: 'Phạm Văn Mua Sắm',
            phone: '0934567890',
            street: '456 Đường Lê Lợi',
            ward: 'Phường Bến Nghé',
            district: 'Quận 1',
            province: 'Hồ Chí Minh',
            country: 'Vietnam',
            isDefault: true,
          },
        ],
      },
    },
  });

  console.log('✅ Users seeded: admin@atino.vn, staff@atino.vn, user@atino.vn, customer@atino.vn');

  // 2. Brand
  console.log('🏷️ Seeding Brand...');
  const brand = await prisma.brand.create({
    data: {
      name: 'ATINO',
      slug: 'atino',
      logoUrl: 'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?auto=format&fit=crop&w=200&q=80',
    },
  });

  // 3. Categories (Parent & Child)
  console.log('📁 Seeding Categories...');
  const parentAo = await prisma.category.create({
    data: {
      name: 'Áo Nam',
      slug: 'ao-nam',
      description: 'Bộ sưu tập áo nam cao cấp thời trang công sở và dạo phố năng động',
      imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
      isActive: true,
    },
  });

  const parentQuan = await prisma.category.create({
    data: {
      name: 'Quần Nam',
      slug: 'quan-nam',
      description: 'Quần nam form dáng chuẩn, chất liệu cao cấp co giãn êm ái',
      imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
      isActive: true,
    },
  });

  const parentPhuKien = await prisma.category.create({
    data: {
      name: 'Phụ Kiện',
      slug: 'phu-kien',
      description: 'Phụ kiện thời trang nam da thật tinh tế và sang trọng',
      imageUrl: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80',
      isActive: true,
    },
  });

  // Subcategories
  const subcatAoThun = await prisma.category.create({
    data: {
      name: 'Áo Thun',
      slug: 'ao-thun',
      description: 'Áo thun cotton compact cao cấp thoáng mát, thấm hút tốt',
      parentId: parentAo.id,
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    },
  });

  const subcatAoPolo = await prisma.category.create({
    data: {
      name: 'Áo Polo',
      slug: 'ao-polo',
      description: 'Áo polo dệt pique thanh lịch, tôn dáng nam tính',
      parentId: parentAo.id,
      imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
    },
  });

  const subcatAoSoMi = await prisma.category.create({
    data: {
      name: 'Áo Sơ Mi',
      slug: 'ao-so-mi',
      description: 'Áo sơ mi dài tay, cộc tay Oxford chống nhăn công sở',
      parentId: parentAo.id,
      imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    },
  });

  const subcatAoKhoac = await prisma.category.create({
    data: {
      name: 'Áo Khoác',
      slug: 'ao-khoac',
      description: 'Áo khoác bomber, dù 2 lớp phong cách trẻ trung năng động',
      parentId: parentAo.id,
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    },
  });

  const subcatQuanJeans = await prisma.category.create({
    data: {
      name: 'Quần Jeans',
      slug: 'quan-jeans',
      description: 'Quần jeans co giãn thoải mái, form slimfit & regular thời thượng',
      parentId: parentQuan.id,
      imageUrl: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80',
    },
  });

  const subcatQuanKaki = await prisma.category.create({
    data: {
      name: 'Quần Kaki',
      slug: 'quan-kaki',
      description: 'Quần kaki chino công sở dáng ôm gọn gàng thanh lịch',
      parentId: parentQuan.id,
      imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80',
    },
  });

  const subcatQuanShort = await prisma.category.create({
    data: {
      name: 'Quần Short',
      slug: 'quan-short',
      description: 'Quần short kaki năng động, dạo phố và thể thao',
      parentId: parentQuan.id,
      imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80',
    },
  });

  const subcatQuanTay = await prisma.category.create({
    data: {
      name: 'Quần Tây',
      slug: 'quan-tay',
      description: 'Quần tây may đo cạp tăng đơ co giãn sang trọng',
      parentId: parentQuan.id,
      imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    },
  });

  const subcatThatLung = await prisma.category.create({
    data: {
      name: 'Thắt Lưng',
      slug: 'that-lung',
      description: 'Thắt lưng da bò nguyên miếng khóa kim loại tự động',
      parentId: parentPhuKien.id,
      imageUrl: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80',
    },
  });

  const subcatViDa = await prisma.category.create({
    data: {
      name: 'Ví Da',
      slug: 'vi-da',
      description: 'Ví da nam cao cấp nhiều ngăn nhỏ gọn',
      parentId: parentPhuKien.id,
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    },
  });

  console.log('✅ Categories seeded (3 parent, 10 subcategories)');

  // 4. Product Attribute Types & Values
  console.log('🎨 Seeding Attributes (Color, Size)...');
  const colorType = await prisma.productAttributeType.create({
    data: { name: 'Color' },
  });

  const sizeType = await prisma.productAttributeType.create({
    data: { name: 'Size' },
  });

  // Colors
  const colorsData = [
    { value: 'Đen', displayName: 'Đen', colorHex: '#000000' },
    { value: 'Trắng', displayName: 'Trắng', colorHex: '#FFFFFF' },
    { value: 'Xanh Navy', displayName: 'Xanh Navy', colorHex: '#1B2A4A' },
    { value: 'Xám Ghi', displayName: 'Xám Ghi', colorHex: '#808080' },
    { value: 'Be', displayName: 'Be', colorHex: '#D2B48C' },
  ];

  const colorMap: Record<string, number> = {};
  for (const c of colorsData) {
    const val = await prisma.productAttributeValue.create({
      data: {
        typeId: colorType.id,
        value: c.value,
        displayName: c.displayName,
        colorHex: c.colorHex,
      },
    });
    colorMap[c.value] = val.id;
  }

  // Sizes
  const sizesData = ['S', 'M', 'L', 'XL', 'XXL'];
  const sizeMap: Record<string, number> = {};
  for (const s of sizesData) {
    const val = await prisma.productAttributeValue.create({
      data: {
        typeId: sizeType.id,
        value: s,
        displayName: `Size ${s}`,
      },
    });
    sizeMap[s] = val.id;
  }

  console.log('✅ Attributes seeded (5 colors, 5 sizes)');

  // 5. Products, Variants, Images
  console.log('👕 Seeding 12 ATINO Products with Variants & Images...');

  interface SeedProductDef {
    name: string;
    slug: string;
    description: string;
    categoryId: number;
    rating: number;
    numReviews: number;
    images: { url: string; isMain: boolean; sortOrder: number }[];
    variants: {
      color: string;
      size: string;
      sku: string;
      price: number;
      stock: number;
    }[];
  }

  const productsToSeed: SeedProductDef[] = [
    // 1. Áo thun cotton
    {
      name: 'Áo Thun Cotton Compact 100% Basic ATINO',
      slug: 'ao-thun-cotton-compact-100-basic-atino',
      description: 'Áo thun basic làm từ 100% sợi bông Compact cao cấp, bề mặt mịn màng không xù lông. Khả năng thấm hút mồ hôi vượt trội cùng form Regular Fit tôn dáng nam tính hiện đại.',
      categoryId: subcatAoThun.id,
      rating: 5.0,
      numReviews: 12,
      images: [
        { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80', isMain: true, sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80', isMain: false, sortOrder: 1 },
      ],
      variants: [
        { color: 'Đen', size: 'M', sku: 'ATN-TSHIRT-01-BLK-M', price: 199000, stock: 45 },
        { color: 'Đen', size: 'L', sku: 'ATN-TSHIRT-01-BLK-L', price: 199000, stock: 60 },
        { color: 'Trắng', size: 'M', sku: 'ATN-TSHIRT-01-WHT-M', price: 199000, stock: 50 },
        { color: 'Trắng', size: 'L', sku: 'ATN-TSHIRT-01-WHT-L', price: 199000, stock: 40 },
        { color: 'Xanh Navy', size: 'L', sku: 'ATN-TSHIRT-01-NAV-L', price: 199000, stock: 35 },
      ],
    },
    // 2. Áo polo pique
    {
      name: 'Áo Polo Pique Mắt Chim Cao Cấp ATINO',
      slug: 'ao-polo-pique-mat-chim-cao-cap-atino',
      description: 'Chất liệu dệt Pique mắt chim với cấu trúc dệt thông thoáng khí, co giãn 4 chiều. Cổ dệt bo viền chống quăn mép, thích hợp cho cả môi trường công sở lịch lãm lẫn dạo phố.',
      categoryId: subcatAoPolo.id,
      rating: 4.8,
      numReviews: 8,
      images: [
        { url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80', isMain: true, sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1625910513413-7223594b293e?auto=format&fit=crop&w=800&q=80', isMain: false, sortOrder: 1 },
      ],
      variants: [
        { color: 'Xanh Navy', size: 'M', sku: 'ATN-POLO-01-NAV-M', price: 299000, stock: 30 },
        { color: 'Xanh Navy', size: 'L', sku: 'ATN-POLO-01-NAV-L', price: 299000, stock: 45 },
        { color: 'Trắng', size: 'M', sku: 'ATN-POLO-01-WHT-M', price: 299000, stock: 25 },
        { color: 'Trắng', size: 'L', sku: 'ATN-POLO-01-WHT-L', price: 299000, stock: 50 },
        { color: 'Đen', size: 'XL', sku: 'ATN-POLO-01-BLK-XL', price: 299000, stock: 20 },
      ],
    },
    // 3. Áo polo dệt kim
    {
      name: 'Áo Polo Dệt Kim Tay Ngắn Retro ATINO',
      slug: 'ao-polo-det-kim-tay-ngan-retro-atino',
      description: 'Phong cách vintage Italy với sợi dệt kim mỏng nhẹ, bề mặt hoa văn dệt nổi tinh xảo. Form áo Regular-Fit tôn dáng tự nhiên, mang lại sự sang trọng nổi bật.',
      categoryId: subcatAoPolo.id,
      rating: 4.9,
      numReviews: 5,
      images: [
        { url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80', isMain: true, sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1625910513413-7223594b293e?auto=format&fit=crop&w=800&q=80', isMain: false, sortOrder: 1 },
      ],
      variants: [
        { color: 'Be', size: 'M', sku: 'ATN-POLO-02-BGE-M', price: 389000, stock: 25 },
        { color: 'Be', size: 'L', sku: 'ATN-POLO-02-BGE-L', price: 389000, stock: 30 },
        { color: 'Đen', size: 'L', sku: 'ATN-POLO-02-BLK-L', price: 389000, stock: 20 },
      ],
    },
    // 4. Áo sơ mi Oxford
    {
      name: 'Áo Sơ Mi Oxford Dài Tay Chống Nhăn ATINO',
      slug: 'ao-so-mi-oxford-dai-tay-chong-nhan-atino',
      description: 'Chất liệu vải Oxford dày dặn nhưng thoáng mát, công nghệ xử lý Easy Care hạn chế nhăn tối đa. Cổ áo Button-Down giữ form chuẩn cả ngày dài làm việc.',
      categoryId: subcatAoSoMi.id,
      rating: 4.7,
      numReviews: 15,
      images: [
        { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80', isMain: true, sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80', isMain: false, sortOrder: 1 },
      ],
      variants: [
        { color: 'Trắng', size: 'M', sku: 'ATN-SHIRT-01-WHT-M', price: 350000, stock: 40 },
        { color: 'Trắng', size: 'L', sku: 'ATN-SHIRT-01-WHT-L', price: 350000, stock: 55 },
        { color: 'Xanh Navy', size: 'M', sku: 'ATN-SHIRT-01-NAV-M', price: 350000, stock: 30 },
        { color: 'Xanh Navy', size: 'L', sku: 'ATN-SHIRT-01-NAV-L', price: 350000, stock: 35 },
      ],
    },
    // 5. Áo sơ mi lụa
    {
      name: 'Áo Sơ Mi Lụa Hàn Quốc Dáng Suông ATINO',
      slug: 'ao-so-mi-lua-han-quoc-dang-suong-atino',
      description: 'Vải lụa tuyết Hàn Quốc mềm rũ, bóng nhẹ, tạo cảm giác sang trọng và mát lạnh khi chạm vào da. Thiết kế cổ chữ V mở nhẹ nhàng chuẩn style lãng tử.',
      categoryId: subcatAoSoMi.id,
      rating: 4.8,
      numReviews: 9,
      images: [
        { url: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80', isMain: true, sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80', isMain: false, sortOrder: 1 },
      ],
      variants: [
        { color: 'Đen', size: 'L', sku: 'ATN-SHIRT-02-BLK-L', price: 399000, stock: 30 },
        { color: 'Trắng', size: 'L', sku: 'ATN-SHIRT-02-WHT-L', price: 399000, stock: 35 },
        { color: 'Be', size: 'M', sku: 'ATN-SHIRT-02-BGE-M', price: 399000, stock: 20 },
      ],
    },
    // 6. Áo khoác bomber
    {
      name: 'Áo Khoác Bomber Trượt Nước Hai Lớp ATINO',
      slug: 'ao-khoac-bomber-truot-nuoc-hai-lop-atino',
      description: 'Chất liệu Poly dù 2 lớp chống gió, trượt nước hiệu quả khi gặp mưa nhỏ. Bo cổ và gấu áo dệt thun co giãn chắc chắn, khóa zip hợp kim bền bỉ.',
      categoryId: subcatAoKhoac.id,
      rating: 4.9,
      numReviews: 11,
      images: [
        { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80', isMain: true, sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80', isMain: false, sortOrder: 1 },
      ],
      variants: [
        { color: 'Đen', size: 'L', sku: 'ATN-JACKET-01-BLK-L', price: 520000, stock: 25 },
        { color: 'Đen', size: 'XL', sku: 'ATN-JACKET-01-BLK-XL', price: 520000, stock: 30 },
        { color: 'Xám Ghi', size: 'L', sku: 'ATN-JACKET-01-GRY-L', price: 520000, stock: 20 },
      ],
    },
    // 7. Quần jeans slimfit
    {
      name: 'Quần Jeans Slimfit Co Giãn Rách Gối ATINO',
      slug: 'quan-jeans-slimfit-co-gian-rach-goi-atino',
      description: 'Chất liệu denim cotton pha spandex co giãn 4 chiều giúp vận động linh hoạt. Điểm nhấn mài xước và rách gối nhẹ tạo phong cách đường phố cá tính.',
      categoryId: subcatQuanJeans.id,
      rating: 5.0,
      numReviews: 14,
      images: [
        { url: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80', isMain: true, sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80', isMain: false, sortOrder: 1 },
      ],
      variants: [
        { color: 'Đen', size: 'M', sku: 'ATN-JEANS-01-BLK-M', price: 420000, stock: 30 },
        { color: 'Đen', size: 'L', sku: 'ATN-JEANS-01-BLK-L', price: 420000, stock: 40 },
        { color: 'Xanh Navy', size: 'L', sku: 'ATN-JEANS-01-NAV-L', price: 420000, stock: 45 },
      ],
    },
    // 8. Quần jeans suông
    {
      name: 'Quần Jeans Ống Suông Regular ATINO',
      slug: 'quan-jeans-ong-suong-regular-atino',
      description: 'Form suông rộng thoải mái che khuyết điểm chân cực tốt. Màu xanh chàm vintage được wash tự nhiên bằng enzyme thân thiện môi trường.',
      categoryId: subcatQuanJeans.id,
      rating: 4.6,
      numReviews: 7,
      images: [
        { url: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=800&q=80', isMain: true, sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80', isMain: false, sortOrder: 1 },
      ],
      variants: [
        { color: 'Xanh Navy', size: 'M', sku: 'ATN-JEANS-02-NAV-M', price: 450000, stock: 25 },
        { color: 'Xanh Navy', size: 'L', sku: 'ATN-JEANS-02-NAV-L', price: 450000, stock: 35 },
      ],
    },
    // 9. Quần kaki chino
    {
      name: 'Quần Kaki Chino Co Giãn Công Sở ATINO',
      slug: 'quan-kaki-chino-co-gian-cong-so-atino',
      description: 'Vải Kaki cotton dày dặn xử lý nano chống bám bụi và chống phai màu. Dáng quần ôm nhẹ từ hông xuống cổ chân giúp tôn chiều cao người mặc.',
      categoryId: subcatQuanKaki.id,
      rating: 4.9,
      numReviews: 18,
      images: [
        { url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80', isMain: true, sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80', isMain: false, sortOrder: 1 },
      ],
      variants: [
        { color: 'Be', size: 'M', sku: 'ATN-KAKI-01-BGE-M', price: 380000, stock: 35 },
        { color: 'Be', size: 'L', sku: 'ATN-KAKI-01-BGE-L', price: 380000, stock: 50 },
        { color: 'Đen', size: 'L', sku: 'ATN-KAKI-01-BLK-L', price: 380000, stock: 40 },
        { color: 'Xám Ghi', size: 'L', sku: 'ATN-KAKI-01-GRY-L', price: 380000, stock: 30 },
      ],
    },
    // 10. Quần short kaki
    {
      name: 'Quần Short Kaki Túi Hộp Năng Động ATINO',
      slug: 'quan-short-kaki-tui-hop-nang-dong-atino',
      description: 'Chiều dài ngang gối năng động, cạp thun co giãn phía sau kèm đỉa quần tiện dụng. Phù hợp cho những chuyến dã ngoại, du lịch hay dạo phố ngày hè.',
      categoryId: subcatQuanShort.id,
      rating: 4.8,
      numReviews: 6,
      images: [
        { url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80', isMain: true, sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80', isMain: false, sortOrder: 1 },
      ],
      variants: [
        { color: 'Đen', size: 'M', sku: 'ATN-SHORT-01-BLK-M', price: 240000, stock: 30 },
        { color: 'Đen', size: 'L', sku: 'ATN-SHORT-01-BLK-L', price: 240000, stock: 40 },
        { color: 'Be', size: 'L', sku: 'ATN-SHORT-01-BGE-L', price: 240000, stock: 35 },
      ],
    },
    // 11. Quần tây may đo
    {
      name: 'Quần Tây May Đo Co Giãn 2 Khuy ATINO',
      slug: 'quan-tay-may-do-co-gian-2-khuy-atino',
      description: 'Vải tuyết mưa cao cấp không bai dão, không xù lông. Cạp tăng đơ thông minh tự điều chỉnh ôm vừa vòng eo từ 2-4cm, mang lại sự tự tin tối đa.',
      categoryId: subcatQuanTay.id,
      rating: 4.9,
      numReviews: 10,
      images: [
        { url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80', isMain: true, sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80', isMain: false, sortOrder: 1 },
      ],
      variants: [
        { color: 'Đen', size: 'L', sku: 'ATN-PANT-01-BLK-L', price: 420000, stock: 35 },
        { color: 'Xám Ghi', size: 'L', sku: 'ATN-PANT-01-GRY-L', price: 420000, stock: 40 },
        { color: 'Xanh Navy', size: 'XL', sku: 'ATN-PANT-01-NAV-XL', price: 420000, stock: 25 },
      ],
    },
    // 12. Thắt lưng da bò
    {
      name: 'Thắt Lưng Da Bò Khóa Tự Động ATINO',
      slug: 'that-lung-da-bo-khoa-tu-dong-atino',
      description: 'Dây thắt lưng làm từ 100% da bò nguyên miếng lớp một (Full-grain). Mặt khóa hợp kim phủ nano sáng bóng, cơ chế khóa ray tự động hiện đại và bền bỉ.',
      categoryId: subcatThatLung.id,
      rating: 5.0,
      numReviews: 20,
      images: [
        { url: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80', isMain: true, sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80', isMain: false, sortOrder: 1 },
      ],
      variants: [
        { color: 'Đen', size: 'S', sku: 'ATN-BELT-01-BLK-S', price: 280000, stock: 20 },
        { color: 'Đen', size: 'L', sku: 'ATN-BELT-01-BLK-L', price: 280000, stock: 40 },
      ],
    },
  ];

  // Map to hold seeded products and variants for orders
  const seededProducts: { product: any; variants: any[] }[] = [];

  for (const item of productsToSeed) {
    const product = await prisma.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        rating: item.rating,
        numReviews: item.numReviews,
        categoryId: item.categoryId,
        brandId: brand.id,
        images: {
          create: item.images.map((img) => ({
            url: img.url,
            isMain: img.isMain,
            sortOrder: img.sortOrder,
          })),
        },
      },
    });

    const seededVariants: any[] = [];
    for (const v of item.variants) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: v.sku,
          price: v.price,
          countInStock: v.stock,
          isActive: true,
        },
      });

      // Link attributes (Color + Size)
      const colorValId = colorMap[v.color];
      const sizeValId = sizeMap[v.size];

      if (colorValId) {
        await prisma.variantAttributeValue.create({
          data: {
            variantId: variant.id,
            attributeValueId: colorValId,
          },
        });
      }

      if (sizeValId) {
        await prisma.variantAttributeValue.create({
          data: {
            variantId: variant.id,
            attributeValueId: sizeValId,
          },
        });
      }

      seededVariants.push({ ...variant, color: v.color, size: v.size });
    }

    seededProducts.push({ product, variants: seededVariants });
  }

  console.log(`✅ Seeded ${seededProducts.length} products with complete variants and attributes.`);

  // 6. Coupons
  console.log('🎟️ Seeding Coupons...');
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  const couponsData = [
    {
      code: 'WELCOME10',
      name: 'Giảm 10% khách hàng mới',
      description: 'Áp dụng cho đơn hàng đầu tiên của thành viên mới',
      value: 10,
      minOrderTotal: 200000,
      maxUses: 1000,
      maxUsesPerUser: 1,
      startsAt: new Date(now.getTime() - 30 * dayMs),
      endsAt: new Date(now.getTime() + 365 * dayMs),
      isActive: true,
    },
    {
      code: 'ATINO50K',
      name: 'Giảm 50K cho đơn từ 500K',
      description: 'Voucher tri ân khách hàng mua sắm tại ATINO',
      value: 50000,
      minOrderTotal: 500000,
      maxUses: 500,
      maxUsesPerUser: 2,
      startsAt: new Date(now.getTime() - 15 * dayMs),
      endsAt: new Date(now.getTime() + 90 * dayMs),
      isActive: true,
    },
    {
      code: 'FREESHIP',
      name: 'Miễn phí giao hàng toàn quốc',
      description: 'Hỗ trợ tối đa 30.000 VNĐ phí ship cho đơn từ 300K',
      value: 30000,
      minOrderTotal: 300000,
      maxUses: 2000,
      maxUsesPerUser: 5,
      startsAt: new Date(now.getTime() - 10 * dayMs),
      endsAt: new Date(now.getTime() + 60 * dayMs),
      isActive: true,
    },
    {
      code: 'VIP100K',
      name: 'Ưu đãi VIP ATINO 100K',
      description: 'Dành riêng cho khách hàng VIP của ATINO đơn từ 1.000.000 VNĐ',
      value: 100000,
      minOrderTotal: 1000000,
      maxUses: 100,
      maxUsesPerUser: 1,
      startsAt: new Date(now.getTime() - 5 * dayMs),
      endsAt: new Date(now.getTime() + 30 * dayMs),
      isActive: true,
    },
  ];

  for (const c of couponsData) {
    await prisma.coupon.create({ data: c });
  }
  console.log('✅ 4 Coupons seeded');

  // 7. Reviews
  console.log('⭐ Seeding Reviews...');
  await prisma.review.createMany({
    data: [
      {
        userId: vipUser.id,
        productId: seededProducts[1].product.id, // Polo Pique
        rating: 5,
        comment: 'Áo polo chất vải mắt chim rất đẹp, dày dặn nhưng mặc cực kỳ thoáng mát. Giặt máy không nhăn hay xù!',
      },
      {
        userId: vipUser.id,
        productId: seededProducts[6].product.id, // Jeans Slimfit
        rating: 5,
        comment: 'Quần jeans co giãn rất tốt, dáng slimfit vừa vặn tôn chiều cao. Rất ưng ý với sản phẩm này.',
      },
      {
        userId: customerUser.id,
        productId: seededProducts[3].product.id, // Sơ mi Oxford
        rating: 4,
        comment: 'Áo sơ mi vải dày, chống nhăn tốt, mặc đi làm cả ngày vẫn đứng form. Shop đóng gói cẩn thận.',
      },
      {
        userId: customerUser.id,
        productId: seededProducts[11].product.id, // Thắt lưng da bò
        rating: 5,
        comment: 'Dây da thật sờ rất sướng tay, mặt khóa tự động mạ bóng loáng rất sang trọng. Đáng tiền!',
      },
      {
        userId: customerUser.id,
        productId: seededProducts[0].product.id, // Áo thun cotton
        rating: 5,
        comment: 'Chất cotton 100% mềm mịn, mát rượi. Đã mua 3 màu khác nhau để thay đổi hàng ngày.',
      },
    ],
  });
  console.log('✅ Reviews seeded');

  // 8. Sample Orders (8 orders distributed across the last 30 days)
  console.log('📦 Seeding 8 Orders with different statuses...');

  // Helper dates
  const daysAgo = (d: number, hours = 0) => new Date(now.getTime() - (d * 24 + hours) * 60 * 60 * 1000);

  // Order 1: 28 days ago - DELIVERED (COD)
  const o1Prod1 = seededProducts[1]; // Polo Pique (299k)
  const o1Prod2 = seededProducts[8]; // Kaki Chino (380k)
  const order1 = await prisma.order.create({
    data: {
      userId: vipUser.id,
      invoiceNumber: 'INV-2026-001',
      paymentMethod: 'COD',
      itemsPrice: 679000,
      taxPrice: 0,
      shippingPrice: 30000,
      totalPrice: 709000,
      status: OrderStatus.DELIVERED,
      paidAt: daysAgo(25),
      deliveredAt: daysAgo(25),
      createdAt: daysAgo(28),
      updatedAt: daysAgo(25),
      shippingDetail: {
        create: {
          address: 'Tầng 8, Tòa nhà Keangnam Landmark 72, Phạm Hùng',
          city: 'Hà Nội',
          postalCode: '100000',
          country: 'Vietnam',
        },
      },
      orderItems: {
        create: [
          {
            productId: o1Prod1.product.id,
            variantId: o1Prod1.variants[0].id,
            name: o1Prod1.product.name,
            variantLabel: `Màu: ${o1Prod1.variants[0].color} / Size: ${o1Prod1.variants[0].size}`,
            qty: 1,
            price: 299000,
            image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
          },
          {
            productId: o1Prod2.product.id,
            variantId: o1Prod2.variants[0].id,
            name: o1Prod2.product.name,
            variantLabel: `Màu: ${o1Prod2.variants[0].color} / Size: ${o1Prod2.variants[0].size}`,
            qty: 1,
            price: 380000,
            image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80',
          },
        ],
      },
    },
  });

  // Order 2: 22 days ago - DELIVERED (PayPal)
  const o2Prod1 = seededProducts[3]; // Sơ mi Oxford (350k)
  const o2Prod2 = seededProducts[11]; // Thắt lưng (280k)
  const order2 = await prisma.order.create({
    data: {
      userId: customerUser.id,
      invoiceNumber: 'INV-2026-002',
      paymentMethod: 'PayPal',
      itemsPrice: 980000,
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: 980000,
      status: OrderStatus.DELIVERED,
      paidAt: daysAgo(22),
      deliveredAt: daysAgo(19),
      createdAt: daysAgo(22),
      updatedAt: daysAgo(19),
      shippingDetail: {
        create: {
          address: '456 Đường Lê Lợi, Phường Bến Nghé, Quận 1',
          city: 'Hồ Chí Minh',
          postalCode: '700000',
          country: 'Vietnam',
        },
      },
      paymentResult: {
        create: {
          externalId: 'PAYID-MTU2Nzkx002',
          status: 'COMPLETED',
          updateTime: daysAgo(22).toISOString(),
          emailAddress: 'customer@atino.vn',
          provider: 'PayPal',
        },
      },
      orderItems: {
        create: [
          {
            productId: o2Prod1.product.id,
            variantId: o2Prod1.variants[0].id,
            name: o2Prod1.product.name,
            variantLabel: `Màu: ${o2Prod1.variants[0].color} / Size: ${o2Prod1.variants[0].size}`,
            qty: 2,
            price: 350000,
            image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
          },
          {
            productId: o2Prod2.product.id,
            variantId: o2Prod2.variants[0].id,
            name: o2Prod2.product.name,
            variantLabel: `Màu: ${o2Prod2.variants[0].color} / Size: ${o2Prod2.variants[0].size}`,
            qty: 1,
            price: 280000,
            image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80',
          },
        ],
      },
    },
  });

  // Order 3: 18 days ago - CANCELLED (COD)
  const o3Prod1 = seededProducts[5]; // Bomber (520k)
  const order3 = await prisma.order.create({
    data: {
      userId: vipUser.id,
      invoiceNumber: 'INV-2026-003',
      paymentMethod: 'COD',
      itemsPrice: 520000,
      taxPrice: 0,
      shippingPrice: 30000,
      totalPrice: 550000,
      status: OrderStatus.CANCELLED,
      cancelledAt: daysAgo(17),
      cancelReason: 'Khách hàng đổi ý muốn đổi sang size lớn hơn',
      createdAt: daysAgo(18),
      updatedAt: daysAgo(17),
      shippingDetail: {
        create: {
          address: '123 Đường Nguyễn Trãi, Thanh Xuân',
          city: 'Hà Nội',
          postalCode: '100000',
          country: 'Vietnam',
        },
      },
      orderItems: {
        create: [
          {
            productId: o3Prod1.product.id,
            variantId: o3Prod1.variants[0].id,
            name: o3Prod1.product.name,
            variantLabel: `Màu: ${o3Prod1.variants[0].color} / Size: ${o3Prod1.variants[0].size}`,
            qty: 1,
            price: 520000,
            image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
          },
        ],
      },
    },
  });

  // Order 4: 14 days ago - DELIVERED (VNPAY)
  const o4Prod1 = seededProducts[6]; // Jeans Slimfit (420k)
  const o4Prod2 = seededProducts[0]; // Áo thun (199k x 2 = 398k)
  const order4 = await prisma.order.create({
    data: {
      userId: customerUser.id,
      invoiceNumber: 'INV-2026-004',
      paymentMethod: 'VNPAY',
      itemsPrice: 818000,
      taxPrice: 0,
      shippingPrice: 30000,
      totalPrice: 848000,
      status: OrderStatus.DELIVERED,
      paidAt: daysAgo(14),
      deliveredAt: daysAgo(11),
      createdAt: daysAgo(14),
      updatedAt: daysAgo(11),
      shippingDetail: {
        create: {
          address: '456 Đường Lê Lợi, Phường Bến Nghé, Quận 1',
          city: 'Hồ Chí Minh',
          postalCode: '700000',
          country: 'Vietnam',
        },
      },
      paymentResult: {
        create: {
          externalId: 'VNPAY-TRANS-889922',
          status: 'SUCCESS',
          updateTime: daysAgo(14).toISOString(),
          emailAddress: 'customer@atino.vn',
          provider: 'VNPAY',
        },
      },
      orderItems: {
        create: [
          {
            productId: o4Prod1.product.id,
            variantId: o4Prod1.variants[0].id,
            name: o4Prod1.product.name,
            variantLabel: `Màu: ${o4Prod1.variants[0].color} / Size: ${o4Prod1.variants[0].size}`,
            qty: 1,
            price: 420000,
            image: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80',
          },
          {
            productId: o4Prod2.product.id,
            variantId: o4Prod2.variants[0].id,
            name: o4Prod2.product.name,
            variantLabel: `Màu: ${o4Prod2.variants[0].color} / Size: ${o4Prod2.variants[0].size}`,
            qty: 2,
            price: 199000,
            image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
          },
        ],
      },
    },
  });

  // Order 5: 9 days ago - SHIPPED (COD)
  const o5Prod1 = seededProducts[10]; // Quần tây (420k)
  const o5Prod2 = seededProducts[4];  // Sơ mi lụa (399k)
  const order5 = await prisma.order.create({
    data: {
      userId: vipUser.id,
      invoiceNumber: 'INV-2026-005',
      paymentMethod: 'COD',
      itemsPrice: 819000,
      taxPrice: 0,
      shippingPrice: 30000,
      totalPrice: 849000,
      status: OrderStatus.SHIPPED,
      shippedAt: daysAgo(7),
      createdAt: daysAgo(9),
      updatedAt: daysAgo(7),
      shippingDetail: {
        create: {
          address: 'Tầng 8, Tòa nhà Keangnam Landmark 72, Phạm Hùng',
          city: 'Hà Nội',
          postalCode: '100000',
          country: 'Vietnam',
        },
      },
      orderItems: {
        create: [
          {
            productId: o5Prod1.product.id,
            variantId: o5Prod1.variants[0].id,
            name: o5Prod1.product.name,
            variantLabel: `Màu: ${o5Prod1.variants[0].color} / Size: ${o5Prod1.variants[0].size}`,
            qty: 1,
            price: 420000,
            image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
          },
          {
            productId: o5Prod2.product.id,
            variantId: o5Prod2.variants[0].id,
            name: o5Prod2.product.name,
            variantLabel: `Màu: ${o5Prod2.variants[0].color} / Size: ${o5Prod2.variants[0].size}`,
            qty: 1,
            price: 399000,
            image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80',
          },
        ],
      },
    },
  });

  // Order 6: 5 days ago - PACKING (SePay)
  const o6Prod1 = seededProducts[2]; // Polo Dệt kim (389k)
  const o6Prod2 = seededProducts[9]; // Quần short (240k)
  const order6 = await prisma.order.create({
    data: {
      userId: customerUser.id,
      invoiceNumber: 'INV-2026-006',
      paymentMethod: 'SePay',
      itemsPrice: 629000,
      taxPrice: 0,
      shippingPrice: 30000,
      totalPrice: 659000,
      status: OrderStatus.PACKING,
      paidAt: daysAgo(5),
      createdAt: daysAgo(5),
      updatedAt: daysAgo(4),
      shippingDetail: {
        create: {
          address: '456 Đường Lê Lợi, Phường Bến Nghé, Quận 1',
          city: 'Hồ Chí Minh',
          postalCode: '700000',
          country: 'Vietnam',
        },
      },
      paymentResult: {
        create: {
          externalId: 'SEPAY-TXN-9988223',
          status: 'SUCCESS',
          updateTime: daysAgo(5).toISOString(),
          emailAddress: 'customer@atino.vn',
          provider: 'SePay',
        },
      },
      orderItems: {
        create: [
          {
            productId: o6Prod1.product.id,
            variantId: o6Prod1.variants[0].id,
            name: o6Prod1.product.name,
            variantLabel: `Màu: ${o6Prod1.variants[0].color} / Size: ${o6Prod1.variants[0].size}`,
            qty: 1,
            price: 389000,
            image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
          },
          {
            productId: o6Prod2.product.id,
            variantId: o6Prod2.variants[0].id,
            name: o6Prod2.product.name,
            variantLabel: `Màu: ${o6Prod2.variants[0].color} / Size: ${o6Prod2.variants[0].size}`,
            qty: 1,
            price: 240000,
            image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80',
          },
        ],
      },
    },
  });

  // Order 7: 2 days ago - CONFIRMED (COD)
  const o7Prod1 = seededProducts[0]; // Áo thun (199k x 3 = 597k)
  const order7 = await prisma.order.create({
    data: {
      userId: vipUser.id,
      invoiceNumber: 'INV-2026-007',
      paymentMethod: 'COD',
      itemsPrice: 597000,
      taxPrice: 0,
      shippingPrice: 30000,
      totalPrice: 627000,
      status: OrderStatus.CONFIRMED,
      createdAt: daysAgo(2),
      updatedAt: daysAgo(1),
      shippingDetail: {
        create: {
          address: 'Tầng 8, Tòa nhà Keangnam Landmark 72, Phạm Hùng',
          city: 'Hà Nội',
          postalCode: '100000',
          country: 'Vietnam',
        },
      },
      orderItems: {
        create: [
          {
            productId: o7Prod1.product.id,
            variantId: o7Prod1.variants[0].id,
            name: o7Prod1.product.name,
            variantLabel: `Màu: ${o7Prod1.variants[0].color} / Size: ${o7Prod1.variants[0].size}`,
            qty: 3,
            price: 199000,
            image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
          },
        ],
      },
    },
  });

  // Order 8: 3 hours ago - NEW (COD)
  const o8Prod1 = seededProducts[7]; // Quần jeans suông (450k)
  const o8Prod2 = seededProducts[1]; // Polo Pique (299k)
  const order8 = await prisma.order.create({
    data: {
      userId: customerUser.id,
      invoiceNumber: 'INV-2026-008',
      paymentMethod: 'COD',
      itemsPrice: 749000,
      taxPrice: 0,
      shippingPrice: 30000,
      totalPrice: 779000,
      status: OrderStatus.NEW,
      createdAt: daysAgo(0, 3),
      updatedAt: daysAgo(0, 3),
      shippingDetail: {
        create: {
          address: '456 Đường Lê Lợi, Phường Bến Nghé, Quận 1',
          city: 'Hồ Chí Minh',
          postalCode: '700000',
          country: 'Vietnam',
        },
      },
      orderItems: {
        create: [
          {
            productId: o8Prod1.product.id,
            variantId: o8Prod1.variants[0].id,
            name: o8Prod1.product.name,
            variantLabel: `Màu: ${o8Prod1.variants[0].color} / Size: ${o8Prod1.variants[0].size}`,
            qty: 1,
            price: 450000,
            image: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=800&q=80',
          },
          {
            productId: o8Prod2.product.id,
            variantId: o8Prod2.variants[0].id,
            name: o8Prod2.product.name,
            variantLabel: `Màu: ${o8Prod2.variants[0].color} / Size: ${o8Prod2.variants[0].size}`,
            qty: 1,
            price: 299000,
            image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
          },
        ],
      },
    },
  });

  console.log(`✅ Seeded 8 Orders ([${order1.id}, ${order2.id}, ${order3.id}, ${order4.id}, ${order5.id}, ${order6.id}, ${order7.id}, ${order8.id}])`);

  console.log('\n🎉 ====================================================');
  console.log('🎉 SEED COMPLETED SUCCESSFULLY FOR ATINO MENSWEAR');
  console.log('🎉 ====================================================');
  console.log('📌 Test Accounts (Password for all: 123456):');
  console.log('   - Admin:    admin@atino.vn');
  console.log('   - Staff:    staff@atino.vn');
  console.log('   - VIP User: user@atino.vn');
  console.log('   - Customer: customer@atino.vn');
  console.log('====================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
