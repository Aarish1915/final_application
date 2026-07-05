const http = require('http');

async function runTest() {
  console.log("1. Testing Admin Login...");
  
  const loginBody = JSON.stringify({ email: "admin@ingri.com", password: "password123" });
  
  const loginReq = http.request("http://localhost:5000/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Content-Length": loginBody.length }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`Login Status: ${res.statusCode}`);
      const response = JSON.parse(data);
      if (res.statusCode !== 200) {
        console.error("Login failed:", response);
        return;
      }
      console.log("Login Success! Token received.");
      
      const token = response.token;
      
      console.log("\n2. Testing Dashboard Stats...");
      const statsReq = http.request("http://localhost:5000/api/admin/dashboard", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      }, (res2) => {
        let data2 = '';
        res2.on('data', chunk => data2 += chunk);
        res2.on('end', () => {
          console.log(`Stats Status: ${res2.statusCode}`);
          if (res2.statusCode !== 200) {
            console.error("Stats failed:", data2);
            return;
          }
          console.log("Stats Data:", JSON.parse(data2));
        });
      });
      statsReq.end();
    });
  });
  
  loginReq.write(loginBody);
  loginReq.end();
}

runTest();
