import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

describe('OrdersService - Atomic Stock Deduction', () => {
  let service: OrdersService;
  let mockPrisma: any;
  let mockTx: any;

  beforeEach(() => {
    mockTx = {
      productVariant: {
        updateMany: jest.fn(),
        findUnique: jest.fn(),
      },
      order: {
        create: jest.fn(),
      },
    };

    mockPrisma = {
      $transaction: jest.fn((callback) => callback(mockTx)),
    };

    service = new OrdersService(mockPrisma);
  });

  it('should successfully create order and deduct stock atomically when stock is sufficient', async () => {
    const dto: CreateOrderDto = {
      orderItems: [
        {
          productId: 1,
          variantId: 10,
          name: 'Item A',
          qty: 2,
          image: '/img1.png',
          price: 100,
        },
      ],
      shippingDetails: {
        address: '123 Test St',
        city: 'Test City',
        postalCode: '10000',
        country: 'Vietnam',
      },
      paymentMethod: 'COD',
      itemsPrice: 200,
      taxPrice: 0,
      shippingPrice: 10,
      totalPrice: 210,
    };

    mockTx.productVariant.updateMany.mockResolvedValue({ count: 1 });
    mockTx.order.create.mockResolvedValue({ id: 1, ...dto });

    const result = await service.create(dto, 1);

    expect(mockTx.productVariant.updateMany).toHaveBeenCalledWith({
      where: {
        id: 10,
        countInStock: { gte: 2 },
      },
      data: {
        countInStock: { decrement: 2 },
      },
    });
    expect(mockTx.order.create).toHaveBeenCalled();
    expect(result).toHaveProperty('id', 1);
  });

  it('should throw BadRequestException and not create order when stock is insufficient', async () => {
    const dto: CreateOrderDto = {
      orderItems: [
        {
          productId: 1,
          variantId: 10,
          name: 'Item A',
          qty: 5,
          image: '/img1.png',
          price: 100,
        },
      ],
      shippingDetails: {
        address: '123 Test St',
        city: 'Test City',
        postalCode: '10000',
        country: 'Vietnam',
      },
      paymentMethod: 'COD',
      itemsPrice: 500,
      taxPrice: 0,
      shippingPrice: 10,
      totalPrice: 510,
    };

    // Simulate atomic update finding insufficient stock
    mockTx.productVariant.updateMany.mockResolvedValue({ count: 0 });
    mockTx.productVariant.findUnique.mockResolvedValue({
      sku: 'SKU-10-RED',
      countInStock: 2,
    });

    await expect(service.create(dto, 1)).rejects.toThrow(BadRequestException);
    await expect(service.create(dto, 1)).rejects.toThrow(
      'Not enough stock for variant SKU: SKU-10-RED. Available: 2, requested: 5',
    );
    expect(mockTx.order.create).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when variant does not exist', async () => {
    const dto: CreateOrderDto = {
      orderItems: [
        {
          productId: 1,
          variantId: 999,
          name: 'Item NonExistent',
          qty: 1,
          image: '/img1.png',
          price: 100,
        },
      ],
      shippingDetails: {
        address: '123 Test St',
        city: 'Test City',
        postalCode: '10000',
        country: 'Vietnam',
      },
      paymentMethod: 'COD',
      itemsPrice: 100,
      taxPrice: 0,
      shippingPrice: 10,
      totalPrice: 110,
    };

    mockTx.productVariant.updateMany.mockResolvedValue({ count: 0 });
    mockTx.productVariant.findUnique.mockResolvedValue(null);

    await expect(service.create(dto, 1)).rejects.toThrow(NotFoundException);
    expect(mockTx.order.create).not.toHaveBeenCalled();
  });

  it('should process variantIds in ascending order to prevent deadlocks', async () => {
    const dto: CreateOrderDto = {
      orderItems: [
        { productId: 1, variantId: 50, name: 'Item 50', qty: 1, image: '', price: 10 },
        { productId: 2, variantId: 10, name: 'Item 10', qty: 1, image: '', price: 20 },
        { productId: 3, variantId: 30, name: 'Item 30', qty: 1, image: '', price: 30 },
      ],
      shippingDetails: {
        address: '123 Test St',
        city: 'Test City',
        postalCode: '10000',
        country: 'Vietnam',
      },
      paymentMethod: 'COD',
      itemsPrice: 60,
      taxPrice: 0,
      shippingPrice: 10,
      totalPrice: 70,
    };

    mockTx.productVariant.updateMany.mockResolvedValue({ count: 1 });
    mockTx.order.create.mockResolvedValue({ id: 1 });

    await service.create(dto, 1);

    const calls = mockTx.productVariant.updateMany.mock.calls;
    expect(calls).toHaveLength(3);
    // Verified sorted order: 10 -> 30 -> 50
    expect(calls[0][0].where.id).toBe(10);
    expect(calls[1][0].where.id).toBe(30);
    expect(calls[2][0].where.id).toBe(50);
  });
});
