import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendVerificationEmail(
    email: string,
    username: string,
    token: string,
  ): Promise<void> {
    const clientUrl = this.configService.get<string>('CLIENT_URL', 'http://localhost:3000');
    const verificationUrl = `${clientUrl}/v1/auth/verify-email?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '🔐 Verify Your Email Address',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px;">Welcome, ${username}! 👋</h1>
              <p style="color: #e8e0f0; margin: 0; font-size: 16px;">Thanks for signing up. Please verify your email to continue.</p>
            </div>
            <div style="padding: 30px 0; text-align: center;">
              <p style="color: #4a4a4a; font-size: 15px; line-height: 1.6;">
                Click the button below to verify your email address and activate your account.
              </p>
              <a href="${verificationUrl}"
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; margin: 20px 0;">
                ✅ Verify Email
              </a>
              <p style="color: #888; font-size: 13px; margin-top: 20px;">
                This link will expire in <strong>24 hours</strong>.
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
              <p style="color: #aaa; font-size: 12px;">
                If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
          </div>
        `,
      });
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      // Log the verification URL so the user can still verify manually during development
      this.logger.warn(`Verification URL (fallback): ${verificationUrl}`);
    }
  }
}
