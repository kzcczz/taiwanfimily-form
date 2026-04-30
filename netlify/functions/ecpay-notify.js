const crypto = require('crypto');

exports.handler = async (event) => {
  const params = new URLSearchParams(event.body);
  const data = Object.fromEntries(params);

  const HashKey = 'aoLoAo9zrQcKSbey';
  const HashIV = '9bMxwPCtptAYw7E0';

  // 驗證 CheckMacValue
  const { CheckMacValue, ...rest } = data;
  const sorted = Object.keys(rest).sort().map(k => `${k}=${rest[k]}`).join('&');
  const raw = `HashKey=${HashKey}&${sorted}&HashIV=${HashIV}`;
  const encoded = encodeURIComponent(raw).toLowerCase()
    .replace(/%20/g, '+').replace(/%21/g, '!').replace(/%28/g, '(')
    .replace(/%29/g, ')').replace(/%2a/g, '*');
  const expected = crypto.createHash('sha256').update(encoded).digest('hex').toUpperCase();

  if (expected !== CheckMacValue) {
    return { statusCode: 400, body: '0|ErrorMessage' };
  }

  // 付款成功才更新
  if (data.RtnCode === '2') {
    const orderId = data.MerchantTradeNo;

    // 更新 Supabase 報名狀態為已付款
    await fetch(`${process.env.SUPABASE_URL}/rest/v1/registrations?order_id=eq.${orderId}`, {
      method: 'PATCH',
      headers: {
        'apikey': process.env.SUPABASE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: '已付款', bank_code: data.BankCode, vaccount: data.vAccount })
    });
  }

  return { statusCode: 200, body: '1|OK' };
};
