export function generateForgotPasswordEmailTemplate({
  resetPasswordUrl,
  resetToken,
  userName = "yashrana",
  appName = "Project Management System",
  supportEmail = "yashrana097@gmail.com",
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Reset Password</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; padding:30px;">

          <tr>
            <td style="text-align:center;">
              <h2 style="color:#111827;">Reset Your Password</h2>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 0; color:#374151; font-size:15px;">
              Hi <strong>${userName}</strong>,<br/><br/>
              We received a request to reset your password.
              This link is valid for <strong>15 minutes</strong>.
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:20px 0;">
              <a href="${resetPasswordUrl}"
                style="background:#4f46e5;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">
                Reset Password
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding-top:20px;font-size:14px;">
              Or copy this token manually:
            </td>
          </tr>

          <tr>
            <td style="background:#f9fafb;border:1px dashed #d1d5db;padding:12px;font-family:monospace;">
              ${resetToken}
            </td>
          </tr>

          <tr>
            <td style="padding-top:30px;color:#9ca3af;font-size:13px;">
              Thanks,<br/>
              <strong>${appName} Team</strong><br/>
              <a href="mailto:${supportEmail}">${supportEmail}</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export function generateRequestAcceptTemplate({
  studentName = "Student",
  supervisorName,
  appName = "FYP Management System",
  supportEmail = "yashrana097@gmail.com",
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Supervisor Request Accepted</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff; border-radius:8px; padding:30px;">

          <tr>
            <td style="text-align:center;">
              <h2 style="color:#16a34a;">Supervisor Request Accepted ✅</h2>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 0; color:#374151; font-size:15px;">
              Hi <strong>${studentName}</strong>,<br/><br/>
              Your supervisor request has been <strong>accepted</strong> by:
            </td>
          </tr>

          <tr>
            <td style="padding:12px; background:#f0fdf4; border-radius:6px;
                       color:#166534; font-size:16px; font-weight:bold;">
              ${supervisorName}
            </td>
          </tr>

          <tr>
            <td style="padding-top:20px;color:#374151;font-size:15px;">
              You can now proceed with your project and start working under
              the guidance of your supervisor.
            </td>
          </tr>

          <tr>
            <td style="padding-top:30px;color:#9ca3af;font-size:13px;">
              Regards,<br/>
              <strong>${appName} Team</strong><br/>
              <a href="mailto:${supportEmail}">${supportEmail}</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export function generateRequestRejectTemplate({
  studentName = "Student",
  supervisorName,
  appName = "FYP Management System",
  supportEmail = "yashrana097@gmail.com",
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Supervisor Request Rejected</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff; border-radius:8px; padding:30px;">

          <tr>
            <td style="text-align:center;">
              <h2 style="color:#dc2626;">Supervisor Request Rejected ❌</h2>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 0; color:#374151; font-size:15px;">
              Hi <strong>${studentName}</strong>,<br/><br/>
              We regret to inform you that your supervisor request has been
              <strong>rejected</strong>.
            </td>
          </tr>

          <tr>
            <td style="padding:12px; background:#fef2f2; border-radius:6px;
                       color:#991b1b; font-size:16px; font-weight:bold;">
              Decision by: ${supervisorName}
            </td>
          </tr>

          <tr>
            <td style="padding-top:20px; color:#374151; font-size:15px;">
              You may submit a new request to another supervisor or contact
              the department for further guidance.
            </td>
          </tr>

          <tr>
            <td style="padding-top:30px; color:#9ca3af; font-size:13px;">
              Regards,<br/>
              <strong>${appName} Team</strong><br/>
              <a href="mailto:${supportEmail}">${supportEmail}</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
