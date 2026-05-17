// Admin API: Send test email for a problem (without changing status)

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Service client for bypassing RLS
function getServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

async function verifyAdminAccess() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Unauthorized')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('Unauthorized')
  }

  return user
}

function generateEmailHTML(problem) {
  // Generate slug from problem title
  const slug = problem.problem_title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital@0;1&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; background: #000; color: #fff; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; background: #000; }
          
          /* Hero Section */
          .hero { 
            position: relative;
            background: #d84a1b;
            padding: 60px 40px;
            text-align: center;
            overflow: hidden;
          }
          .hero-grid {
            position: absolute;
            inset: 0;
            opacity: 0.3;
            background-image: repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 80px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.1) 40px, rgba(0,0,0,0.1) 80px);
          }
          .hero-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.4), rgba(0,0,0,1));
          }
          .hero-content {
            position: relative;
            z-index: 10;
          }
          .hero-title { 
            font-family: 'Playfair Display', serif;
            font-size: 32px; 
            font-weight: 700; 
            font-style: italic;
            color: #fff; 
            margin-bottom: 12px;
            letter-spacing: -0.5px;
          }
          .hero-subtitle { font-size: 13px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.9); }
          
          .content { padding: 40px 30px; border-bottom: 1px solid rgba(255,255,255,0.1); }
          .greeting { font-size: 15px; margin-bottom: 20px; color: #fff; }
          .message { font-size: 14px; margin-bottom: 24px; color: rgba(255,255,255,0.8); line-height: 1.7; }
          .problem-card { border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.02); padding: 24px; margin: 24px 0; border-radius: 2px; }
          .problem-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 600; font-style: italic; color: #fff; margin-bottom: 20px; }
          
          /* Meta fields stacked vertically */
          .meta-item { 
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
          }
          .meta-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          .meta-label { 
            font-family: 'Playfair Display', serif;
            font-size: 14px;
            font-weight: 600;
            font-style: italic;
            text-transform: uppercase; 
            letter-spacing: 0.1em; 
            color: rgba(255,255,255,0.7); 
            display: block; 
            margin-bottom: 6px; 
          }
          .meta-value { font-size: 14px; color: #d84a1b; font-weight: 600; }
          .problem-text { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.7; }
          .outcome-section { margin-top: 0; padding-top: 0; }
          
          .cta { padding: 30px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
          .cta-button { display: inline-block; background: #d84a1b; color: #fff; padding: 14px 36px; text-decoration: none; border-radius: 2px; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; border: 2px solid #d84a1b; }
          
          .footer { padding: 30px; text-align: center; }
          .footer-text { font-size: 12px; color: rgba(255,255,255,0.5); margin: 8px 0; line-height: 1.6; }
          .footer-divider { margin: 16px 0; padding: 16px 0; border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1); }
          .logo-section { display: flex; align-items: center; justify-content: center; gap: 15px; flex-wrap: wrap; }
          .logo-item { text-align: center; }
          .logo-item img { height: 20px; width: auto; margin-bottom: 6px; display: inline-block; }
          .logo-text { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.6); }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Hero Section with Gradient & Texture -->
          <div class="hero">
            <div class="hero-grid"></div>
            <div class="hero-overlay"></div>
            <div class="hero-content">
              <h1 class="hero-title">Your Challenge Is Live</h1>
              <p class="hero-subtitle">Verified & Published on Counterpools</p>
            </div>
          </div>

          <!-- Content -->
          <div class="content">
            <p class="greeting">Hi ${problem.full_name},</p>
            
            <p class="message">
              🎉 <strong>Congratulations!</strong> Your challenge has been verified and is now <strong style="color: #d84a1b;">live on Counterpools</strong>. The world's best builders can now discover and engage with your problem.
            </p>

            <!-- Problem Card -->
            <div class="problem-card">
              <h2 class="problem-title">${problem.problem_title}</h2>
              
              <!-- Meta fields stacked vertically -->
              <div class="meta-item">
                <h3 class="meta-label">Domain</h3>
                <div class="meta-value">${problem.domain}</div>
              </div>
              
              <div class="meta-item">
                <h3 class="meta-label">Difficulty</h3>
                <div class="meta-value">${problem.difficulty}</div>
              </div>

              <div class="meta-item">
                <h3 class="meta-label">The Challenge</h3>
                <p class="problem-text">${problem.description}</p>
              </div>
              
              ${problem.expected_outcome ? `
                <div class="meta-item outcome-section">
                  <h3 class="meta-label">Expected Outcome</h3>
                  <p class="problem-text">${problem.expected_outcome}</p>
                </div>
              ` : ''}
            </div>

            <p class="message">
              Teams can now discover your challenge, express interest, and propose solutions. You'll receive updates as teams engage with your problem.
            </p>
          </div>

          <!-- CTA -->
          <div class="cta">
            <a href="https://openpools.in/counterpools/problems/${slug}" class="cta-button">View Your Challenge →</a>
          </div>

          <!-- Footer with Logos -->
          <div class="footer">
            <div class="logo-section">
              <div class="logo-item">
                <img src="https://openpools.in/logo.svg" alt="OpenPools" />
                <div class="logo-text">OpenPools</div>
              </div>
              <div style="color: rgba(255,255,255,0.3); font-size: 11px; font-weight: 600;">×</div>
              <div class="logo-item">
                <img src="https://openpools.in/cg.png" alt="Coding Gita" />
                <div class="logo-text">Coding Gita</div>
              </div>
            </div>
            
            <div class="footer-divider"></div>
            
            <p class="footer-text">
              Thanks for contributing to the arena. Together, we're connecting real problems with exceptional talent.
            </p>
            <p class="footer-text">
              Questions? <strong>support@openpools.in</strong>
            </p>
            <p class="footer-text" style="font-size: 11px; margin-top: 16px;">
              © 2026 Counterpools by OpenPools
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}

export async function POST(request, { params }) {
  try {
    const adminUser = await verifyAdminAccess()
    const { id } = await params

    // Use service client to bypass RLS
    const supabase = getServiceClient()

    // Get the problem
    const { data: problem, error: fetchError } = await supabase
      .from('counterpools_problems')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !problem) {
      return new Response(
        JSON.stringify({ success: false, message: 'Problem not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Send test email (NO status change, NO database update)
    try {
      const result = await resend.emails.send({
        from: 'noreply@openpools.in',
        to: problem.email,
        bcc: 'ary7sharma@gmail.com',
        subject: `[TEST] Your challenge is now live on Counterpools 🚀`,
        html: generateEmailHTML(problem),
      })

      console.log('Test email sent successfully:', result)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Test email sent to ${problem.email}`,
          emailId: result.id
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    } catch (emailError) {
      console.error('Failed to send test email:', emailError)
      throw emailError
    }
  } catch (err) {
    console.error('Send test email error:', err)
    return new Response(
      JSON.stringify({ success: false, message: err.message || 'Failed to send test email' }),
      { status: err.message === 'Unauthorized' ? 403 : 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function GET(request, { params }) {
  // GET and POST do the same thing
  return POST(request, { params })
}
