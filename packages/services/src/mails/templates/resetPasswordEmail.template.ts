export const resetPasswordEmailTemplate = (resetLink: string) => {
	return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f4f4f4; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 50px auto; padding: 20px; background-color: #ffffff; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <h1 style="margin: 0 0 16px; color: #333333;">Reset Your Password</h1>
        <p style="margin: 0 0 16px; color: #555555; line-height: 1.6;">We received a request to reset your password. Click the button below to reset it:</p>
        <a href="${resetLink}" style="display: inline-block; margin-top: 4px; padding: 10px 20px; border-radius: 5px; background-color: #007bff; color: #ffffff; text-decoration: none;">Reset Password</a>
        <p style="margin: 20px 0 0; color: #555555; line-height: 1.6;">If you did not request a password reset, please ignore this email.</p>
      </div>
    </body>
  </html>`;
};
