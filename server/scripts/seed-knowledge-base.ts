import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../src/prisma.service';
import { GeminiService } from '../src/ai-assistant/gemini.service';
import { VectorStoreService } from '../src/ai-assistant/vector-store.service';
import { AiAssistantService } from '../src/ai-assistant/ai-assistant.service';

export interface StorePolicySeed {
  title: string;
  category: string;
  content: string;
}

export const STORE_POLICIES: StorePolicySeed[] = [
  {
    title: 'Chính sách đổi trả 7 ngày',
    category: 'RETURN',
    content: `CHÍNH SÁCH ĐỔI TRẢ VÀ HOÀN TIỀN (TRONG VÒNG 7 NGÀY):
1. Thời hạn áp dụng: Trong vòng 7 ngày kể từ ngày quý khách nhận được sản phẩm thành công từ đơn vị vận chuyển.
2. Điều kiện đổi trả:
- Sản phẩm còn nguyên tem mác, nhãn niêm phong, bao bì và hộp đựng ban đầu.
- Sản phẩm chưa qua sử dụng, chưa qua giặt ủi, không bị vấy bẩn, ám mùi nước hoa hoặc hư hại do tác nhân bên ngoài.
- Có đầy đủ hóa đơn mua hàng hoặc mã đơn hàng hợp lệ trên hệ thống.
3. Chính sách áp dụng:
- Hỗ trợ đổi size hoặc đổi màu cho cùng mẫu sản phẩm.
- Khách hàng có thể đổi sang sản phẩm khác có giá trị tương đương hoặc cao hơn (thanh toán thêm phần chênh lệch). Nếu sản phẩm đổi có giá trị thấp hơn, cửa hàng không hoàn lại phần chênh lệch dư.
- Trường hợp lỗi do nhà sản xuất (rách, lỗi đường chỉ, hỏng khóa kéo, phai màu bất thường) hoặc gửi nhầm mẫu/size: Cửa hàng chịu 100% chi phí vận chuyển 2 chiều.
- Trường hợp khách hàng có nhu cầu đổi mẫu do sở thích hoặc không vừa ý: Khách hàng thanh toán phí vận chuyển phát sinh.
4. Quy trình đổi trả: Liên hệ trực tiếp bộ phận CSKH qua Hotline hoặc khung chat AI để nhận mã hỗ trợ gửi hàng đổi trả.`,
  },
  {
    title: 'Chính sách giao hàng và Freeship từ 500k',
    category: 'SHIPPING',
    content: `CHÍNH SÁCH VẬN CHUYỂN VÀ GIAO HÀNG TOÀN QUỐC:
1. Chính sách miễn phí vận chuyển (Freeship):
- Miễn phí vận chuyển 100% cho mọi đơn hàng có tổng giá trị thanh toán từ 500.000 VNĐ trở lên trên toàn quốc.
2. Biểu phí và thời gian giao hàng tiêu chuẩn (đối với đơn dưới 500.000 VNĐ):
- Nội thành Hà Nội và TP. Hồ Chí Minh: Phí giao hàng 25.000 VNĐ. Thời gian nhận hàng từ 1 - 2 ngày làm việc.
- Các tỉnh thành và khu vực khác: Phí giao hàng 35.000 VNĐ. Thời gian nhận hàng từ 2 - 4 ngày làm việc.
3. Dịch vụ giao hàng hỏa tốc (Express 2H):
- Áp dụng tại khu vực nội thành Hà Nội và TP. Hồ Chí Minh qua GrabExpress / Ahamove. Mức phí tính theo cước phí thực tế của đơn vị giao hàng tại thời điểm đặt.
4. Quyền lợi đồng kiểm khi nhận hàng:
- Khách hàng được quyền mở hộp đồng kiểm tra số lượng và tình trạng sản phẩm bên ngoài trước mặt bưu tá trước khi ký nhận hoặc thanh toán COD.`,
  },
  {
    title: 'Chính sách bảo hành sản phẩm chính hãng',
    category: 'WARRANTY',
    content: `CHÍNH SÁCH BẢO HÀNH VÀ CAM KẾT CHẤT LƯỢNG SẢN PHẨM:
1. Cam kết chính hãng:
- 100% sản phẩm được phân phối tại cửa hàng là hàng chính hãng, có nguồn gốc chứng nhận rõ ràng. Cam kết đền bù gấp 10 lần giá trị đơn hàng nếu phát hiện hàng giả, hàng nhái.
2. Thời hạn bảo hành:
- Bảo hành tiêu chuẩn 6 tháng kể từ ngày mua hàng đối với các lỗi kỹ thuật do sản xuất như: bung chỉ, hỏng khóa kéo kim loại, bong tróc keo dán nhiệt, lỗi logo hoặc cúc áo.
- Hỗ trợ sửa chữa miễn phí trọn đời cho các lỗi đứt cúc, bung chỉ nhẹ trong quá trình sử dụng.
3. Trường hợp không được bảo hành:
- Hư hại do sử dụng sai hướng dẫn giặt sấy (như dùng chất tẩy nồng độ cao, sấy ở nhiệt độ quá cao làm co rút vải, ủi trực tiếp lên hình in/logo nhiệt).
- Sản phẩm rách, xước, biến dạng do tác động ngoại lực, va chạm vật sắc nhọn, hoặc thú cưng cào cắn.
- Sản phẩm đã qua sửa chữa, can thiệp form dáng tại các đơn vị bên ngoài cửa hàng.`,
  },
  {
    title: 'Hướng dẫn chọn size chuẩn xác',
    category: 'FAQ',
    content: `HƯỚNG DẪN CHỌN SIZE TRANG PHỤC VÀ BẢNG QUY ĐỔI KÍCH CỠ:
1. Bảng size tiêu chuẩn cho áo thun, áo polo, áo khoác (Unisex & Nam):
- Size S: Chiều cao 1m55 - 1m64, Cân nặng 48 - 56kg. Phù hợp vóc dáng thanh mảnh, vừa vặn.
- Size M: Chiều cao 1m65 - 1m70, Cân nặng 57 - 65kg. Phù hợp vóc dáng tiêu chuẩn.
- Size L: Chiều cao 1m71 - 1m76, Cân nặng 66 - 74kg. Phù hợp vóc dáng cân đối, hơi vạm vỡ.
- Size XL: Chiều cao 1m77 - 1m83, Cân nặng 75 - 83kg. Phù hợp vóc dáng cao lớn.
- Size XXL: Chiều cao trên 1m80, Cân nặng 84 - 92kg. Phù hợp vóc dáng to lớn hoặc thích mặc form rộng rãi (Oversize).
2. Bảng size quần jean, quần âu, quần short (theo số đo vòng eo):
- Size 29: Vòng eo 74 - 76cm (Cân nặng ~50-57kg)
- Size 30: Vòng eo 77 - 79cm (Cân nặng ~58-63kg)
- Size 31: Vòng eo 80 - 82cm (Cân nặng ~64-69kg)
- Size 32: Vòng eo 83 - 85cm (Cân nặng ~70-75kg)
- Size 34: Vòng eo 88 - 91cm (Cân nặng ~76-83kg)
3. Lưu ý khi chọn size:
- Nếu số đo chiều cao và cân nặng nằm ở 2 size khác nhau, quý khách nên ưu tiên chọn theo cân nặng.
- Nếu thích mặc dáng ôm (Slimfit), chọn đúng size; nếu thích mặc thoải mái hoặc form rộng (Oversized), nên tăng lên 1 size.
- Quý khách có thể gửi chiều cao và cân nặng trong chat để trợ lý AI tư vấn size chuẩn xác nhất.`,
  },
  {
    title: 'Phương thức thanh toán và bảo mật',
    category: 'FAQ',
    content: `CÁC PHƯƠNG THỨC THANH TOÁN VÀ TIÊU CHUẨN BẢO MẬT:
1. Thanh toán khi nhận hàng (COD - Cash On Delivery):
- Quý khách nhận hàng tại nhà, kiểm tra gói hàng ngoại quan và thanh toán tiền mặt trực tiếp cho nhân viên chuyển phát.
2. Chuyển khoản ngân hàng tự động qua cổng SePay:
- Hệ thống tạo mã QR động VietQR với nội dung chuyển khoản tự động chính xác từng đồng.
- Giao dịch được xác nhận tự động hoàn toàn trong vòng 3 - 5 giây, không cần gửi ủy nhiệm chi hay ảnh chụp màn hình chuyển khoản.
3. Thanh toán bằng thẻ tín dụng / thẻ ghi nợ quốc tế:
- Hỗ trợ thẻ Visa, MasterCard, JCB phát hành bởi tất cả các ngân hàng trong nước và quốc tế.
4. Thanh toán qua ví điện tử:
- Hỗ trợ MoMo, ZaloPay, VNPay-QR với nhiều chương trình khuyến mãi và hoàn tiền hấp dẫn.
5. Cam kết bảo mật thông tin tài chính:
- Hệ thống áp dụng giao thức mã hóa dữ liệu SSL 256-bit chuẩn PCI-DSS Level 1.
- Cửa hàng tuyệt đối không lưu trữ thông tin số thẻ tín dụng hay mã bảo mật CVV/CVC của khách hàng trên máy chủ.`,
  },
];

export async function seedKnowledgeBase() {
  console.log('🚀 Starting Knowledge Base Seeding...');
  const prisma = new PrismaService();
  const configService = new ConfigService();
  const geminiService = new GeminiService(configService);
  const vectorStoreService = new VectorStoreService(prisma);
  const aiAssistantService = new AiAssistantService(
    prisma,
    geminiService,
    vectorStoreService,
  );

  const apiKey =
    configService.get<string>('GEMINI_API_KEY') ||
    process.env.GEMINI_API_KEY ||
    '';

  if (!apiKey) {
    console.warn(
      '⚠️ GEMINI_API_KEY is not configured in environment. Using placeholder embeddings for seeding.',
    );
  }

  console.log(
    `📚 Seeding ${STORE_POLICIES.length} store policies into store_documents...`,
  );

  for (const policy of STORE_POLICIES) {
    console.log(`- Upserting policy: "${policy.title}" [${policy.category}]`);
    let embedding: number[];
    if (apiKey) {
      try {
        embedding = await geminiService.generateEmbedding(policy.content);
      } catch (err) {
        console.warn(
          `  Failed to generate real embedding for "${policy.title}": ${err.message}. Using placeholder vector.`,
        );
        embedding = new Array(768).fill(0.01);
      }
    } else {
      embedding = new Array(768).fill(0.01);
    }

    // Ensure idempotency: delete prior version of the document by title
    await prisma.$executeRawUnsafe(
      `DELETE FROM "store_documents" WHERE "title" = $1;`,
      policy.title,
    );

    await vectorStoreService.upsertStoreDocument(
      policy.title,
      policy.category,
      policy.content,
      embedding,
    );
  }

  console.log('✅ Store policies seeded successfully.');

  console.log('🔄 Reindexing existing products in the catalog...');
  try {
    const reindexResult = await aiAssistantService.reindexAll();
    console.log(
      `🎉 Reindexing complete! Indexed products: ${reindexResult.indexedProducts}, Store documents: ${reindexResult.indexedDocuments}`,
    );
  } catch (err) {
    console.error(`❌ Reindexing failed: ${err.message}`, err.stack);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedKnowledgeBase()
    .then(() => {
      console.log('Knowledge base seed process finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal error during seed:', err);
      process.exit(1);
    });
}
