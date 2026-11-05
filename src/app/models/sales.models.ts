export interface Product {
  id: number;
  name: string;
  price: string | number;
  stock: number;
  image: string | null;
}

export interface SaleDetail {
  product: string | null;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  total: number;
  created_at: string | null;
  details: SaleDetail[];
}

export interface SaleItemRequest {
  product_id: number;
  quantity: number;
}

export interface CreateSaleRequest {
  items: SaleItemRequest[];
}

export interface CreateSaleResponse {
  message: string;
  sale_id: number;
  total: number;
}

export interface ApiMessage {
  message: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
