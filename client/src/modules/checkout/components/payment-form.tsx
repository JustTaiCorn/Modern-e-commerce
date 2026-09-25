'use client';

// ponytail: Phương thức thanh toán ưu tiên SePay VietQR trực tiếp ngân hàng Việt Nam
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, QrCode } from 'lucide-react';
import { FaPaypal } from 'react-icons/fa';
import { useCheckout } from '../context/checkout-context';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  paymentMethod: z.enum(['sepay', 'PayPal', 'Stripe'], {
    required_error: 'Vui lòng chọn phương thức thanh toán.',
  }),
});

export function PaymentForm() {
  const { setPaymentMethod } = useCheckout();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentMethod: 'sepay',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await apiClient.post('/cart/payment', {
        paymentMethod: values.paymentMethod,
      });
      setPaymentMethod(values.paymentMethod);
      router.push('/checkout/review');
    } catch (error) {
      // Cho phép tiếp tục nếu là guest chưa đăng nhập
      setPaymentMethod(values.paymentMethod);
      router.push('/checkout/review');
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Phương thức thanh toán</h1>
          <p className="text-sm text-muted-foreground">
            Chọn cách bạn muốn thanh toán đơn hàng
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hình thức thanh toán</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 md:grid-cols-1 gap-4"
                    >
                      {/* SePay VietQR */}
                      <FormItem>
                        <FormControl>
                          <label
                            htmlFor="sepay"
                            className="border rounded-lg p-4 cursor-pointer hover:border-primary [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5 block transition-colors"
                          >
                            <RadioGroupItem
                              value="sepay"
                              id="sepay"
                              className="sr-only"
                            />
                            <div className="flex flex-col items-center space-y-2 text-center">
                              <QrCode className="h-6 w-6 text-primary" />
                              <span className="text-sm font-semibold">
                                VietQR (SePay)
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Quét mã chuyển khoản
                              </span>
                            </div>
                          </label>
                        </FormControl>
                      </FormItem>

                      {/* PayPal */}
                      <FormItem>
                        <FormControl>
                          <label
                            htmlFor="PayPal"
                            className="border rounded-lg p-4 cursor-pointer hover:border-primary [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5 block transition-colors"
                          >
                            <RadioGroupItem
                              value="PayPal"
                              id="PayPal"
                              className="sr-only"
                            />
                            <div className="flex flex-col items-center space-y-2 text-center">
                              <FaPaypal className="h-6 w-6 text-[#003087]" />
                              <span className="text-sm font-semibold">
                                PayPal
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Ví điện tử PayPal
                              </span>
                            </div>
                          </label>
                        </FormControl>
                      </FormItem>

                      {/* Stripe Card */}
                      <FormItem>
                        <FormControl>
                          <label
                            htmlFor="Stripe"
                            className="border rounded-lg p-4 cursor-pointer hover:border-primary [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5 block transition-colors"
                          >
                            <RadioGroupItem
                              value="Stripe"
                              id="Stripe"
                              className="sr-only"
                            />
                            <div className="flex flex-col items-center space-y-2 text-center">
                              <CreditCard className="h-6 w-6 text-muted-foreground" />
                              <span className="text-sm font-semibold">
                                Thẻ quốc tế
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Visa / MasterCard
                              </span>
                            </div>
                          </label>
                        </FormControl>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" size="lg">
              Tiếp tục kiểm tra đơn hàng
            </Button>
          </form>
        </Form>
      </div>
    </Card>
  );
}
