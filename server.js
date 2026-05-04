const http = require('http');
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const { spawn } = require('child_process');

const server = http.createServer((req, res) => {
    const currentHost = req.headers.host;
    const url = new URL(req.url, `http://${currentHost}`);
    
    // 1. Endpoint: /DATA/start_mgame.txt
    if (url.pathname === '/DATA/start_mgame.txt') {
        const plainText = `C:\\Program Files\\LostSaga\\autoupgrade.exe?1926794918?C:\\Program Files\\LostSaga\\Info\\autoupgrade_info_mgame.ini?3562326188?C:\\Program Files\\LostSaga?${currentHost}/DATA/autoupgrade.exe?C:\\Program Files\\LostSaga\\Info?http://${currentHost}/DATA/autoupgrade_info_mgame.ini?C:\\Program Files\\LostSaga\\full.zip?EDEW3940FVDP4950,10,20,30,1,autoupgrade_info_mgame.ini,0,0,1,938433398?0?0?60172211986092,60176506953388?2020,12,08,0?1?\\lswebbroker.exe`;
        
        zlib.gzip(plainText, (err, buffer) => {
            res.writeHead(200, {
                'Date': new Date().toUTCString(),
                'Server': 'Apache/2',
                'Last-Modified': 'Fri, 17 Oct 2025 14:11:36 GMT',
                'ETag': '"1d2-6415b4fbf27a0-gzip"',
                'Accept-Ranges': 'bytes',
                'Vary': 'Accept-Encoding,User-Agent',
                'Content-Encoding': 'gzip',
                'Content-Type': 'text/plain',
                'Content-Length': buffer.length
            });
            res.end(buffer);
        });
        console.log(`[GET] start_mgame.txt -> ${currentHost}`);
    } 

    // 2. Endpoint: /DATA/autoupgrade_info_mgame.ini
    else if (url.pathname === '/DATA/autoupgrade_info_mgame.ini') {
        const body = `[autoupgrade_info]
patch_url 	= http://${currentHost}/Origin/
admin_patch_url = http://${currentHost}/Origin/
login_url 	= http://172.30.82.199/
shortcut_name 	= \\LostSagaIDTest.URL
zone_name 	= ID_DevZone_199
target_url 	= 172.30.82.199
chage_url 	= 
logout_url      = 
banner_url      = http://lostsaga-origin.valofe.com/launcher/banner
background_url  = http://lostsaga-origin.valofe.com/launcher/banner
log_server_ip 	= 43.133.137.26
log_server_port	= 14013
program_menu_folder_name    = LostSagaIDTest
program_menu_web_name       = LostSagaIDTest.URL
program_menu_uninstall_name = LostSagaIDTest.LNK
copy_version    = 20200128
[login]
login_ip	= 43.129.51.47
login_port	= 40005`;

        zlib.gzip(body, (err, buffer) => {
            res.writeHead(200, {
                'Date': new Date().toUTCString(),
                'Server': 'Apache/2',
                'Upgrade': 'h2,h2c',
                'Connection': 'Upgrade, Keep-Alive',
                'Last-Modified': 'Fri, 17 Oct 2025 13:05:22 GMT',
                'ETag': '"32a-6415a62e5e423-gzip"',
                'Accept-Ranges': 'bytes',
                'Vary': 'Accept-Encoding,User-Agent',
                'Content-Encoding': 'gzip',
                'Content-Length': buffer.length,
                'Keep-Alive': 'timeout=2, max=100'
            });
            res.end(buffer);
        });
        console.log(`[GET] autoupgrade_info_mgame.ini -> ${currentHost}`);
    }

    // 3. Endpoint: /DATA/autoupgrade.exe
    else if (url.pathname === '/DATA/autoupgrade.exe') {
        const filePath = path.join(__dirname, 'autoupgrade.exe');
        
        if (fs.existsSync(filePath)) {
            const stat = fs.statSync(filePath);
            res.writeHead(200, {
                'Date': new Date().toUTCString(),
                'Server': 'Apache/2',
                'Last-Modified': 'Sun, 06 Oct 2024 13:46:39 GMT',
                'ETag': '"c9b600-623cf222f6dc0"',
                'Accept-Ranges': 'bytes',
                'Content-Length': stat.size,
                'Content-Type': 'application/x-msdownload'
            });
            fs.createReadStream(filePath).pipe(res);
            console.log(`[GET] autoupgrade.exe -> streaming`);
        } else {
            res.writeHead(404).end();
        }
    }

    // 4. Endpoint: /Origin/server_patch.cfg.iop
    else if (url.pathname === '/Origin/server_patch.cfg.iop') {
        const filePath = path.join(__dirname, 'server_patch.cfg.iop');
        
        if (fs.existsSync(filePath)) {
            const stat = fs.statSync(filePath);
            res.writeHead(200, {
                'Date': new Date().toUTCString(),
                'Server': 'nginx',
                'Content-Type': 'application/octet-stream',
                'Content-Length': stat.size,
                'Last-Modified': 'Sun, 26 Apr 2026 13:51:58 GMT',
                'ETag': '"69ee187e-e5"',
                'Strict-Transport-Security': 'max-age=31536000',
                'Accept-Ranges': 'bytes'
            });
            fs.createReadStream(filePath).pipe(res);
            console.log(`[GET] server_patch.cfg.iop -> streaming`);
        } else {
            res.writeHead(404).end();
        }
    } 

    else {
        res.writeHead(404).end();
    }
});

const PORT = 8080; 
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    const token = process.env.TUNNELING_LSO;
    if (token) {
        console.log('\x1b[33m[TUNNEL]\x1b[0m Starting cloudflared tunnel...');
        
        const cf = spawn('cloudflared', ['tunnel', 'run', '--token', token]);

        cf.stderr.on('data', (data) => {
            const output = data.toString();
            
            // Look for the JSON config in the "Updated to new configuration" log
            const configMatch = output.match(/config="({.+})"/);
            if (configMatch) {
                try {
                    const config = JSON.parse(configMatch[1].replace(/\\"/g, '"'));
                    if (config.ingress && config.ingress[0]) {
                        const { hostname, service } = config.ingress[0];
                        console.log(`\x1b[32m[TUNNEL]\x1b[0m Tunnel Online: \x1b[36m\x1b[1mhttps://${hostname}\x1b[0m -> \x1b[33m${service}\x1b[0m`);
                    }
                } catch (e) {
                    // Fallback to simpler regex if JSON parse fails
                    const hostMatch = output.match(/hostname=([^\s]+)/);
                    if (hostMatch) {
                        console.log(`\x1b[32m[TUNNEL]\x1b[0m Tunnel Online: \x1b[36m\x1b[1mhttps://${hostMatch[1]}\x1b[0m`);
                    }
                }
            }

            // Optional: Print actual errors only
            if (output.includes('ERR')) {
                console.error(`\x1b[31m[TUNNEL ERROR]\x1b[0m ${output.trim()}`);
            }
        });

        cf.on('error', (err) => {
            console.error(`\x1b[31m[TUNNEL CRITICAL]\x1b[0m ${err.message}`);
        });

        cf.on('exit', (code) => {
            if (code !== 0 && code !== null) {
                console.log(`\x1b[31m[TUNNEL]\x1b[0m Tunnel process exited (Code: ${code})`);
            }
        });
    } else {
        console.log('\x1b[90m[TUNNEL]\x1b[0m TUNNELING_LSO not set. Local mode only.');
    }
});
