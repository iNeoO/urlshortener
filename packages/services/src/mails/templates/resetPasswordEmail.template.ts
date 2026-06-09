export const resetPasswordEmailTemplate = (resetLink: string) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset your password — UrlShortener</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 48px 20px;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; width: 100%;">

            <!-- Logo / wordmark -->
            <tr>
              <td style="padding-bottom: 20px;">
                <span style="font-size: 15px; font-weight: 700; color: #2563eb; letter-spacing: 0.02em;">UrlShortener</span>
              </td>
            </tr>

            <!-- Card -->
            <tr>
              <td style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; border-top: 4px solid #2563eb;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding: 36px 36px 32px;">

                      <h1 style="margin: 0 0 12px; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                        Reset your password
                      </h1>
                      <p style="margin: 0 0 8px; font-size: 15px; color: #475569; line-height: 1.7;">
                        We received a request to reset the password for your account. Click the button below to choose a new one.
                      </p>
                      <p style="margin: 0 0 28px; font-size: 15px; color: #475569; line-height: 1.7;">
                        This link expires in <strong style="color: #0f172a;">1 hour</strong>.
                      </p>

                      <!-- CTA -->
                      <a href="${resetLink}"
                        style="display: inline-block; padding: 13px 28px; background-color: #2563eb; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; letter-spacing: 0.01em;">
                        Reset my password
                      </a>

                      <!-- Fallback link -->
                      <p style="margin: 24px 0 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">
                        If the button doesn't work, copy and paste this link into your browser:<br />
                        <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
                      </p>

                      <!-- Divider + note -->
                      <p style="margin: 24px 0 0; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 13px; color: #94a3b8; line-height: 1.6;">
                        If you didn't request a password reset, you can safely ignore this email. Your password will not change.
                      </p>

                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 24px 0 0; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.8;">
                  UrlShortener · Open source URL shortener
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
