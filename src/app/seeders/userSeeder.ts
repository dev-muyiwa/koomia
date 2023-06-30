import {faker} from "@faker-js/faker";
import bcrypt from "bcrypt";

const createFakeUser = (): object => {
    const password = faker.internet.password()
    return {
        first_name: faker.person.firstName(),
        last_name: password,
        email: faker.internet.email(),
        mobile: faker.phone.number(),
        role: "user",
        is_blocked: false,
        password: bcrypt.hash(password, 10),
        cart: [],
        address: [],
        wishlist: [],
        refresh_token: null,
        password_updated_at: null,
        password_reset_token: null,
        password_token_expiration: null,
        createdAt: {$gt: Date.now()},
        updatedAt: {$gt: Date.now()},
    };
}

export const userSeeders = (amount: number): Object[] => {
    return faker.helpers.multiple(createFakeUser, {count: amount});
}
