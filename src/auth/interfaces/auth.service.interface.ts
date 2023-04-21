import { FriendRequestEntity, UserEntity, UserJwt } from 'src/shared'
import { ExistingUserDto } from '../dto/existing-user.dto'

import { NewUserDto } from '../dto/new-user.dto'

export interface AuthServiceInterface {
  getUsers(): Promise<UserEntity[]>
  createJwt(user: any): Promise<{
    token: string
  }>
  findByEmail(email: string): Promise<UserEntity>
  findById(id: number): Promise<UserEntity>
  hashPassword(password: string): Promise<string>
  register(newUser: Readonly<NewUserDto>): Promise<UserEntity>
  doesPasswordMatch(password: string, hashedPassword: string): Promise<boolean>
  validateUser(email: string, password: string): Promise<UserEntity>
  login(existingUser: Readonly<ExistingUserDto>): Promise<{
    token: string
    user: UserEntity
  }>
  verifyJwt(jwt: string): Promise<{ user: UserEntity; exp: number }>
  getUserFromHeader(jwt: string): Promise<UserJwt>
  addFriend(userId: number, friendId: number): Promise<FriendRequestEntity>
  getFriends(userId: number): Promise<FriendRequestEntity[]>
}
