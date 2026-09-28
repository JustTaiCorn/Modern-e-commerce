import privateClient from "@/lib/axios";

export const paymentService = {
  createVNPayPayment: async (
    amount: number,
    orderId: string | number
  ): Promise<string> => {
    try {
      const response = await privateClient.post("/payment/create", null, {
        params: { amount, orderId },
      });
      return response.data?.paymentUrl || response.data?.data?.paymentUrl || "";
    } catch (error) {
      throw error;
    }
  },

  createSepayCheckout: async (
    orderId: number,
    customerId?: string
  ): Promise<any> => {
    try {
      const response = await privateClient.post("/payment/sepay/checkout", {
        orderId,
        customerId,
      });
      return response.data?.data || response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const createVNPayPayment = paymentService.createVNPayPayment;
export default paymentService;
