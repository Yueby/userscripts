// 订单状态
export type OrderStatus = 'Completed' | 'Cancelled' | 'Pending';

// 支付方式
export type PaymentMethod = '信用卡' | 'PayPal' | 'Rakuten Pay' | '银行、便利店支付' | 'pixivcoban' | 'ピクシブかんたん決済';

// 订单数据结构
export interface Order {
  orderNumber: string;           // 订单号
  identificationCode: string;    // 识别码
  paymentMethod: PaymentMethod;  // 支付方式
  state: OrderStatus;            // 订单状态
  createdAt: string;             // 创建时间
  paidAt: string;               // 支付时间
  completedAt: string;          // 完成时间
  totalPrice: number;           // 总价格
  postalCode: string;           // 邮编
  prefecture: string;           // 都道府县
  city: string;                 // 市区町村、丁目、番地
  building: string;             // 公寓、建筑物名、房间号
  customerName: string;         // 姓名
  phoneNumber: string;          // 电话号码
  items: OrderItem[];           // 商品信息
}

// 订单商品
export interface OrderItem {
  itemId: string;               // 商品ID
  quantity: number;             // 数量
  name: string;                 // 商品名称
}

// 统计信息
export interface OrderStats {
  totalOrders: number;          // 总订单数
  totalRevenue: number;         // 总收入
  totalNetRevenue: number;      // 总到手收入
}

// CSV 解析结果
export interface CSVParseResult {
  success: boolean;
  data?: Order[];
  error?: string;
} 