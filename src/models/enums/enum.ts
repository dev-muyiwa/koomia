enum Role {
    USER = "user",
    ADMIN = "admin"
}

enum CategoryType {
    PRODUCT = "product",
    BLOG = "blog",
    BRAND = "brand"
}

enum VariantType {
    COLOR = "color",
    SIZE = "size"
}

enum OrderStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}

enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    FAILED = "failed",
    CANCELLED = "cancelled"
}


export {
    Role, CategoryType, VariantType, OrderStatus, PaymentStatus
}