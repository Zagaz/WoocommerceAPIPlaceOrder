// Configurações iniciais
const WOOAPI = "https://groovyrecord.s2-tastewp.com/wp-json/wc/v3";
const auth = "Y2tfOGZmMDVjNzczNmM1MTdjZWI1YWI0OWYyNDc3ZjU2NzUwMGVjMDZjMjpjc180MzU3MDA4M2Q4NWUwZjUzOTQzMWIxNmQ3YjdmNTM3YjFjYzc1Zjlk";
const clientID = "AaF1bCbWfjh-vDEHWrk9NHYv2ABvQ_67_OKT4yMmmvpAEzvzK-v7sSYXwMcALBGeT8FyRY5stgvyaDKZ";
const secret = "EBgDD3g8H1Bqm8051VwvzrYml0EA5fYB0uXjYsRWhnEz-jC3FVMfLUQT-kmOe9kD9DXPKIQIe6glh_j5";
const payment_method = "paypal";
const payment_method_title = "PayPal";
const set_paid = false;

// Dados do cliente
const customerData = {
  first_name: "Bruce",
  last_name: "Wayne",
  address_1: "Wayne Manor - 1007 Mountain Drive",
  city: "Gotham",
  state: "GT",
  postcode: "10001",
  country: "US",
  email: "bruce.wayne@waynetech.com",
  phone: "(555) 123-4567"
};

// Produto e envio
const productData = {
  product_id: 24,
  quantity: 1,
  method_id: "free_shipping",
  method_title: "Free shipping",
  total: "0.00"
};

// Configurações de cabeçalho
const headers = {
  "Content-Type": "application/json",
  Authorization: `Basic ${auth}`,
};

// Função para criar pedido no WooCommerce
async function createOrderWooCommerce() {
  const response = await fetch(`${WOOAPI}/orders`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      payment_method: payment_method,
      payment_method_title: payment_method_title,
      set_paid: set_paid,
      status: "pending",
      billing: customerData,
      line_items: [{
        product_id: productData.product_id,
        quantity: productData.quantity,
      }],
      shipping_lines: [{
        method_id: productData.method_id,
        method_title: productData.method_title,
        total: productData.total,
      }]
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create WooCommerce order: ${response.status}`);
  }

  return await response.json();
}

// Função para criar ordem de pagamento no PayPal
async function createPayPalOrder(orderID, currency_code, value) {
  const paypalAuth = btoa(`${clientID}:${secret}`);
  const response = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${paypalAuth}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        reference_id: `WooOrder_${orderID}`,
        amount: {
          currency_code: currency_code,
          value: value,
        },
      }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create PayPal order: ${response.status}`);
  }

  return await response.json();
}

// Função para atualizar o status do pedido no WooCommerce
async function updateWooCommerceOrderStatus(orderID, status) {
  const response = await fetch(`${WOOAPI}/orders/${orderID}`, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify({
      status: status,
      set_paid: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update WooCommerce order: ${response.status}`);
  }

  return await response.json();
}

// Função principal
async function processOrder() {
  try {
    // Criar pedido no WooCommerce
    const wooOrder = await createOrderWooCommerce();
    const wooOrderID = wooOrder.id;
    const currency = 'USD'; // Confirmado como a moeda padrão
    const total = wooOrder.total;

    console.log(`WooCommerce Order #${wooOrderID} created successfully.`);

    // Criar pedido no PayPal
    const paypalOrder = await createPayPalOrder(wooOrderID, currency, total);
    const paypalOrderID = paypalOrder.id;

    console.log(`PayPal Order #${paypalOrderID} created successfully.`);

    // Integrar o botão do PayPal
    paypal.Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            reference_id: `WooOrder_${wooOrderID}`,
            amount: {
              currency_code: currency,
              value: total,
            },
          }],
        });
      },
      onApprove: async (data, actions) => {
        const details = await actions.order.capture();
        console.log('Payment successful:', details);

        // Atualizar status do pedido no WooCommerce
        await updateWooCommerceOrderStatus(wooOrderID, 'completed');
        console.log(`WooCommerce Order #${wooOrderID} status updated to completed.`);
      },
      onError: (err) => {
        console.error('PayPal payment failed:', err);
      }
    }).render('#paypal-button-container');

  } catch (error) {
    console.error('Error processing order:', error);
  }
}

// Iniciar o processo
processOrder();
