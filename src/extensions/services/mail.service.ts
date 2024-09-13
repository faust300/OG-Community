import { Injectable, OnModuleInit } from '@nestjs/common';
import { MailService as SendGridMailService } from '@sendgrid/mail';
import { OGException } from '../exception/exception.filter';

export interface MailContent {
  type: string;
  value: string;
}

@Injectable()
export default class MailService implements OnModuleInit {
  private client: SendGridMailService;

  onModuleInit() {
    this.client = new SendGridMailService();
    this.client.setApiKey(process.env.SENDGRID_API_KEY);
  }

  private defaultHeader(email: string) {
    return {
      personalizations: [
        {
          to: [
            {
              email: 'no-reply@og.xyz'
            }
          ],
          bcc: email
        }
      ],
      from: {
        email: 'cs@og.xyz',
        name: 'OG'
      }
    };
  }

  private multipleHeader(emails: Array<string>) {
    return {
      personalizations: [
        {
          to: [{
            email: 'no-reply@og.xyz'
          }],
          bcc: emails.map((email: string) => {
            return {
              email: email
            }
          })
        }
      ],
      from: {
        email: 'cs@og.xyz',
        name: 'OG'
      }
    };
  }

  async sendEmail(to: string, subject: string, content: MailContent) {
    try {
      await this.client.send({
        ...this.defaultHeader(to),
        subject: subject,
        content: [content]
      });
    } catch (error) {
      console.error(error);
      console.error(error.response.body.errors);
      throw new OGException(
        {
          errorCode: -110,
          errorMessage: 'Twilio Send Email Error.'
        },
        500
      );
    }
  }

  async sendEmailWithReservation(to: string, subject: string, content: MailContent, sendAt: number) {
    try {
      await this.client.send({
        ...this.defaultHeader(to),
        subject: subject,
        content: [content],
        sendAt
      });
      console.log(`🎃 Complete send email : ${to}`)
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async sendEmailWithoutUnsubscribe(to: Array<string>, subject: string, content: MailContent, sendAt: number) {
    try {
      await this.client.send({
        ...this.multipleHeader(to),
        subject: subject,
        content: [content],
        sendAt
      });
      console.log(`🎃 Complete send email : ${to}`)
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
