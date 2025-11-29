import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(userEmail, userName) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'OpenPools <hi@openpools.in>',
      to: userEmail,
      subject: 'You just unlocked openpools.in',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

              <!-- Logo -->
              <div style="margin-bottom: 32px; text-align: center;">
                <img src="https://openpools.in/email-logo.jpg" alt="OpenPools" style="max-width: 180px; height: auto;" />
              </div>

              <!-- Content -->
              <div style="margin-bottom: 30px;">
                <h2 style="color: #1f2937; margin: 0 0 8px 0; font-size: 18px; font-weight: 400;">
                  Hi ${userName || 'there'},
                </h2>
                <p style="color: #1f2937; margin: 0 0 24px 0; font-size: 18px; font-weight: 400;">
                  Welcome to openpools.in
                </p>

                <p style="color: #1f2937; margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; font-weight: 600;">
                  You're on board.
                </p>
                <p style="color: #4b5563; margin: 0 0 32px 0; font-size: 16px; line-height: 1.6;">
                  This is your space to explore, collaborate, and build with people who actually get you.
                </p>

                <p style="color: #1f2937; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">
                  Here's your quick start guide:
                </p>

                <div style="margin: 0 0 32px 0;">
                  <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 12px;">
                    <tr>
                      <td style="vertical-align: top; padding-right: 12px;">
                        <p style="color: #1f2937; margin: 0 0 4px 0; font-size: 16px; line-height: 1.6;">
                          <strong>1. Finish your profile</strong><br>
                          <span style="color: #4b5563; font-size: 15px;">Give our Humanoid-AI something real to work with.</span>
                        </p>
                      </td>
                      <td style="vertical-align: top; text-align: right; white-space: nowrap;">
                        <a href="https://openpools.in/profile" target="_blank" style="display: inline-block; background-color: #f3f4f6; color: #1f2937; padding: 6px 14px; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: 500;">Profile →</a>
                      </td>
                    </tr>
                  </table>

                  <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 12px;">
                    <tr>
                      <td style="vertical-align: top; padding-right: 12px;">
                        <p style="color: #1f2937; margin: 0 0 4px 0; font-size: 16px; line-height: 1.6;">
                          <strong>2. Generate your DNA</strong><br>
                          <span style="color: #4b5563; font-size: 15px;">Your skills and interests become a unique digital signature.</span>
                        </p>
                      </td>
                      <td style="vertical-align: top; text-align: right; white-space: nowrap;">
                        <a href="https://openpools.in/dna" target="_blank" style="display: inline-block; background-color: #f3f4f6; color: #1f2937; padding: 6px 14px; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: 500;">DNA →</a>
                      </td>
                    </tr>
                  </table>

                  <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 12px;">
                    <tr>
                      <td style="vertical-align: top; padding-right: 12px;">
                        <p style="color: #1f2937; margin: 0 0 4px 0; font-size: 16px; line-height: 1.6;">
                          <strong>3. Start collaborating</strong><br>
                          <span style="color: #4b5563; font-size: 15px;">Find people who match your energy, passions, and goals.</span>
                        </p>
                      </td>
                      <td style="vertical-align: top; text-align: right; white-space: nowrap;">
                        <a href="https://openpools.in/matches" target="_blank" style="display: inline-block; background-color: #f3f4f6; color: #1f2937; padding: 6px 14px; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: 500;">Matches →</a>
                      </td>
                    </tr>
                  </table>

                  <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 12px;">
                    <tr>
                      <td style="vertical-align: top; padding-right: 12px;">
                        <p style="color: #1f2937; margin: 0 0 4px 0; font-size: 16px; line-height: 1.6;">
                          <strong>4. Ask Antenna</strong><br>
                          <span style="color: #4b5563; font-size: 15px;">Where Every Signal Leads you Closer to the Humans you're looking for.</span>
                        </p>
                      </td>
                      <td style="vertical-align: top; text-align: right; white-space: nowrap;">
                        <a href="https://openpools.in/ask-antenna" target="_blank" style="display: inline-block; background-color: #f3f4f6; color: #1f2937; padding: 6px 14px; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: 500;">Antenna →</a>
                      </td>
                    </tr>
                  </table>
                </div>

                <p style="color: #1f2937; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">
                  Jump into your dashboard
                </p>

                <div style="margin: 0 0 32px 0;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="background-color: #1f2937; border-radius: 6px;">
                        <a href="https://openpools.in/dashboard" target="_blank" style="display: inline-block; background-color: #1f2937; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Open Dashboard</a>
                      </td>
                    </tr>
                  </table>
                </div>

                <p style="color: #4b5563; margin: 0; font-size: 15px; line-height: 1.6;">
                  If you ever get stuck or want help, just reply. A real human will answer.
                </p>
              </div>

              <!-- Footer -->
              <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #9ca3af; margin: 0; font-size: 13px;">
                  © 2025 openpools.in All rights reserved.
                </p>
              </div>

            </div>
          </body>
        </html>
      `
    })

    if (error) {
      console.error('Error sending welcome email:', error)
      return { success: false, error }
    }

    console.log('Welcome email sent to:', userEmail)
    return { success: true, data }

  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return { success: false, error: error.message }
  }
}
