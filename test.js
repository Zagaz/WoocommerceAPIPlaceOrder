var url = "https://woolibresign.s1-tastewp.com/wp-json/wc/v3/orders";


var payment_method = "paypal";
var payment_method_title = "PayPal";
var set_paid = true;
var first_name = "Bruce";
var last_name = "Wayne";
var address_1 = "Wayne Manor - 1007 Mountain Drive";
var city = "Gotham";
var state = "GT";
var postcode = "10001";
var country = "US";
var email = "bruce.wayne@waynetech.com";
var phone = "(555) 123-4567";
var first_name_shipping = "Bruce";
var last_name_shipping = "Wayne";
var address_1_shipping = "Wayne Manor - 1007 Mountain Drive";
var city_shipping = "Gotham";
var state_shipping = "GT";
var postcode_shipping = "10001";
var country_shipping = "US";
var product_id = 12;
var quantity = 1;
// Free shipping
var method_id = "free_shipping";
var method_title = "Free shipping";
var total = "0.00"; // Mandatory for API to avoid shipping conflict

const options_post= {
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
     method: 'GET',
     headers: {
       'Content-Type': 'application/json',
       'User-Agent': 'insomnia/9.3.3',
       Authorization: 'Basic Y2tfNDQ2ZjQxYzZiOTc0MGEzYWExZWU5NmZkNzAwNmE2MDcxZDhjZDg5Mjpjc183OWMzYjkyM2ZmNGM0ZjE1MjgyYWNmODhiNDdjMWQ1NTczNTg4MDNk'
     },

   }


post_order();

async function post_order(){
     const order = await fetch("https://woolibresign.s1-tastewp.com/wp-json/wc/v3/orders", options_post)
     if (!order.ok) {
          const message = `An error has occured: ${order.status}`;
          throw new Error(message);
     } else{
          let res = await order.json()
          let order_id_post = res['id'];
          console.log(`Order #${order_id_post} has been placed"`);
          get_order_by_ID(order_id_post);
     }
     
     
}

async function get_order_by_ID(order_id){
     const order = await fetch(`https://woolibresign.s1-tastewp.com/wp-json/wc/v3/orders/${order_id}`, options_get)
     if (!order.ok) {
          const message = `An error has occured: ${order.status}`;
          throw new Error(message);
     } else{
          let res = await order.json()
          console.log(res);
          let order_id_get = res['id'];
          let first_name = res['billing']['first_name'];
          let last_name = res['billing']['last_name'];
          let currency = res['currency'];
          console.log(`
          Order #${order_id_get} has been retrieved successfully.
               `);
               console.log(`
               First Name: ${first_name} 
               Last Name: ${last_name}
               Price: ${currency} ${res['total']}
               `);
     }
}

   