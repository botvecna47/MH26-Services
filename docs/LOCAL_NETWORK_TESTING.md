# Local Network Testing Guide

Run your MH26 Services app on your laptop and access it from phones, tablets, and other computers on the same WiFi network.

---

## Quick Start (5 minutes)

### Step 1: Find Your Laptop's IP Address

Open PowerShell and run:
```powershell
ipconfig
```

Look for **IPv4 Address** under your WiFi adapter (e.g., `192.168.1.105`)

---

### Step 2: Update Frontend Environment

Edit `frontend/.env` and add/update:
```env
VITE_API_URL=http://YOUR_IP:5000/api
```

Example:
```env
VITE_API_URL=http://192.168.1.105:5000/api
```

---

### Step 3: Update Backend Allowed Origins

Edit `server/.env` and update:
```env
FRONTEND_URL=http://YOUR_IP:5173
CORS_ORIGIN=http://YOUR_IP:5173,http://localhost:5173
```

Example:
```env
FRONTEND_URL=http://192.168.1.105:5173
CORS_ORIGIN=http://192.168.1.105:5173,http://localhost:5173
```

---

### Step 4: Configure Vite to Expose on Network

Edit `frontend/vite.config.ts` and add the `host` option:

```typescript
export default defineConfig({
  // ... existing config
  server: {
    host: '0.0.0.0',  // <-- ADD THIS LINE
    port: 5173,
  },
  // ...
});
```

---

### Step 5: Allow Through Windows Firewall

Open PowerShell **as Administrator** and run:
```powershell
# Allow Vite dev server
netsh advfirewall firewall add rule name="Vite Dev Server" dir=in action=allow protocol=TCP localport=5173

# Allow Backend server
netsh advfirewall firewall add rule name="Node Backend" dir=in action=allow protocol=TCP localport=5000
```

---

### Step 6: Start the Servers

```powershell
# In project root
npm run dev
```

---

### Step 7: Access from Other Devices

On your phone/tablet/other computer (same WiFi):

1. Open browser
2. Go to: `http://YOUR_IP:5173`
   - Example: `http://192.168.1.105:5173`

---

## Troubleshooting

### "Connection Refused" or "Cannot Connect"

1. **Check firewall** - Make sure rules were added (Step 5)
2. **Check IP** - Your IP might have changed, run `ipconfig` again
3. **Same network?** - All devices must be on the same WiFi

### "CORS Error"

- Double-check `CORS_ORIGIN` in `server/.env` includes your IP
- Restart the backend server after changes

### "API Not Working"

- Check if backend is running on port 5000
- Verify `VITE_API_URL` in frontend uses correct IP

### Mobile Shows Blank Page

- Clear browser cache on mobile
- Try incognito/private mode

---

## Alternative: ngrok (Access from Anywhere)

If you need access from outside your network (different WiFi, friends testing):

### Install ngrok
```powershell
winget install ngrok.ngrok
```

### Authenticate (one-time)
1. Create free account at https://ngrok.com
2. Get auth token from dashboard
3. Run: `ngrok config add-authtoken YOUR_TOKEN`

### Start tunnels
```powershell
# Terminal 1: Expose frontend
ngrok http 5173

# Terminal 2: Expose backend
ngrok http 5000
```

ngrok gives you public URLs like:
- Frontend: `https://abc123.ngrok.io`
- Backend: `https://xyz789.ngrok.io`

Update your frontend to use the ngrok backend URL.

---

## Quick Checklist

- [ ] Found laptop IP with `ipconfig`
- [ ] Updated `frontend/.env` with `VITE_API_URL`
- [ ] Updated `server/.env` with `CORS_ORIGIN`
- [ ] Added `host: '0.0.0.0'` to vite.config.ts
- [ ] Added firewall rules
- [ ] Started servers with `npm run dev`
- [ ] Tested from another device

---

## Cleanup (After Testing)

Remove firewall rules when done:
```powershell
netsh advfirewall firewall delete rule name="Vite Dev Server"
netsh advfirewall firewall delete rule name="Node Backend"
```

Revert `.env` files back to `localhost` for normal development.
