import { Module } from '@nestjs/common';
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSigninFailHistory } from 'src/sign/entities/user-signin-fail-history.entity';
import { UserPasswordFailHistory } from 'src/user/entities/password-fail-history/user-password-fail-history.entity';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AppleStrategy } from './strategies/apple.strategy';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET_KEY ?? "Password",
        signOptions: { expiresIn: '86400s' }
      })
    }),
    PassportModule,
    TypeOrmModule.forFeature([
      User,
      UserSigninFailHistory,
      UserPasswordFailHistory,
    ])
  ],
  controllers: [],
  providers: [
    AuthService,
    JwtStrategy,
    AppleStrategy,
  ],
  exports: [
    AuthService,
  ],
})
export class AuthModule { }