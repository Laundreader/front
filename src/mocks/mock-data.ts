import { base, ko, en, Faker } from "@faker-js/faker";

export const mockData = new Faker({
	locale: [ko, en, base],
});
