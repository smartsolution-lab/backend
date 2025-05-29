import Settings from '../models/settings.model'
import fetch from 'node-fetch';

// for verify payment , calling that order 
export const getOrderDetails = async (orderId) => {
    const settings = await Settings.findOne({});
    const accessToken = await generateAccessToken();
    const paypalUrl = process.env.paypal_base_url;
    const url = `${paypalUrl}/v2/checkout/orders/${orderId}`;
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return handleResponse(response);
}

// generate access token
export const generateAccessToken = async () => {
    const settings = await Settings.findOne({});
    const paypalUrl = process.env.paypal_base_url;
    const paypal_client_id = process.env.paypal_client_id;
    const paypal_secret_key = process.env.paypal_secret_key;
    const auth = Buffer.from(paypal_client_id + ":" + paypal_secret_key).toString("base64");
    const response = await fetch(`${paypalUrl}/v1/oauth2/token`, {
        method: "post",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
        },
    });
    const jsonData = await handleResponse(response);
    return jsonData.access_token;
}

export const handleResponse = async (response) => {
    if (response.status === 200 || response.status === 201) {
        return response.json();
    }
    const errorMessage = await response.text();
    throw new Error(errorMessage);
}

