export const newsImages = {
  static: {
    dieuKhoanChung: "/images/news/Dieu-khoan-chung.png",
    chinhSachThanhVien: "/images/news/Chinh-sach-thanh-vien.png", 
    chinhSachGiaoHang: "/images/news/Chinh-sach-giao-hang.png",
    chinhSachDoiTra: "/images/news/Chinh-sach-doi-tra.png"
  }
};

export const getNewsImageBySlug = (slug: string): string => {
  const imageMap: { [key: string]: string } = {
    'dieu-khoan-chung': newsImages.static.dieuKhoanChung,
    'chinh-sach-thanh-vien': newsImages.static.chinhSachThanhVien,
    'chinh-sach-van-chuyen': newsImages.static.chinhSachGiaoHang,
    'chinh-sach-doi-tra-hoan-tien': newsImages.static.chinhSachDoiTra
  };
  
  return imageMap[slug] || '/images/news/default-news.jpg';
};

export default newsImages;
