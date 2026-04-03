export const validationEmailTemplate = (validationLink: string) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Validate Your Email</title>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f4f4f4; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <h1 style="margin: 0 0 16px; color: #333333;">Welcome to URL Shortener!</h1>
        <p style="margin: 0 0 16px; color: #555555; line-height: 1.6;">Thank you for signing up. Please click the button below to validate your email address:</p>
        <a href="${validationLink}" style="display: inline-block; margin-top: 4px; padding: 10px 20px; border-radius: 4px; background-color: #007bff; color: #ffffff; text-decoration: none;">Validate Email</a>
        <p style="margin: 20px 0 0; color: #555555; line-height: 1.6;">If you did not sign up for this account, please ignore this email.</p>
      </div>
    </body>
  </html>
`;
