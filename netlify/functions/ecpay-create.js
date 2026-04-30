const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const body = JSON.parse(event.body);
  const { orderId, amount, desc, email } = body;

  const MerchantID = '3499050';
  const HashKey = 'aoLoAo9zrQcKSbey';
  const HashIV = '9bMxwPCtptAYw7E0';
  const ReturnURL = 'https://taiwanfimily.netlify.app/.netlify/functions/ecpay-notify';
  const ClientBackURL = 'https://taiwanfimily.netlify.app';

  const params = {
    MerchantID,
    MerchantTradeNo: orderId,
    MerchantTradeDate: new Date().toLocaleString('zh-TW', {
      timeZone: 'Asia/Taipei',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    }).replace(/\//g, '/').replace(',', ''),
    PaymentType: 'aio',
    TotalAmount: String(amount),
    TradeDesc: encodeURIComponent(desc),
    ItemName: desc,
    ReturnURL,
    ClientBackURL,
    ChoosePayment: 'ATM',
    EncryptType: '1',
    ExpireDate: '3',
    EmailModify: '0',
    PaymentInfoURL: ReturnURL,
  };

  // 產生 CheckMacValue
  const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
  const raw = `HashKey=${HashKey}&${sorted}&HashIV=${HashIV}`;
  const encoded = encodeURIComponent(raw).toLowerCase()
    .replace(/%20/g, '+').replace(/%21/g, '!').replace(/%28/g, '(')
    .replace(/%29/g, ')').replace(/%2a/g, '*');
  const checkMac = crypto.createHash('sha256').update(encoded).digest('hex').toUpperCase();
  params.CheckMacValue = checkMac;

  // 產生 HTML 表單自動送出
  const formHtml = `
    <form id="ecpay" action="https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5" method="POST">
      ${Object.entries(params).map(([k, v]) => `<input type="hidden" name="${k}" value="${v}">`).join('')}
    </form>
    <script>document.getElementById('ecpay').submit();</script>
  `;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: formHtml,
  };
};
