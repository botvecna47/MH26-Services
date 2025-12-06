const http = require('http');

function fetch(url, label) {
    http.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                const item = json.data && json.data.length > 0 ? json.data[0] : json;
                console.log(`\n--- ${label} ---`);
                if (label === 'SERVICE') {
                    console.log('ID:', item.id);
                    console.log('Title:', item.title);
                    console.log('ImageUrl:', item.imageUrl);
                } else if (label === 'PROVIDER') {
                     // Provider list response wrapper
                     // The API returns { data: [...] } for list, but verify_api logic used to handle single item or array.
                     // Let's iterate if it's an array.
                     const items = Array.isArray(item) ? item : [item];
                     items.forEach(p => {
                         console.log('ID:', p.id);
                         console.log('Business:', p.businessName);
                         console.log('Avatar:', p.user ? p.user.avatarUrl : 'N/A');
                         console.log('Gallery:', p.gallery);
                         console.log('---');
                     });
                }
            } catch (e) {
                console.log(label + ' Error parsing JSON:', e.message);
            }
        });
    });
}

fetch('http://localhost:3000/api/services?limit=1', 'SERVICE');
fetch('http://localhost:3000/api/providers', 'PROVIDER');
