# Port Forwarding Guide

Expose your local development server to the internet so anyone can access it from anywhere.

---

## ⚠️ Security Warning

Port forwarding exposes your computer directly to the internet. Only use this for **temporary testing** and:
- Close the ports when done
- Never expose production data
- Monitor for suspicious activity

---

## Step 1: Get Your Local IP Address

```powershell
ipconfig
```

Find **IPv4 Address** under your WiFi adapter (e.g., `192.168.1.105`)

---

## Step 2: Find Your Public IP Address

Open in browser: https://whatismyip.com

Note your **Public IP** (e.g., `103.156.XX.XX`)

---

## Step 3: Access Your Router Admin Panel

### Common Router Login Addresses:
| Brand | Address |
|-------|---------|
| Most routers | `192.168.1.1` or `192.168.0.1` |
| Jio Fiber | `192.168.29.1` |
| Airtel Xstream | `192.168.1.1` |
| BSNL | `192.168.1.1` |
| TP-Link | `192.168.0.1` or `tplinkwifi.net` |
| D-Link | `192.168.0.1` |
| Netgear | `192.168.1.1` or `routerlogin.net` |

### Default Credentials (if not changed):
| Brand | Username | Password |
|-------|----------|----------|
| Jio Fiber | admin | Jiocentrum |
| Airtel | admin | admin / password |
| BSNL | admin | admin |
| TP-Link | admin | admin |
| Most others | admin | admin / password |

---

## Step 4: Find Port Forwarding Settings

Look for these sections (varies by router):
- **Port Forwarding**
- **Virtual Server**
- **NAT / Gaming**
- **Advanced > Port Forwarding**
- **Firewall > Port Forwarding**

---

## Step 5: Add Port Forwarding Rules

### Rule 1: Frontend (Vite Dev Server)
| Field | Value |
|-------|-------|
| Name/Description | MH26 Frontend |
| Protocol | TCP |
| External Port | 5173 |
| Internal Port | 5173 |
| Internal IP | Your laptop IP (e.g., `192.168.1.105`) |
| Enable | ✅ Yes |

### Rule 2: Backend (Node Server)
| Field | Value |
|-------|-------|
| Name/Description | MH26 Backend |
| Protocol | TCP |
| External Port | 5000 |
| Internal Port | 5000 |
| Internal IP | Your laptop IP (e.g., `192.168.1.105`) |
| Enable | ✅ Yes |

**Save/Apply the changes**

---

## Step 6: Allow Through Windows Firewall

Open PowerShell **as Administrator**:

```powershell
# Allow Frontend
netsh advfirewall firewall add rule name="MH26 Frontend" dir=in action=allow protocol=TCP localport=5173

# Allow Backend
netsh advfirewall firewall add rule name="MH26 Backend" dir=in action=allow protocol=TCP localport=5000
```

---

## Step 7: Update Your Environment Files

### frontend/.env
```env
VITE_API_URL=http://YOUR_PUBLIC_IP:5000/api
```

Example:
```env
VITE_API_URL=http://103.156.42.87:5000/api
```

### server/.env
```env
CORS_ORIGIN=http://YOUR_PUBLIC_IP:5173,http://localhost:5173
FRONTEND_URL=http://YOUR_PUBLIC_IP:5173
```

---

## Step 8: Start Your Servers

```powershell
npm run dev
```

---

## Step 9: Share the URL

Give your friend this URL:
```
http://YOUR_PUBLIC_IP:5173
```

Example: `http://103.156.42.87:5173`

---

## Troubleshooting

### "Connection Refused" or "Timeout"

1. **Check firewall rules** (Step 6)
2. **Verify port forwarding** in router
3. **ISP blocking ports?** - Some ISPs block common ports
4. **Double-NAT?** - If behind multiple routers, need to forward on all

### Test if Port is Open

Use online tool: https://www.yougetsignal.com/tools/open-ports/
- Enter your public IP
- Enter port 5173
- Check if "Open" or "Closed"

### ISP Blocking Ports

Some ISPs (especially mobile hotspots) block incoming connections. Try:
1. Use different ports (e.g., 8080 instead of 5173)
2. Contact ISP
3. Use tunnel service (ngrok/localtunnel) instead

### Public IP Changes

Most home internet has **dynamic IP** that changes. If URL stops working:
1. Check new public IP at whatismyip.com
2. Update environments
3. Share new URL

---

## Cleanup (IMPORTANT!)

When done testing, **remove the port forwarding rules**:

### Router:
1. Go back to port forwarding settings
2. Delete or disable the two rules

### Windows Firewall:
```powershell
netsh advfirewall firewall delete rule name="MH26 Frontend"
netsh advfirewall firewall delete rule name="MH26 Backend"
```

---

## Quick Reference

| What | Value |
|------|-------|
| Your Local IP | Run `ipconfig` |
| Your Public IP | https://whatismyip.com |
| Frontend Port | 5173 |
| Backend Port | 5000 |
| Share URL | `http://PUBLIC_IP:5173` |
