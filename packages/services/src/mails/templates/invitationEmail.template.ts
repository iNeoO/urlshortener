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
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #333333;
        }
        p {
          color: #555555;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          margin-top: 20px;
          background-color: #007bff;
          color: #ffffff;
          text-decoration: none;
          border-radius: 4px;
        }
        .button:hover {
          background-color: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>You've been invited to join the group ${groupName}!</h1>
        <p>${inviterName} has invited you to join the group. Please click the button below to accept the invitation:</p>
        <a href="${env.FRONTEND_URL}" class="button">Accept Invitation</a>
        <p>If you did not expect this invitation, please ignore this email.</p>
      </div>
    </body>
  </html>
`;
