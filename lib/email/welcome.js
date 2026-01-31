import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendCollabRequestEmail(receiverEmail, receiverName, senderName, senderJobTitle, senderCompany, senderUsername) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'OpenPools <hi@openpools.in>',
      to: receiverEmail,
      subject: `${senderName} wants to collaborate with you`,
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
                  Hi ${receiverName || 'there'},
                </h2>
                <p style="color: #1f2937; margin: 0 0 24px 0; font-size: 18px; font-weight: 600;">
                  You have a new collaboration request!
                </p>

                <!-- Sender Info -->
                <div style="background-color: #f9fafb; border-left: 4px solid #6366f1; padding: 20px; margin: 0 0 32px 0; border-radius: 4px;">
                  <p style="color: #1f2937; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                    ${senderName}
                  </p>
                  ${senderJobTitle && senderCompany ? `
                    <p style="color: #4b5563; margin: 0; font-size: 15px;">
                      ${senderJobTitle} at ${senderCompany}
                    </p>
                  ` : ''}
                </div>

                <p style="color: #4b5563; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                  ${senderName} wants to connect with you on OpenPools. Accept their request to unlock contact information and start collaborating.
                </p>

                <!-- Action Buttons -->
                <div style="margin: 0 0 32px 0;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="padding-right: 12px;">
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="background-color: #1f2937; border-radius: 6px;">
                              <a href="https://openpools.in/user/${senderUsername}" target="_blank" style="display: inline-block; background-color: #1f2937; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">View Profile</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td>
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="background-color: #f3f4f6; border-radius: 6px;">
                              <a href="https://openpools.in/collaborators" target="_blank" style="display: inline-block; background-color: #f3f4f6; color: #1f2937; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">See All Requests</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </div>

                <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.6;">
                  Not interested? You can ignore or decline this request from your collaborators page.
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
      console.error('Error sending collab request email:', error)
      return { success: false, error }
    }

    console.log('Collab request email sent to:', receiverEmail)
    return { success: true, data }

  } catch (error) {
    console.error('Failed to send collab request email:', error)
    return { success: false, error: error.message }
  }
}

export async function sendWelcomeEmail(userEmail, userName) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'OpenPools <hi@openpools.in>',
      to: userEmail,
      bcc: 'darshankumarv91@gmail.com',
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
                  OpenPools is where professionals discover collaborators through AI-powered matching. We use your skills, interests, and goals to connect you with people who complement what you bring to the table.
                </p>

                <p style="color: #1f2937; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">
                  Here's what makes OpenPools different:
                </p>

                <div style="margin: 0 0 32px 0;">
                  <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 16px;">
                    <tr>
                      <td style="vertical-align: top; padding-right: 12px;">
                        <p style="color: #1f2937; margin: 0 0 4px 0; font-size: 16px; line-height: 1.6;">
                          <strong>1. Your DNA Certificate</strong><br>
                          <span style="color: #4b5563; font-size: 15px;">A unique visual representation of your professional identity. Your skills, interests, and expertise transformed into a shareable digital signature. Think of it as your professional fingerprint.</span>
                        </p>
                      </td>
                      <td style="vertical-align: top; text-align: right; white-space: nowrap;">
                        <a href="https://openpools.in/dna" target="_blank" style="display: inline-block; background-color: #f3f4f6; color: #1f2937; padding: 6px 14px; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: 500;">View DNA →</a>
                      </td>
                    </tr>
                  </table>

                  <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 16px;">
                    <tr>
                      <td style="vertical-align: top; padding-right: 12px;">
                        <p style="color: #1f2937; margin: 0 0 4px 0; font-size: 16px; line-height: 1.6;">
                          <strong>2. Smart Matches</strong><br>
                          <span style="color: #4b5563; font-size: 15px;">Our AI analyzes your profile to suggest collaborators who complement your skills. Not just similar people—the right people. Connect with those who fill your gaps and amplify your strengths.</span>
                        </p>
                      </td>
                      <td style="vertical-align: top; text-align: right; white-space: nowrap;">
                        <a href="https://openpools.in/matches" target="_blank" style="display: inline-block; background-color: #f3f4f6; color: #1f2937; padding: 6px 14px; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: 500;">See Matches →</a>
                      </td>
                    </tr>
                  </table>

                  <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 12px;">
                    <tr>
                      <td style="vertical-align: top; padding-right: 12px;">
                        <p style="color: #1f2937; margin: 0 0 4px 0; font-size: 16px; line-height: 1.6;">
                          <strong>3. Ask Antenna</strong><br>
                          <span style="color: #4b5563; font-size: 15px;">Search the community using natural language. Looking for "a designer in Berlin who loves minimalism"? Antenna understands context, not just keywords. Every signal leads you closer to the humans you need.</span>
                        </p>
                      </td>
                      <td style="vertical-align: top; text-align: right; white-space: nowrap;">
                        <a href="https://openpools.in/ask-antenna" target="_blank" style="display: inline-block; background-color: #f3f4f6; color: #1f2937; padding: 6px 14px; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: 500;">Try Antenna →</a>
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

export async function sendNewMessageEmail(receiverEmail, receiverName, senderName, senderUsername) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'OpenPools <hi@openpools.in>',
      to: receiverEmail,
      subject: `${senderName} sent you a message`,
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
                  Hi ${receiverName || 'there'},
                </h2>
                <p style="color: #1f2937; margin: 0 0 24px 0; font-size: 18px; font-weight: 600;">
                  You have a new message from ${senderName}!
                </p>

                <p style="color: #4b5563; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                  ${senderName} started a conversation with you on OpenPools. Your messages are end-to-end encrypted for privacy.
                </p>

                <!-- Action Button -->
                <div style="margin: 0 0 32px 0;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="background-color: #1f2937; border-radius: 6px;">
                        <a href="https://openpools.in/chat/${senderUsername}" target="_blank" style="display: inline-block; background-color: #1f2937; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">View Message</a>
                      </td>
                    </tr>
                  </table>
                </div>

                <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.6;">
                  You won't receive an email for every message - only the first one from each person.
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
      console.error('Error sending new message email:', error)
      return { success: false, error }
    }

    console.log('New message email sent to:', receiverEmail)
    return { success: true, data }

  } catch (error) {
    console.error('Failed to send new message email:', error)
    return { success: false, error: error.message }
  }
}

export async function sendUnreadMessagesDigestEmail(receiverEmail, receiverName, unreadCount) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'OpenPools <hi@openpools.in>',
      to: receiverEmail,
      subject: `You have ${unreadCount} unread messages on OpenPools`,
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
                  Hi ${receiverName || 'there'},
                </h2>
                <p style="color: #1f2937; margin: 0 0 24px 0; font-size: 18px; font-weight: 600;">
                  You have ${unreadCount} unread messages waiting for you!
                </p>

                <!-- Unread Count Badge -->
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 0 0 32px 0; border-radius: 4px;">
                  <p style="color: #92400e; margin: 0; font-size: 16px; font-weight: 600;">
                    ${unreadCount} unread messages
                  </p>
                  <p style="color: #b45309; margin: 8px 0 0 0; font-size: 14px;">
                    People are trying to connect with you. Don't keep them waiting!
                  </p>
                </div>

                <p style="color: #4b5563; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                  Your collaborators have been reaching out. Head over to OpenPools to catch up on your conversations.
                </p>

                <!-- Action Button -->
                <div style="margin: 0 0 32px 0;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="background-color: #1f2937; border-radius: 6px;">
                        <a href="https://openpools.in/collaborators" target="_blank" style="display: inline-block; background-color: #1f2937; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">View Messages</a>
                      </td>
                    </tr>
                  </table>
                </div>
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
      console.error('Error sending unread messages digest email:', error)
      return { success: false, error }
    }

    console.log('Unread messages digest email sent to:', receiverEmail)
    return { success: true, data }

  } catch (error) {
    console.error('Failed to send unread messages digest email:', error)
    return { success: false, error: error.message }
  }
}

export async function sendOrgInviteEmail(receiverEmail, inviterName, orgName, role, inviteUrl) {
  try {
    const roleDescriptions = {
      admin: 'Full access to manage the organization',
      recruiter: 'Can search candidates and manage talent pool',
      viewer: 'Read-only access to view candidates'
    }

    const { data, error } = await resend.emails.send({
      from: 'OpenPools <hi@openpools.in>',
      to: receiverEmail,
      subject: `${inviterName} invited you to join ${orgName} on OpenPools`,
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
                  Hi there,
                </h2>
                <p style="color: #1f2937; margin: 0 0 24px 0; font-size: 18px; font-weight: 600;">
                  You've been invited to join ${orgName}!
                </p>

                <!-- Invite Info -->
                <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 20px; margin: 0 0 32px 0; border-radius: 4px;">
                  <p style="color: #1f2937; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                    ${inviterName} invited you
                  </p>
                  <p style="color: #4b5563; margin: 0 0 8px 0; font-size: 15px;">
                    Organization: <strong>${orgName}</strong>
                  </p>
                  <p style="color: #4b5563; margin: 0; font-size: 15px;">
                    Your role: <strong style="text-transform: capitalize;">${role}</strong> - ${roleDescriptions[role] || 'Team member'}
                  </p>
                </div>

                <p style="color: #4b5563; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                  Join the team to access the organization's talent search dashboard, manage candidates, and collaborate with your colleagues.
                </p>

                <!-- Action Button -->
                <div style="margin: 0 0 32px 0;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="background-color: #3b82f6; border-radius: 6px;">
                        <a href="${inviteUrl}" target="_blank" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Accept Invitation</a>
                      </td>
                    </tr>
                  </table>
                </div>

                <p style="color: #6b7280; margin: 0 0 16px 0; font-size: 14px; line-height: 1.6;">
                  This invitation expires in 7 days. If you don't have an OpenPools account yet, you'll be able to create one when you accept.
                </p>

                <p style="color: #9ca3af; margin: 0; font-size: 13px; line-height: 1.6;">
                  If you weren't expecting this invitation, you can safely ignore this email.
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
      console.error('Error sending org invite email:', error)
      return { success: false, error }
    }

    console.log('Org invite email sent to:', receiverEmail)
    return { success: true, data }

  } catch (error) {
    console.error('Failed to send org invite email:', error)
    return { success: false, error: error.message }
  }
}
