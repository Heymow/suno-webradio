const fetch = require('node-fetch'); // Or global fetch if available

const BASE_URL = 'http://localhost:3000';
const EMAIL = `test_${Date.now()}@example.com`;
const PASSWORD = 'password123';
const USERNAME = `User_${Date.now()}`;

async function run() {
    try {
        console.log('1. Creating user...');
        const createRes = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: USERNAME,
                email: EMAIL,
                password: PASSWORD,
                avatar: 'https://example.com/avatar.png'
            })
        });
        const createData = await createRes.json();
        console.log('Create User Status:', createRes.status);
        if (!createRes.ok) {
            console.error('Failed to create user:', createData);
            return;
        }
        const userId = createData.user.id;
        console.log('User ID:', userId);

        console.log('2. Logging in...');
        const loginRes = await fetch(`${BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: EMAIL,
                password: PASSWORD
            })
        });
        const loginData = await loginRes.json();
        console.log('Login Status:', loginRes.status);
        if (!loginRes.ok) {
            console.error('Failed to login:', loginData);
            return;
        }
        const token = loginData.token;
        console.log('Token obtained:', token ? 'Yes' : 'No');

        console.log('3. Checking activation status...');
        const statusRes = await fetch(`${BASE_URL}/users/${userId}/activation-status`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Activation Status Code:', statusRes.status);
        const statusData = await statusRes.json();
        console.log('Activation Status Data:', statusData);

    } catch (error) {
        console.error('Error:', error);
    }
}

run();
