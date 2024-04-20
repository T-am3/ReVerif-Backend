const express = require('express');
const axios = require('axios');
const cors = require('cors'); 
const app = express();
app.use(express.json());
app.use(cors()); 

async function getCSRFToken(cookie) {
    return new Promise((resolve, reject) => {
        axios.request({
            url: "https://auth.roblox.com/v2/logout",
            method: "post",
            headers: {
                Cookie: ".ROBLOSECURITY=" + cookie
            }
        }).catch(function (error) {
            resolve(error.response.headers["x-csrf-token"])
        })
    })
}

async function fetchVerificationLink(cookie) {
    const url = 'https://apis.roblox.com/age-verification-service/v1/persona-id-verification/start-verification';

    const headers = {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'content-type': 'application/json;charset=UTF-8',
        pragma: 'no-cache',
        'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Brave";v="114"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'sec-gpc': '1',
        'x-csrf-token': await getCSRFToken(cookie),
        cookie: ".ROBLOSECURITY=" + cookie
    };

    const body = {
        generateLink: true
    };

    try {
        const response = await axios.post(url, body, { headers, withCredentials: true });
        const verificationLink = response.data.verificationLink; 
        return verificationLink;
    } catch (error) {
        console.error('Error occurred while fetching verification link:', error);
        return null;
    }
}

app.post('/getVerificationLink', async (req, res) => {
    const cookie = req.body.cookie;
    const verificationLink = await fetchVerificationLink(cookie);

    if (verificationLink) {
        res.json({ verificationLink });
    } else {
        res.status(500).json({ error: 'An error occurred while fetching the verification link.' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
