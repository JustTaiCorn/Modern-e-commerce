import privateClient from "@/lib/axios";

export interface SepayCheckoutResponse {
  checkoutUrl: string;
  fields: Record<string, string>;
}

/**
 * Tạo SePay checkout session.
 * Server trả về checkoutUrl + fields cần POST lên SePay.
 */
export const createSepayCheckout = async (
  orderId: number,
  customerId?: string
): Promise<SepayCheckoutResponse> => {
  const response = await privateClient.post("/payment/sepay/checkout", {
    orderId,
    customerId,
  });
  return response.data?.data || response.data;
};

/**
 * Submit form POST lên SePay gateway.
 * SePay yêu cầu POST form với tất cả fields (bao gồm signature),
 * KHÔNG được dùng window.location.href (GET).
 * Mặc định target='_blank' để mở trang thanh toán trong tab mới.
 */
export const submitSepayForm = (
  checkoutUrl: string,
  fields: Record<string, string>,
  target: string = "_blank"
): void => {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = checkoutUrl;
  form.target = target;
  form.style.display = "none";

  for (const [key, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();

  setTimeout(() => {
    if (document.body.contains(form)) {
      document.body.removeChild(form);
    }
  }, 1000);
};

export default { createSepayCheckout, submitSepayForm };
