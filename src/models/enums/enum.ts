enum Role {
    USER = "user",
    ADMIN = "admin"
}

enum CategoryType {
    PRODUCT = "product",
    BLOG = "blog",
    BRAND = "brand"
}

type ImageResponse = {
    url: string,
    publicId: string
}


export {
    Role, CategoryType, ImageResponse
}