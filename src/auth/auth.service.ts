import {
  ConflictException,
  Injectable,
  Inject,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import * as bcrypt from 'bcrypt'

import { UserEntity, UserJwt, UserRepositoryInterface } from 'src/shared'
import { AuthServiceInterface } from './interfaces/auth.service.interface'
import { NewUserDto } from './dto/new-user.dto'
import { ExistingUserDto } from './dto/existing-user.dto'

@Injectable()
export class AuthService implements AuthServiceInterface {
  constructor(
    @Inject('UsersRepositoryInterface')
    private readonly usersRepository: UserRepositoryInterface,
    private readonly jwtService: JwtService
  ) {}
  //----------------------------------used in retos service-----------------------------------

  async createJwt(user: any): Promise<{ token: string }> {
    const jwt = await this.jwtService.signAsync({ user })
    return { token: jwt }
  }
  //------------------------------------------------------------------------------------------
  async getUsers(): Promise<any> {
    //return await this.usersRepository.findAll();
    return 'aaaaa'
  }

  async findByEmail(email: string): Promise<UserEntity> {
    return this.usersRepository.findByCondition({
      where: { email },
      select: ['id', 'firstName', 'lastName', 'email'],
    })
  }

  async findById(id: number): Promise<UserEntity> {
    return this.usersRepository.findOneById(id)
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  async register(newUser: Readonly<NewUserDto>): Promise<UserEntity> {
    const { firstName, lastName, email, password } = newUser

    const existingUser = await this.findByEmail(email)

    if (existingUser) {
      throw new ConflictException('An account with that email already exists!')
    }

    const hashedPassword = await this.hashPassword(password)

    const savedUser = await this.usersRepository.save({
      firstName,
      lastName,
      email,
    })

    return savedUser
  }

  async doesPasswordMatch(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  async validateUser(email: string): Promise<UserEntity> {
    const user = await this.findByEmail(email)

    const doesUserExist = !!user

    if (!doesUserExist) return null

    return user
  }

  async login(existingUser: Readonly<ExistingUserDto>) {
    const { email, password } = existingUser
    const user = await this.validateUser(email)

    if (!user) {
      throw new UnauthorizedException()
    }

    const jwt = await this.jwtService.signAsync({ user })

    return { token: jwt, user }
  }

  async verifyJwt(jwt: string): Promise<any> {
    if (!jwt) {
      throw new UnauthorizedException()
    }
    try {
      const datajwt = await this.jwtService.verifyAsync(jwt)
      return datajwt
    } catch (error) {
      throw new UnauthorizedException()
    }
  }

  async getUserFromHeader(jwt: string): Promise<UserJwt> {
    if (!jwt) return

    try {
      return this.jwtService.decode(jwt) as any
    } catch (error) {
      throw new BadRequestException()
    }
  }
}
