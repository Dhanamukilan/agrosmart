/**
 * AgroSmart - Shared Notification Bell Component
 * Include this script on any page to add the notification bell to the navbar.
 * Requires Font Awesome and Bootstrap to be loaded.
 */
(function () {
    // ─── Inject CSS ──────────────────────────────────────
    const style = document.createElement('style');
    style.textContent = `
        .notif-bell{position:relative;cursor:pointer;font-size:1.3rem;color:rgba(255,255,255,.8);transition:all .3s;padding:5px}
        .notif-bell:hover{color:#FFA000;transform:scale(1.1)}
        .notif-badge{position:absolute;top:-4px;right:-6px;background:#f44336;color:#fff;font-size:.6rem;min-width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700}
        .notif-panel{position:fixed;top:65px;right:20px;width:370px;max-height:480px;background:#fff;border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.18);z-index:9999;display:none;overflow:hidden;font-family:'Poppins',sans-serif}
        .notif-panel.show{display:block;animation:notifSlide .25s ease}
        @keyframes notifSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .notif-hdr{padding:16px 20px;background:linear-gradient(135deg,#1B5E20,#66BB6A);color:#fff;display:flex;justify-content:space-between;align-items:center}
        .notif-hdr h6{margin:0;font-weight:700;font-size:.9rem}
        .notif-body{max-height:360px;overflow-y:auto;padding:8px}
        .notif-body::-webkit-scrollbar{width:4px}.notif-body::-webkit-scrollbar-thumb{background:#ccc;border-radius:4px}
        .n-item{padding:12px 14px;border-bottom:1px solid #f5f5f5;cursor:pointer;transition:all .2s;display:flex;gap:12px;align-items:flex-start}
        .n-item:hover{background:#f9fdf9}
        .n-item.unread{border-left:3px solid #66BB6A;background:#f1f8e9}
        .n-icon{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:.8rem;color:#fff;flex-shrink:0}
        .n-title{font-weight:600;font-size:.82rem;color:#1B5E20}
        .n-msg{font-size:.78rem;color:#666;margin-top:2px;line-height:1.4}
        .n-time{font-size:.68rem;color:#aaa;margin-top:4px}
        .n-empty{text-align:center;padding:40px 20px;color:#aaa;font-size:.85rem}
        .msg-panel{position:fixed;top:0;right:-420px;width:400px;height:100vh;background:#fff;box-shadow:-5px 0 30px rgba(0,0,0,.15);z-index:10000;transition:right .3s ease;display:flex;flex-direction:column;font-family:'Poppins',sans-serif}
        .msg-panel.open{right:0}
        .msg-hdr{padding:20px;background:linear-gradient(135deg,#1B5E20,#66BB6A);color:#fff;display:flex;justify-content:space-between;align-items:center}
        .msg-hdr h6{margin:0;font-weight:700}
        .msg-close{background:none;border:none;color:#fff;font-size:1.2rem;cursor:pointer}
        .msg-body{flex:1;overflow-y:auto;padding:15px;background:#f9fdf9}
        .msg-bubble{max-width:80%;padding:10px 14px;border-radius:14px;margin-bottom:10px;font-size:.85rem;line-height:1.5}
        .msg-admin{background:#E8F5E9;color:#1B5E20;margin-right:auto;border-bottom-left-radius:4px}
        .msg-user{background:#E3F2FD;color:#1565C0;margin-left:auto;border-bottom-right-radius:4px}
        .msg-time{font-size:.65rem;color:#999;margin-top:3px}
        .msg-footer{padding:12px;border-top:1px solid #eee;display:flex;gap:8px}
        .msg-footer input{flex:1;border:2px solid #eee;border-radius:12px;padding:10px 14px;font-size:.85rem;outline:none;transition:all .3s}
        .msg-footer input:focus{border-color:#66BB6A}
        .msg-footer button{background:linear-gradient(135deg,#1B5E20,#66BB6A);color:#fff;border:none;border-radius:12px;padding:10px 16px;cursor:pointer;transition:all .3s}
        .msg-footer button:hover{transform:scale(1.05)}
        .q-list-item{padding:14px;border:1px solid #f0f0f0;border-radius:12px;margin-bottom:8px;cursor:pointer;transition:all .3s}
        .q-list-item:hover{border-color:#66BB6A;background:#f9fdf9}
        .q-list-item .q-subj{font-weight:600;font-size:.85rem;color:#1B5E20}
        .q-list-item .q-preview{font-size:.78rem;color:#888;margin-top:2px}
        .q-list-item .q-status{font-size:.7rem;padding:2px 8px;border-radius:20px}
    `;
    document.head.appendChild(style);

    // ─── Inject Bell into Navbar ─────────────────────────
    function injectBell() {
        const nav = document.querySelector('.navbar-nav');
        if (!nav) return;
        const li = document.createElement('li');
        li.className = 'nav-item ms-lg-2 d-flex align-items-center';
        li.innerHTML = `<div class="notif-bell" id="asBell" title="Notifications"><i class="fas fa-bell"></i><span class="notif-badge d-none" id="asBadge">0</span></div>`;
        nav.appendChild(li);

        // Inject panel
        const panel = document.createElement('div');
        panel.className = 'notif-panel';
        panel.id = 'asPanel';
        panel.innerHTML = `<div class="notif-hdr"><h6><i class="fas fa-bell me-2"></i>Notifications</h6><div><button class="btn btn-sm btn-light rounded-pill px-2 me-1" style="font-size:.7rem" id="asMyQueries"><i class="fas fa-comments me-1"></i>My Queries</button><button class="btn btn-sm btn-light rounded-pill px-2" style="font-size:.7rem" id="asMarkAll">Read All</button></div></div><div class="notif-body" id="asBody"><div class="n-empty"><i class="fas fa-bell-slash fa-2x mb-2"></i><br>No notifications</div></div>`;
        document.body.appendChild(panel);

        // Inject message panel (conversation)
        const msgPanel = document.createElement('div');
        msgPanel.className = 'msg-panel';
        msgPanel.id = 'asMsgPanel';
        msgPanel.innerHTML = `<div class="msg-hdr"><h6 id="asMsgTitle">Conversation</h6><button class="msg-close" id="asMsgClose">&times;</button></div><div class="msg-body" id="asMsgBody"></div><div class="msg-footer" id="asMsgFooter" style="display:none"><input type="text" id="asMsgInput" placeholder="Type your reply..."><button id="asMsgSend"><i class="fas fa-paper-plane"></i></button></div>`;
        document.body.appendChild(msgPanel);

        setupEvents();
        loadNotifications();
    }

    function setupEvents() {
        const bell = document.getElementById('asBell');
        const panel = document.getElementById('asPanel');
        bell.addEventListener('click', e => { e.stopPropagation(); panel.classList.toggle('show'); document.getElementById('asMsgPanel').classList.remove('open'); });
        document.addEventListener('click', e => { if (!panel.contains(e.target) && !bell.contains(e.target)) panel.classList.remove('show'); });
        document.getElementById('asMarkAll').addEventListener('click', markAllRead);
        document.getElementById('asMyQueries').addEventListener('click', showMyQueries);
        document.getElementById('asMsgClose').addEventListener('click', () => document.getElementById('asMsgPanel').classList.remove('open'));
        document.getElementById('asMsgSend').addEventListener('click', sendUserReply);
        document.getElementById('asMsgInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendUserReply(); });
    }

    function getUserEmail() {
        try { return JSON.parse(localStorage.getItem('agroSmartUser') || '{}').email || ''; } catch { return ''; }
    }

    async function loadNotifications() {
        try {
            const email = getUserEmail();
            const r = await fetch('/api/admin/notifications?email=' + encodeURIComponent(email));
            const d = await r.json();
            const badge = document.getElementById('asBadge');
            if (d.unreadCount > 0) { badge.textContent = d.unreadCount > 9 ? '9+' : d.unreadCount; badge.classList.remove('d-none'); } else { badge.classList.add('d-none'); }
            const body = document.getElementById('asBody');
            if (!d.data || d.data.length === 0) { body.innerHTML = '<div class="n-empty"><i class="fas fa-bell-slash fa-2x mb-2"></i><br>No notifications yet</div>'; return; }
            body.innerHTML = d.data.slice(0, 20).map(n => {
                const bg = n.type === 'query_reply' ? '#4CAF50' : n.type === 'market_update' ? '#2196F3' : n.type === 'market_new' ? '#FF9800' : '#9C27B0';
                const icon = n.type === 'query_reply' ? 'fa-reply' : n.type.includes('market') ? 'fa-chart-line' : 'fa-bullhorn';
                return `<div class="n-item ${n.isRead ? '' : 'unread'}" onclick="window._asMarkRead('${n._id}',this)">
                    <div class="n-icon" style="background:${bg}"><i class="fas ${icon}"></i></div>
                    <div><div class="n-title">${n.title}</div><div class="n-msg">${n.message}</div><div class="n-time"><i class="far fa-clock me-1"></i>${_asTimeAgo(n.createdAt)}</div></div></div>`;
            }).join('');
        } catch (e) { console.error('Notification load error:', e); }
    }

    window._asTimeAgo = function (d) {
        const s = Math.floor((Date.now() - new Date(d)) / 1000);
        if (s < 60) return 'Just now'; if (s < 3600) return Math.floor(s / 60) + 'm ago';
        if (s < 86400) return Math.floor(s / 3600) + 'h ago'; return Math.floor(s / 86400) + 'd ago';
    };

    window._asMarkRead = async function (id, el) {
        try { await fetch('/api/admin/notifications/' + id + '/read', { method: 'PUT' }); el.classList.remove('unread'); loadNotifications(); } catch (e) { }
    };

    async function markAllRead() {
        try { await fetch('/api/admin/notifications/read-all', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: getUserEmail() }) }); loadNotifications(); } catch (e) { }
    }

    // ─── My Queries (Conversation) ───────────────────────
    let currentQueryId = null;

    async function showMyQueries() {
        const email = getUserEmail();
        if (!email) { alert('Please login to view your queries.'); return; }
        const panel = document.getElementById('asMsgPanel');
        const body = document.getElementById('asMsgBody');
        const footer = document.getElementById('asMsgFooter');
        document.getElementById('asMsgTitle').textContent = 'My Queries';
        footer.style.display = 'none';
        panel.classList.add('open');
        document.getElementById('asPanel').classList.remove('show');
        body.innerHTML = '<div class="text-center py-4"><i class="fas fa-spinner fa-spin"></i></div>';
        try {
            const r = await fetch('/api/admin/my-queries?email=' + encodeURIComponent(email));
            const d = await r.json();
            if (!d.data || d.data.length === 0) { body.innerHTML = '<div class="n-empty">No queries yet. <a href="contact.html">Submit one</a></div>'; return; }
            body.innerHTML = d.data.map(q => {
                const statusCls = q.status === 'pending' ? 'bg-warning text-dark' : 'bg-success text-white';
                const lastMsg = q.conversation && q.conversation.length > 0 ? q.conversation[q.conversation.length - 1].text : q.message;
                return `<div class="q-list-item" onclick="window._asOpenConvo('${q._id}')">
                    <div class="d-flex justify-content-between align-items-center"><span class="q-subj">${q.subject || 'Query'}</span><span class="q-status ${statusCls}">${q.status}</span></div>
                    <div class="q-preview">${lastMsg.substring(0, 60)}...</div>
                    <div class="n-time mt-1"><i class="far fa-clock me-1"></i>${_asTimeAgo(q.updatedAt)}</div></div>`;
            }).join('');
        } catch (e) { body.innerHTML = '<div class="n-empty text-danger">Failed to load</div>'; }
    }

    window._asOpenConvo = async function (id) {
        currentQueryId = id;
        const body = document.getElementById('asMsgBody');
        const footer = document.getElementById('asMsgFooter');
        body.innerHTML = '<div class="text-center py-4"><i class="fas fa-spinner fa-spin"></i></div>';
        footer.style.display = 'flex';
        try {
            const r = await fetch('/api/admin/queries/' + id);
            const d = await r.json();
            if (!d.data) return;
            const q = d.data;
            document.getElementById('asMsgTitle').textContent = q.subject || 'Conversation';
            let html = `<div class="msg-bubble msg-user"><strong>Original Query:</strong><br>${q.message}<div class="msg-time">${new Date(q.createdAt).toLocaleString()}</div></div>`;
            if (q.conversation) {
                q.conversation.forEach(m => {
                    html += `<div class="msg-bubble ${m.sender === 'admin' ? 'msg-admin' : 'msg-user'}">${m.text}<div class="msg-time">${m.sender === 'admin' ? '🟢 Expert' : '🔵 You'} · ${new Date(m.sentAt).toLocaleString()}</div></div>`;
                });
            }
            body.innerHTML = html;
            body.scrollTop = body.scrollHeight;
        } catch (e) { body.innerHTML = '<div class="n-empty text-danger">Failed to load</div>'; }
    };

    async function sendUserReply() {
        if (!currentQueryId) return;
        const input = document.getElementById('asMsgInput');
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        try {
            await fetch('/api/admin/queries/' + currentQueryId + '/user-reply', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reply: text, email: getUserEmail() })
            });
            window._asOpenConvo(currentQueryId);
        } catch (e) { alert('Failed to send.'); }
    }

    // Auto-refresh notifications every 30s
    setInterval(loadNotifications, 30000);

    // Init
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', injectBell); }
    else { injectBell(); }
})();
