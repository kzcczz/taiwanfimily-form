exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const { email, nick, date, time, people, amount, code } = body;

    console.log('Sending email to:', email);
    console.log('API Key exists:', !!process.env.RESEND_API_KEY);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'TAIWAN FIMILY <onboarding@resend.dev>',
        to: [email],
        subject: '【TAIWAN FIMILY】LE SSERAFIM 五週年應援展覽 — 報名確認',
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#060D1A;color:#F0F4F8;border-radius:16px;overflow:hidden;">
            <div style="background:#0D1E38;padding:2rem;border-bottom:1px solid rgba(91,155,213,0.2);">
              <div style="font-size:12px;letter-spacing:0.15em;color:#5B9BD5;margin-bottom:8px;">TAIWAN FIMILY</div>
              <div style="font-size:22px;font-weight:500;">報名確認通知</div>
            </div>
            <div style="padding:2rem;">
              <p style="color:#7A9BBF;margin-bottom:1.5rem;">感謝 <strong style="color:#F0F4F8;">${nick}</strong> 完成報名！以下是您的報名資訊：</p>
              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr><td style="padding:10px 0;border-bottom:1px solid rgba(91,155,213,0.1);color:#7A9BBF;width:35%">參展日期</td><td style="padding:10px 0;border-bottom:1px solid rgba(91,155,213,0.1);font-weight:500;">${date}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid rgba(91,155,213,0.1);color:#7A9BBF;">入場時段</td><td style="padding:10px 0;border-bottom:1px solid rgba(91,155,213,0.1);font-weight:500;">${time}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid rgba(91,155,213,0.1);color:#7A9BBF;">報名人數</td><td style="padding:10px 0;border-bottom:1px solid rgba(91,155,213,0.1);font-weight:500;">${people} 人</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid rgba(91,155,213,0.1);color:#7A9BBF;">匯款金額</td><td style="padding:10px 0;border-bottom:1px solid rgba(91,155,213,0.1);font-weight:500;">NT$${parseInt(amount).toLocaleString()}</td></tr>
                <tr><td style="padding:10px 0;color:#7A9BBF;">轉帳後五碼</td><td style="padding:10px 0;font-weight:500;">…${code}</td></tr>
              </table>
              <div style="margin-top:1.5rem;padding:1rem 1.25rem;background:rgba(91,155,213,0.08);border:1px solid rgba(91,155,213,0.15);border-radius:10px;font-size:13px;color:#7A9BBF;line-height:1.7;">
                我們將核對您的轉帳資訊後完成確認。<br>
                如有任何問題，請回覆此信件聯絡我們。
              </div>
            </div>
            <div style="padding:1.25rem 2rem;border-top:1px solid rgba(91,155,213,0.1);font-size:11px;color:rgba(120,160,200,0.4);letter-spacing:0.06em;">
              TAIWAN FIMILY · LE SSERAFIM FAN SITE
            </div>
          </div>
        `
      })
    });

    const resBody = await res.json();
    console.log('Resend response:', JSON.stringify(resBody));

    if (res.ok) {
      return { statusCode: 200, body: JSON.stringify({ result: 'success', id: resBody.id }) };
    } else {
      return { statusCode: 500, body: JSON.stringify({ error: resBody }) };
    }

  } catch(e) {
    console.error('Exception:', e.message);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
