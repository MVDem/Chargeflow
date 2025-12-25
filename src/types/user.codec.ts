import * as t from 'io-ts';

/**
 * io-ts codec for User Geo location
 */
export const GeoCodec = t.type({
  lat: t.string,
  lng: t.string,
});

/**
 * io-ts codec for User Address
 */
export const AddressCodec = t.type({
  street: t.string,
  suite: t.string,
  city: t.string,
  zipcode: t.string,
  geo: GeoCodec,
});

/**
 * io-ts codec for User Company
 */
export const CompanyCodec = t.type({
  name: t.string,
  catchPhrase: t.string,
  bs: t.string,
});

/**
 * io-ts codec for User
 * Validates the entire User structure at runtime
 */
export const UserCodec = t.type({
  id: t.number,
  name: t.string,
  username: t.string,
  email: t.string,
  address: AddressCodec,
  phone: t.string,
  website: t.string,
  company: CompanyCodec,
});

/**
 * io-ts codec for array of Users
 */
export const UsersCodec = t.array(UserCodec);

/**
 * TypeScript type derived from io-ts codec
 * This ensures perfect sync between runtime validation and compile-time types
 */
export type User = t.TypeOf<typeof UserCodec>;

/**
 * Individual nested types for convenience
 */
export type UserAddress = t.TypeOf<typeof AddressCodec>;
export type UserGeo = t.TypeOf<typeof GeoCodec>;
export type UserCompany = t.TypeOf<typeof CompanyCodec>;
