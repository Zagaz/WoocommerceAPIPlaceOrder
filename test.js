// All variables
const WOOAPI = "https://woolibresign.s1-tastewp.com/wp-json/wc/v3"; // <== Hardcode
var auth =
  "Y2tfNDQ2ZjQxYzZiOTc0MGEzYWExZWU5NmZkNzAwNmE2MDcxZDhjZDg5Mjpjc183OWMzYjkyM2ZmNGM0ZjE1MjgyYWNmODhiNDdjMWQ1NTczNTg4MDNk"; // <== Hardcode
var payment_method = "paypal"; // <== Hardcode
var payment_method_title = "PayPal"; // <== Hardcode
var set_paid = true; // <== Hardcode

// DADOS do WOOCOMMERCE INICIO 
var first_name = "Bruce"; // <===
var last_name = "Wayne"; // <===
var address_1 = "Wayne Manor - 1007 Mountain Drive"; // <===
var city = "Gotham"; // <===
var state = "GT"; // <===
var postcode = "10001"; // <===
var country = "US"; // <===
var email = "bruce.wayne@waynetech.com"; // <===
var phone = "(555) 123-4567"; // <===

// DADOS do WOOCOMMERCE FINAL

// Free shipping
var product_id = 12; // < Hardcode
var quantity = 1; // < Hardcode
var method_id = "free_shipping"; // <Hardcode
var method_title = "Free shipping"; // <Hardcode
var total = "0.00"; // Hardcode and Mandatory for API to avoid shipping conflict

const options_post = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",

    Authorization:
      "Basic Y2tfNDQ2ZjQxYzZiOTc0MGEzYWExZWU5NmZkNzAwNmE2MDcxZDhjZDg5Mjpjc183OWMzYjkyM2ZmNGM0ZjE1MjgyYWNmODhiNDdjMWQ1NTczNTg4MDNk",
  },
  body: JSON.stringify({
    payment_method: payment_method,
    payment_method_title: payment_method_title,
    set_paid: set_paid,
    billing: {
      first_name: first_name,
      last_name: last_name,
      address_1: address_1,
      city: city,
      state: state,
      postcode: postcode,
      country: country,
      email: email,
      phone: phone,
    },
    line_items: [
      {
        product_id: product_id,
        quantity: quantity,
      },
    ],
    shipping_lines: [
      {
        method_id: method_id,
        method_title: method_title,
        total: total, // Mandatory to avoid API shipping conflict
      },
    ],
  }),
};
const options_get = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Basic ${auth}`,
  },
};

post_order();

async function post_order() {
  // A URL da API e Opções
  const order = await fetch(`${WOOAPI}/orders`, options_post);
  // Ver se tá tudo OK.
  if (!order.ok) {
    const message = `An error has occured: ${order.status}`;
    document.querySelector(".orderPost").classList.add("error");
    document.querySelector(".orderGet").classList.add("error");
    document.querySelector(".orderGet").innerHTML = message;
    document.querySelector(".orderPost").innerHTML = message;
    throw new Error(message);
  } else {
    // Se sim
    let res = await order.json();
    console.log("Woo Object", res);
    let order_id_post = res["id"];
    let order_currency = res["currency"];
    let order_total = res["total"];

    document.querySelector(".orderPost").classList.add("success");
    document.querySelector(".orderPost").innerHTML = `Order #${order_id_post} successfully registered.`;
  
  // resquestPayPal(); 
  payWithPayPal(order_id_post,order_currency , order_total)

    get_order_by_ID(order_id_post);
  }
}
// Só para checar se o pedido foi registrado
async function get_order_by_ID(order_id) {
  const order = await fetch(`${WOOAPI}/orders/${order_id}`, options_get);
  if (!order.ok) {
    const message = `An error has occured: ${order.status}`;
    document.querySelector(".orderGet").classList.add("error");
    document.querySelector(".orderGet").innerHTML = message;
    throw new Error(message);
  } else {
    let res = await order.json();
    let order_id_get = res["id"];
    let first_name = res["billing"]["first_name"];
    let last_name = res["billing"]["last_name"];
    let currency = res["currency"];
    document.querySelector(".orderGet").classList.add("success");
    document.querySelector(".orderGet").innerHTML = `Order #${order_id_get} has been retrieved successfully.<br>
    First Name: ${first_name}<br>
    Last Name: ${last_name}<br>
    Price: ${currency} ${res["total"]}`;
  
  }
}

// PayPal

async function payWithPayPal(wooOrderID, currency_code, value) {
  console.log("PayPal started")
  const clientID = 'AaF1bCbWfjh-vDEHWrk9NHYv2ABvQ_67_OKT4yMmmvpAEzvzK-v7sSYXwMcALBGeT8FyRY5stgvyaDKZ';
  const secret = 'EBgDD3g8H1Bqm8051VwvzrYml0EA5fYB0uXjYsRWhnEz-jC3FVMfLUQT-kmOe9kD9DXPKIQIe6glh_j5';

  // Base64 encode the client ID and secret
  const auth = btoa(`${clientID}:${secret}`);

  // Step 1: Create a PayPal order
  const createOrderResponse = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
              {
                  reference_id: `WooOrder_${wooOrderID}`,
                  amount: {
                      currency_code: currency_code,
                      value: value// Set this to the total amount from the WooCommerce order
                  }
              }
          ]
      })
  });

  const createOrderData = await createOrderResponse.json();
  const paypalOrderID = createOrderData.id; // Save PayPal order ID for later

  console.log("PayPal Object", createOrderData);
  



  console.log("PayPal finished")
}




