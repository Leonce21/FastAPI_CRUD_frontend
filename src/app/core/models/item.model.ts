export interface ItemBase {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category?: string;
}

export interface ItemCreate extends ItemBase {}

export interface ItemUpdate {
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  category?: string;
}

export interface ItemInDB extends ItemBase {
  _id: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ItemsListResponse extends ApiResponse<ItemInDB[]> {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}