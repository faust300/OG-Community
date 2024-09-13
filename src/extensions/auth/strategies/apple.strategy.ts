import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';


@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple'){
    constructor(
        private jwtService: JwtService,
    ) {
        super({
            clientID: process.env.APPLE_CLIENT_ID,
            teamID: process.env.APPLE_TEAM_ID,
            callbackURL: process.env.APPLE_CALLBACK_URL,
            keyID: process.env.APPLE_KEY_ID,
            privateKeyLocation: process.env.APPLE_PRIVATE_KEY_LOCATION,
            passReqToCallback: true,
            scope: 'name%20email',
            response_type: 'code%20id_token',
        })
    }

    async validate(request: any, accessToken: string, refreshToken: string, profile, done: any) {
        try {
            const { id_token, user, state } = request.body;
            const profile: any = await this.jwtService.decode(id_token);
            const payload = {
                name: user?.name ?? null,
                email: profile.email,
                appleId: profile.sub,
                socialType: 'apple',
                deviceUid: null,
                state,
            };

            const account = {
                user: payload
            };

            done(null, account);
        } catch (err) {
            console.error(err);
            done(err, false);
        }
    }
}