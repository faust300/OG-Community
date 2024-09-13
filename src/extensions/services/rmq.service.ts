import { Injectable, OnModuleInit } from '@nestjs/common';
import { createJsonTypeInstance, AMQModule } from 'amqmodule';
import { TestRMQInstance } from '../../libs/TestRMQInstance';

export enum ActKey {
  USER_SIGNUP = 'og.community.act.u.001',
  USER_SIGNIN = 'og.community.act.u.002',
  USER_REFERRAL = 'og.community.act.u.003',
  USER_SET_WIDGET = 'og.community.act.u.004',
  USER_SET_NICKNAME = 'og.community.act.u.005',
  USER_SET_IMAGE = 'og.community.act.u.006',
  USER_SET_BIO = 'og.community.act.u.007',
  USER_SET_CUSTOM_TOPIC = 'og.community.act.u.008',
  USER_USE_BOX = 'og.community.act.u.009',
  USER_USE_ITEM = 'og.community.act.u.010',
  USER_USE_POINT = 'og.community.act.u.011',
  USER_CONENCT_EXCHANGE = 'og.community.act.u.012',
  USER_SIGNIN_FAIL = 'og.community.act.u.013',
	USER_PASSWORD_RESET_FAIL = 'og.community.act.u.014',
	USER_PASSWORD_CHANGE_FAIL = 'og.community.act.u.015',
	USER_PASSWORD_RESET_SUCCESS = 'og.community.act.u.016',
	USER_PASSWORD_CHANGE_SUCCESS = 'og.community.act.u.017',

  USER_FOLLOW = 'og.community.act.u.018',
  USER_UNFOLLOW = 'og.community.act.u.019',
  USER_FOLLOW_BACK = 'og.community.act.u.020', // each follow back
  USER_REPORT = 'og.community.act.u.021',

  USER_INVITE_SIGNUP = 'og.community.act.u.022',

  COMMUNITY_VIEW_POST = 'og.community.act.c.001',
  COMMUNITY_CREATE_POST = 'og.community.act.c.002',
  COMMUNITY_CREATE_COMMENT = 'og.community.act.c.003',
  COMMUNITY_VOTE_POST = 'og.community.act.c.004',
  COMMUNITY_VOTE_COMMENT = 'og.community.act.c.005',
  COMMUNITY_REPORT_POST = 'og.community.act.c.006',
  COMMUNITY_REPORT_COMMENT = 'og.community.act.c.007',
  COMMUNITY_SEARCH = 'og.community.act.c.008',

  COMMUNITY_ADMIN_DELETE_POST = 'og.community.act.c.011',
  COMMUNITY_ADMIN_DELETE_COMMENT = 'og.community.act.c.012',
  COMMUNITY_SHOUT = 'og.community.shout'

}

export enum PlayGroundActKey {
  SIGNIN = "og.playground.001",
  SIGNIN_ENCOURAGE = "og.playground.002",
  CHEKIN = "og.playground.003",
  CHEKIN_STREAK = "og.playground.004",
  DAILY_ORDER = "og.playground.005",
  OVER_LEVERAGE = "og.playground.006",
  LESS_LEVERAGE = "og.playground.007",
  WON_ROI = "og.playground.008",
  CREATE_POST = "og.playground.009",
  CREATE_COMMENT = "og.playground.010",
  VOTE_POST = "og.playground.011",
  PICK_POST = "og.playground.012",
  PICK_COMMENT = "og.playground.013",
}

@Injectable()
export class RMQService implements OnModuleInit {
  public instance: AMQModule<any>;
  public testInstance: TestRMQInstance;

  async onModuleInit() {
    if (process.env.NODE_ENV === 'test') {
      this.testInstance = new TestRMQInstance();
    } else {
      this.instance = await createJsonTypeInstance({
        host: String(process.env.MQ_HOST),
        id: String(process.env.MQ_ID),
        pw: String(process.env.MQ_PW),
        port: parseInt(String(process.env.MQ_PORT)),
      });
      this.instance.setExchange(process.env.MQ_EXCHANGE);
    }
  }

  async publish(queue: ActKey | PlayGroundActKey, userId: number, payload?: any, exchange?: string) {
    if (process.env.NODE_ENV === 'test') {
      return this.testInstance.publish(String(queue), {
        ...{ userId },
        ...payload,
      });
    } else {

      this.instance.publish(String(queue), {
        ...{ userId },
        ...payload,
      }, exchange ?? process.env.MQ_EXCHANGE);
    }
  }
}
