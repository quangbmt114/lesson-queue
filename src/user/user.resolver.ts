import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User, CreateUserInput, UpdateUserInput, UserRole } from './dto';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User])
  async users() {
    return this.userService.findAll();
  }

  @Query(() => User)
  async user(@Args('id') id: string) {
    return this.userService.findOne(id);
  }

  @Query(() => [User])
  async usersByRole(@Args('role') role: UserRole) {
    return this.userService.findByRole(role);
  }

  @Query(() => [User])
  async shopOwners() {
    return this.userService.findByRole(UserRole.SHOP_OWNER);
  }

  @Query(() => [User])
  async customers() {
    return this.userService.findByRole(UserRole.CUSTOMER);
  }

  @Mutation(() => User)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  @Mutation(() => User)
  async updateUser(
    @Args('id') id: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ) {
    return this.userService.update(id, updateUserInput);
  }

  @Mutation(() => Boolean)
  async removeUser(@Args('id') id: string) {
    return this.userService.remove(id);
  }
}
