import {faker} from "@faker-js/faker";
import slugify from "slugify";

const createFakeProduct = (): object => {
    const title: string = faker.commerce.productName();
    return {
        title: title,
        slug: slugify(title),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price(),
        category: faker.commerce.department(),
        brand: faker.commerce.productAdjective(),
        quantity: faker.number.int({max: 120}),
        sold: faker.number.int({max: 300}),
        images: [faker.image.urlPicsumPhotos()],
        color: faker.color.human(),
        ratings: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
}

export const productSeeders = (amount: number): Object[] => {
    return faker.helpers.multiple(createFakeProduct, {count: amount});
}
