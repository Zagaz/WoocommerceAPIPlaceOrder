<?php
// Dados do produto
$product_id = $_POST['product_id'];
$product_name = $_POST['product_name'];
$product_price = $_POST['product_price'];
$currency = $_POST['currency'];

// Dados do cartão de crédito
$card_number = $_POST['card_number'];
$card_expiry = $_POST['card_expiry'];
$card_cvc = $_POST['card_cvc'];

// Configurações da API do PayPal
$paypal_client_id = 'AaF1bCbWfjh-vDEHWrk9NHYv2ABvQ_67_OKT4yMmmvpAEzvzK-v7sSYXwMcALBGeT8FyRY5stgvyaDKZ';
$paypal_secret = 'EBgDD3g8H1Bqm8051VwvzrYml0EA5fYB0uXjYsRWhnEz-jC3FVMfLUQT-kmOe9kD9DXPKIQIe6glh_j5';
$paypal_api_url = 'https://api-m.sandbox.paypal.com/v2/checkout/orders';

// Obter um token de acesso
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api-m.sandbox.paypal.com/v1/oauth2/token');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_USERPWD, $paypal_client_id . ':' . $paypal_secret);
curl_setopt($ch, CURLOPT_POSTFIELDS, 'grant_type=client_credentials');
$response = curl_exec($ch);
curl_close($ch);

$response_data = json_decode($response, true);
$access_token = $response_data['access_token'];

// Criar uma ordem no PayPal
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $paypal_api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $access_token,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'intent' => 'CAPTURE',
    'purchase_units' => [
        [
            'reference_id' => $product_id,
            'amount' => [
                'currency_code' => $currency,
                'value' => $product_price
            ],
            'items' => [
                [
                    'name' => $product_name,
                    'unit_amount' => [
                        'currency_code' => $currency,
                        'value' => $product_price
                    ],
                    'quantity' => '1'
                ]
            ]
        ]
    ],
    'payment_source' => [
        'card' => [
            'number' => $card_number,
            'expiry' => $card_expiry,
            'cvc' => $card_cvc
        ]
    ]
]));
$response = curl_exec($ch);
curl_close($ch);

$response_data = json_decode($response, true);

if (isset($response_data['id'])) {
    echo 'Pedido criado com sucesso. ID do pedido: ' . $response_data['id'];
    echo '<br><a href="https://www.sandbox.paypal.com/checkoutnow?token=' . $response_data['id'] . '">Clique aqui para pagar com PayPal</a>';
} else {
    echo 'Erro ao criar o pedido: ' . $response_data['message'];
}
