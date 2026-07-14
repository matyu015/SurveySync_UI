export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Securely grab the key from Vercel's server environment
  const secretKey = process.env.VITE_PAYMONGO_SECRET_KEY;

  if (!secretKey) {
    return res.status(500).json({ error: 'Secret key not configured on server' });
  }

  try {
    // Make the request from the VERCEL SERVER (bypassing browser CORS)
    const response = await fetch('https://api.paymongo.com/v2/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(secretKey + ':').toString('base64')
      },
      body: JSON.stringify({
        data: {
          attributes: {
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            line_items: [
              {
                currency: 'PHP',
                amount: req.body.amount,
                name: req.body.surveyType,
                quantity: 1
              }
            ],
            payment_method_types: ['gcash'],
            reference_number: req.body.referenceNo,
            success_url: req.headers.origin, // Sends them back to your site
            cancel_url: req.headers.origin,
          }
        }
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}