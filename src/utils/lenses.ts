import { Lens } from 'monocle-ts';
import type { User } from '../types/user.codec';
import type { Todo } from '../types/todo.codec';

/**
 * Lenses for User type
 * Provides immutable updates for nested User properties
 */
export const UserLens = {
  /**
   * Lens for user name
   */
  name: Lens.fromPath<User>()(['name']),

  /**
   * Lens for user username
   */
  username: Lens.fromPath<User>()(['username']),

  /**
   * Lens for user email
   */
  email: Lens.fromPath<User>()(['email']),

  /**
   * Lens for user phone
   */
  phone: Lens.fromPath<User>()(['phone']),

  /**
   * Lens for user website
   */
  website: Lens.fromPath<User>()(['website']),

  /**
   * Lens for user city (nested in address)
   */
  city: Lens.fromPath<User>()(['address', 'city']),

  /**
   * Lens for user street (nested in address)
   */
  street: Lens.fromPath<User>()(['address', 'street']),

  /**
   * Lens for user suite (nested in address)
   */
  suite: Lens.fromPath<User>()(['address', 'suite']),

  /**
   * Lens for user zipcode (nested in address)
   */
  zipcode: Lens.fromPath<User>()(['address', 'zipcode']),

  /**
   * Lens for company name (nested in company)
   */
  companyName: Lens.fromPath<User>()(['company', 'name']),

  /**
   * Lens for company catchPhrase (nested in company)
   */
  companyCatchPhrase: Lens.fromPath<User>()(['company', 'catchPhrase']),

  /**
   * Lens for company bs (nested in company)
   */
  companyBs: Lens.fromPath<User>()(['company', 'bs']),

  /**
   * Lens for geo latitude (deeply nested)
   */
  geoLat: Lens.fromPath<User>()(['address', 'geo', 'lat']),

  /**
   * Lens for geo longitude (deeply nested)
   */
  geoLng: Lens.fromPath<User>()(['address', 'geo', 'lng']),
};

/**
 * Lenses for Todo type
 * Provides immutable updates for Todo properties
 */
export const TodoLens = {
  /**
   * Lens for todo title
   */
  title: Lens.fromPath<Todo>()(['title']),

  /**
   * Lens for todo completed status
   */
  completed: Lens.fromPath<Todo>()(['completed']),

  /**
   * Lens for todo userId
   */
  userId: Lens.fromPath<Todo>()(['userId']),

  /**
   * Lens for todo id
   */
  id: Lens.fromPath<Todo>()(['id']),
};

/**
 * Example usage:
 *
 * // Update city
 * const updatedUser = UserLens.city.set('New York')(user);
 *
 * // Modify company name
 * const updatedUser = UserLens.companyName.modify(name => name.toUpperCase())(user);
 *
 * // Toggle todo completion
 * const updatedTodo = TodoLens.completed.modify(c => !c)(todo);
 *
 * // Chain multiple lens operations
 * const updatedUser = pipe(
 *   user,
 *   UserLens.city.set('Los Angeles'),
 *   UserLens.companyName.modify(name => name.toUpperCase())
 * );
 */
