import { env } from "@urlshortener/infra/configs";

export const invitationEmailTemplate = (
	groupName: string,
	inviterName: string,
) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Invitation to Join Group</title>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f4f4f4; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <h1 style="margin: 0 0 16px; color: #333333;">You've been invited to join the group ${groupName}!</h1>
        <p style="margin: 0 0 16px; color: #555555; line-height: 1.6;">${inviterName} has invited you to join the group. Please click the button below to accept the invitation:</p>
        <a href="${env.FRONTEND_URL}" style="display: inline-block; margin-top: 4px; padding: 10px 20px; border-radius: 4px; background-color: #007bff; color: #ffffff; text-decoration: none;">Accept Invitation</a>
        <p style="margin: 20px 0 0; color: #555555; line-height: 1.6;">If you did not expect this invitation, please ignore this email.</p>
      </div>
    </body>
  </html>
`;
