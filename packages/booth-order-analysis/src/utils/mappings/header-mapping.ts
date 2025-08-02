// 表头字段映射
export interface HeaderMapping {
  orderNumber: string[];
  identificationCode: string[];
  paymentMethod: string[];
  state: string[];
  createdAt: string[];
  paidAt: string[];
  completedAt: string[];
  totalPrice: string[];
  postalCode: string[];
  prefecture: string[];
  city: string[];
  building: string[];
  customerName: string[];
  phoneNumber: string[];
  items: string[];
}

// 多语言表头映射（基于真实CSV文件）
export const HEADER_MAPPING: HeaderMapping = {
  // 英文: Order Number
  // 日文: 注文番号
  // 简体中文: Order Number (保持英文)
  // 繁体中文: Order Number (保持英文)
  // 韩文: Order Number (保持英文)
  orderNumber: ['Order Number', '注文番号'],

  // 英文: Identification Code
  // 日文: ユーザー識別コード
  // 简体中文: Identification Code (保持英文)
  // 繁体中文: Identification Code (保持英文)
  // 韩文: Identification Code (保持英文)
  identificationCode: ['Identification Code', 'ユーザー識別コード'],

  // 英文: Payment type
  // 日文: お支払方法
  // 简体中文: 支付方式
  // 繁体中文: 支付方式
  // 韩文: 신용카드 (但这里应该是支付方式)
  paymentMethod: ['Payment type', 'お支払方法', '支付方式', '신용카드'],

  // 英文: State
  // 日文: 注文状況
  // 简体中文: State (保持英文)
  // 繁体中文: State (保持英文)
  // 韩文: State (保持英文)
  state: ['State', '注文状況'],

  // 英文: Created At
  // 日文: 注文日時
  // 简体中文: Created At (保持英文)
  // 繁体中文: Created At (保持英文)
  // 韩文: Created At (保持英文)
  createdAt: ['Created At', '注文日時'],

  // 英文: Paid At
  // 日文: 支払い日時
  // 简体中文: Paid At (保持英文)
  // 繁体中文: Paid At (保持英文)
  // 韩文: Paid At (保持英文)
  paidAt: ['Paid At', '支払い日時'],

  // 英文: Completed At
  // 日文: 発送日時
  // 简体中文: Completed At (保持英文)
  // 繁体中文: Completed At (保持英文)
  // 韩文: Completed At (保持英文)
  completedAt: ['Completed At', '発送日時'],

  // 英文: Total Price
  // 日文: 合計金額
  // 简体中文: Total Price (保持英文)
  // 繁体中文: Total Price (保持英文)
  // 韩文: Total Price (保持英文)
  totalPrice: ['Total Price', '合計金額'],

  // 英文: ZIP code
  // 日文: 郵便番号
  // 简体中文: 邮编
  // 繁体中文: 郵編
  // 韩文: 우편번호
  postalCode: ['ZIP code', '郵便番号', '邮编', '郵編', '우편번호'],

  // 英文: State / Province / Region / Prefecture
  // 日文: 都道府県
  // 简体中文: 都道府县
  // 繁体中文: 都道府縣
  // 韩文: 도도부현(광역 주소)
  prefecture: ['State / Province / Region / Prefecture', '都道府県', '都道府县', '都道府縣', '도도부현(광역 주소)'],

  // 英文: Address Line 1
  // 日文: 市区町村・丁目・番地
  // 简体中文: 市区町村、丁目、番地
  // 繁体中文: 市區釘村、丁目、番地
  // 韩文: 시구정촌·초메·번지(상세 주소)
  city: ['Address Line 1', '市区町村・丁目・番地', '市区町村、丁目、番地', '市區釘村、丁目、番地', '시구정촌·초메·번지(상세 주소)'],

  // 英文: Address Line 2
  // 日文: マンション・建物名・部屋番号
  // 简体中文: 公寓、建筑物名、房间号
  // 繁体中文: 公寓、建築物名、房間號
  // 韩文: 아파트 건물명 호수
  building: ['Address Line 2', 'マンション・建物名・部屋番号', '公寓、建筑物名、房间号', '公寓、建築物名、房間號', '아파트 건물명 호수'],

  // 英文: Name
  // 日文: 氏名
  // 简体中文: 姓名
  // 繁体中文: 姓名
  // 韩文: 이름
  customerName: ['Name', '氏名', '姓名', '이름'],

  // 英文: Phone number
  // 日文: 電話番号
  // 简体中文: 电话号码
  // 繁体中文: 電話號碼
  // 韩文: 전화번호
  phoneNumber: ['Phone number', '電話番号', '电话号码', '電話號碼', '전화번호'],

  // 英文: Item ID / Quantity / Name
  // 日文: 商品ID / 数量 / 商品名
  // 简体中文: Item ID / Quantity / Name (保持英文)
  // 繁体中文: Item ID / Quantity / Name (保持英文)
  // 韩文: Item ID / Quantity / Name (保持英文)
  items: ['Item ID / Quantity / Name', '商品ID / 数量 / 商品名']
};

// 商品信息解析模式（多语言）
export const ITEM_PATTERNS = [
  // 英文模式
  /Item ID : (\d+) \/ Quantity : (\d+) \/ (.+)/,
  // 日文模式
  /商品ID : (\d+) \/ 数量 : (\d+) \/ (.+)/,
  // 通用模式（尝试匹配数字和文本）
  /(\d+) \/ (\d+) \/ (.+)/
];

// 查找表头字段
export function findHeaderField(headers: string[], field: keyof HeaderMapping): string | null {
  const possibleHeaders = HEADER_MAPPING[field];
  
  for (const header of headers) {
    if (possibleHeaders.includes(header)) {
      return header;
    }
  }
  
  return null;
}

// 解析商品信息（支持多语言）
export function parseItemsMultiLanguage(itemString: string): Array<{ itemId: string; quantity: number; name: string }> {
  const items: Array<{ itemId: string; quantity: number; name: string }> = [];
  
  if (!itemString) return items;

  const itemLines = itemString.split('\n').filter(line => line.trim());
  
  for (const line of itemLines) {
    for (const pattern of ITEM_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        items.push({
          itemId: match[1],
          quantity: parseInt(match[2], 10),
          name: match[3].trim()
        });
        break; // 找到匹配就跳出
      }
    }
  }

  return items;
} 