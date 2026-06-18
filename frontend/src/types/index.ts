export interface Category {
  id: number
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  subcategories?: Subcategory[]
}

export interface Subcategory {
  id: number
  categoryId?: number
  name: string
  description?: string
}

export interface Product {
  id: number
  name: string
  sku?: string
  description?: string
  subcategoryId: number
  subcategoryName: string
  categoryId: number
  categoryName: string
  unitOfMeasureId: number
  unitOfMeasureName: string
  unitOfMeasureAbbr: string
  unitPrice: number
  reorderLevel: number
  currentStock: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductRequest {
  subcategoryId: number
  name: string
  sku?: string
  description?: string
  unitOfMeasureId: number
  unitPrice: string
  reorderLevel: string
}

export interface PagedResponse<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
}

export interface Supplier {
  id: number
  name: string
  contactPerson?: string
  phone?: string
  email?: string
  address?: string
  active: boolean
  createdAt: string
}

export interface SupplierRequest {
  name: string
  contactPerson?: string
  phone?: string
  email?: string
  address?: string
  active?: boolean
}

export interface Batch {
  id: number
  productId: number
  batchCode: string
  qtyReceived: number
  qtyRemaining: number
  expiryDate?: string
  receivedDate: string
  supplierId?: number
}

export interface PurchaseOrder {
  id: number
  poNumber: string
  supplierId: number
  supplierName: string
  status: 'PENDING' | 'APPROVED' | 'RECEIVED' | 'CANCELLED'
  orderDate: string
  expectedDate?: string
  notes?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
  items: PurchaseOrderItem[]
}

export interface PurchaseOrderItem {
  id: number
  productId: number
  productName: string
  productSku: string
  productUomAbbr: string
  qtyOrdered: number
  qtyReceived: number
  unitPrice: number
  totalPrice: number
}

export interface PurchaseOrderRequest {
  supplierId: number
  orderDate?: string
  expectedDate?: string
  notes?: string
  items: { productId: number; qtyOrdered: string; unitPrice: string }[]
}

export interface StockMovement {
  id: number
  productId: number
  productName: string
  productSku: string
  productUomAbbr: string
  batchId?: number
  batchCode?: string
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  referenceType?: string
  referenceId?: number
  notes?: string
  createdBy?: string
  createdAt: string
}

export interface StockMovementRequest {
  productId: number
  batchId?: number
  movementType: string
  quantity: string
  notes?: string
}

export interface User {
  id?: number
  username: string
  displayName: string
  email?: string
  roles: string[]
}

export interface UnitOfMeasure {
  id: number
  name: string
  abbreviation: string
}
