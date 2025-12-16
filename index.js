const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const QRCode = require('qrcode');

// IMPORTA AS CONFIGURAÇÕES
const campanhas = require('./config'); 

// ==================================================================
// 1. VISUAL "LUCKY DRAW" (CARTÃO DA SORTE)
// ==================================================================

const htmlTV = `
<!DOCTYPE html>
<html>
<head>
    <title>TV SORTEIO OFERTAS</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        body { margin: 0; background: #111; overflow: hidden; font-family: 'Montserrat', sans-serif; height: 100vh; display: flex; flex-direction: column; }
        
        /* Layout Principal */
        #main-content { flex: 1; display: flex; width: 100%; height: 85vh; }

        /* --- LADO ESQUERDO: IMAGEM (70%) --- */
        #areaImagem { 
            flex: 2.8; 
            position: relative; 
            background: #000; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            overflow: hidden; 
            border-right: 5px solid rgba(255,255,255,0.1);
        }
        #imgPrincipal { 
            max-width: 100%; 
            max-height: 100%; 
            object-fit: contain; 
            z-index: 2; 
            box-shadow: 0 0 60px rgba(0,0,0,0.8);
        }
        #fundoDesfocado { 
            position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
            background-size: cover; background-position: center; 
            filter: blur(40px) brightness(0.3); 
            z-index: 1; 
            transform: scale(1.1); /* Evita bordas brancas no blur */
        }

        /* --- LADO DIREITO: BARRA DA SORTE (30%) --- */
        #sidebar { 
            flex: 1.2; 
            background: linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%); 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            position: relative;
            overflow: hidden;
            box-shadow: -10px 0 30px rgba(0,0,0,0.5);
        }

        /* Efeito de Fundo Animado (Confete/Brilho) */
        #sidebar::before {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 20px 20px;
            opacity: 0.5;
            z-index: 0;
        }

        /* Elementos da Barra (Z-index maior que o fundo) */
        .content-wrapper { z-index: 10; width: 100%; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: space-evenly; }

        /* 1. Nome da Loja (Badge) */
        .loja-badge {
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            padding: 8px 20px;
            border-radius: 50px;
            margin-bottom: 10px;
            backdrop-filter: blur(5px);
        }
        .loja-nome { font-size: 1.2rem; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 0; }

        /* 2. Chamada de Impacto */
        .oferta-box { margin: 10px 0; }
        .oferta-titulo { font-size: 2rem; font-weight: 900; line-height: 1; margin: 0; text-shadow: 2px 2px 10px rgba(0,0,0,0.5); }
        .oferta-destaque { color: #FFD700; font-size: 3.5rem; display: block; margin-top: 5px; text-shadow: 0 0 20px rgba(255, 215, 0, 0.4); animation: glow 2s infinite alternate; }

        /* 3. QR Code "Ticket Dourado" */
        .qr-frame {
            background: linear-gradient(45deg, #FFD700, #FDB931, #FFD700); /* Moldura Dourada */
            padding: 5px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.4);
            transition: transform 0.3s;
            width: 75%;
            margin: 10px 0;
        }
        .qr-inner {
            background: white;
            padding: 10px;
            border-radius: 12px;
        }
        .qr-inner img { width: 100%; display: block; border-radius: 5px; }

        /* 4. Contador de Urgência */
        .counter-box { 
            background: rgba(0,0,0,0.3); 
            padding: 15px; 
            border-radius: 15px; 
            width: 85%;
            border: 1px dashed rgba(255,255,255,0.2);
        }
        .counter-label { font-size: 0.9rem; text-transform: uppercase; color: #aaa; margin: 0; }
        .counter-number { font-size: 3rem; font-weight: 900; color: #fff; line-height: 1; margin-top: 5px; }

        /* Rodapé Parceiros */
        #footer { height: 15vh; background: #0a0a0a; border-top: 3px solid #333; display:flex; align-items:center; justify-content:center; padding:0 20px; z-index:20; gap: 30px; }
        .patrocinador-item { opacity: 0.3; transition: all 0.5s; filter: grayscale(100%); transform: scale(0.9); }
        .patrocinador-item.ativo { opacity: 1; transform: scale(1.1); filter: grayscale(0%); filter: drop-shadow(0 0 8px rgba(255,255,255,0.3)); }
        .patrocinador-nome { color: white; font-weight: bold; font-size: 1rem; text-transform: uppercase; }

        /* Animações */
        @keyframes glow { from { text-shadow: 0 0 10px rgba(255,215,0,0.2); } to { text-shadow: 0 0 20px rgba(255,215,0,0.6); } }
        .pulse { animation: pulse-qr 1.5s infinite; }
        @keyframes pulse-qr { 0% { transform: scale(1); } 50% { transform: scale(1.03); } 100% { transform: scale(1); } }
    </style>
</head>
<body>

    <div id="main-content">
        <div id="areaImagem">
            <div id="fundoDesfocado"></div>
            <img id="imgPrincipal" src="">
        </div>

        <div id="sidebar">
            <div class="content-wrapper">
                
                <div class="loja-badge">
                    <h3 id="storeName" class="loja-nome">LOJA</h3>
                </div>

                <div class="oferta-box">
                    <div id="textoTopo" style="font-size: 1.2rem; font-weight: 400; opacity: 0.9;">ESCANEIE E GANHE</div>
                    <div id="textoDestaque" class="oferta-destaque">ATÉ 50%</div>
                    <div id="textoBaixo" class="oferta-titulo">DE DESCONTO</div>
                </div>

                <div class="qr-frame pulse">
                    <div class="qr-inner">
                        <img id="qrCode" src="qrcode.png">
                    </div>
                    <div style="background:black; color:#FFD700; font-weight:bold; font-size:0.9rem; padding:5px; margin-top:5px; border-radius:5px; text-transform:uppercase;">
                        Tente a Sorte 🍀
                    </div>
                </div>

                <div class="counter-box" id="boxContador">
                    <p class="counter-label">CUPONS RESTANTES HOJE:</p>
                    <div id="qtdDisplay" class="counter-number">--</div>
                </div>

            </div>
        </div>
    </div>

    <div id="footer">
        <div class="patrocinador-item" id="brand-OticaMax"><span class="patrocinador-nome" style="color:#2196F3">Ótica Max</span></div>
        <div class="patrocinador-item" id="brand-Hortifruti"><span class="patrocinador-nome" style="color:#4CAF50">Hortifruti</span></div>
        <div class="patrocinador-item" id="brand-Magalu"><span class="patrocinador-nome" style="color:#0086FF">Magalu</span></div>
        <div class="patrocinador-item" id="brand-Construcao"><span class="patrocinador-nome" style="color:#FF9800">Construção</span></div>
        <div class="patrocinador-item" id="brand-Calcados"><span class="patrocinador-nome" style="color:#F44336">Calçados</span></div>
        <div class="patrocinador-item" id="brand-Floricultura"><span class="patrocinador-nome" style="color:#E91E63">Floricultura</span></div>
    </div>

<script src="/socket.io/socket.io.js"></script>
<script>
    const socket = io();
    
    // Elementos
    const imgMain = document.getElementById('imgPrincipal');
    const bgBlur = document.getElementById('fundoDesfocado');
    const sidebar = document.getElementById('sidebar');
    const storeName = document.getElementById('storeName');
    const textoDestaque = document.getElementById('textoDestaque');
    const qtdDisplay = document.getElementById('qtdDisplay');
    const boxContador = document.getElementById('boxContador');

    socket.on('trocar_slide', d => {
        // Imagem
        const caminhoImagem = '/' + d.arquivo;
        imgMain.src = caminhoImagem;
        bgBlur.style.backgroundImage = \`url('\${caminhoImagem}')\`;

        // Cores Dinâmicas (Gradiente baseado na cor da loja)
        sidebar.style.background = \`linear-gradient(135deg, #111 0%, \${d.cor} 120%)\`;
        storeName.innerText = d.loja;

        // Lógica de Exibição
        if(d.modo === 'intro') {
            textoDestaque.innerText = "NOVIDADES";
            textoDestaque.style.fontSize = "2.5rem";
            document.getElementById('textoTopo').innerText = "CONHEÇA AS";
            document.getElementById('textoBaixo').innerText = "DA ESTAÇÃO";
            boxContador.style.opacity = '0'; // Esconde contador suavemente
        } else {
            // Modo Sorteio
            textoDestaque.innerText = "ATÉ 50%";
            textoDestaque.style.fontSize = "3.5rem";
            document.getElementById('textoTopo').innerText = "CUPOM DA SORTE";
            document.getElementById('textoBaixo').innerText = "DE DESCONTO";
            boxContador.style.opacity = '1';
            qtdDisplay.innerText = d.qtd;
        }

        // Rodapé
        document.querySelectorAll('.patrocinador-item').forEach(el => el.classList.remove('ativo'));
        const marcaEl = document.getElementById('brand-' + d.loja);
        if(marcaEl) marcaEl.classList.add('ativo');

        // QR Code
        fetch('/qrcode').then(r=>r.text()).then(u => document.getElementById('qrCode').src = u);
    });

    socket.on('atualizar_qtd', d => { qtdDisplay.innerText = d.qtd; });
</script>
</body>
</html>
`;

// --- RESTANTE DO CÓDIGO (MOBILE, ADMIN, SERVIDOR) PERMANECE IGUAL ---
// Mantenha o código do htmlMobile, htmlAdmin, htmlCaixa e a lógica do servidor 
// exatamente como na versão "GOLD" anterior. Vou replicar abaixo para facilitar o Copiar/Colar completo.

const htmlMobile = `
<!DOCTYPE html><html><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:Arial,sans-serif;text-align:center;padding:20px;background:#f0f2f5}.loader{border:5px solid #f3f3f3;border-top:5px solid #333;border-radius:50%;width:50px;height:50px;animation:spin 1s linear infinite;margin:20px auto}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}} .ticket{background:white; padding:20px; border-radius:10px; box-shadow:0 10px 20px rgba(0,0,0,0.1); margin-top:20px; border-top: 10px solid #333;}</style><body>
<div id="telaCarregando"><img src="logo_shopping.png" width="80" onerror="this.style.display='none'"><br><h2>Conectado!</h2><p>Aguarde a oferta na TV...</p><div class="loader"></div></div>
<div id="telaBloqueio" style="display:none; color:#d9534f;"><h1>🚫 Ops!</h1><p>Você já pegou um cupom hoje.<br>Volte amanhã para tentar de novo!</p></div>
<div id="telaVoucher" style="display:none">
    <div class="ticket" id="ticketBox">
        <h1 id="tituloPremio" style="color:#2E7D32">PARABÉNS!</h1>
        <h2 id="nomePremio" style="margin:5px 0;">...</h2>
        <div style="background:#eee; padding:15px; margin:20px 0; border:2px dashed #999; font-family:monospace; font-size:28px; font-weight:bold;" id="codVoucher">...</div>
        <p style="font-size:12px; color:#555;">Tire print e mostre no caixa.</p>
    </div>
</div>
<script src="/socket.io/socket.io.js"></script><script>
const socket=io();
let jaPegouHoje = false;
const hoje = new Date().toLocaleDateString('pt-BR');
const ultimoResgate = localStorage.getItem('data_resgate_v2');
if(ultimoResgate === hoje){ jaPegouHoje = true; document.getElementById('telaCarregando').style.display='none'; document.getElementById('telaBloqueio').style.display='block'; }
socket.on('trocar_slide',d=>{ if(d.modo !== 'intro' && !jaPegouHoje){ document.getElementById('telaCarregando').innerHTML = "<h2>Sorteando... 🍀</h2><div class='loader'></div>"; setTimeout(()=>{ socket.emit('resgatar_oferta', d.id); }, 2000); }});
socket.on('sucesso',d=>{ jaPegouHoje = true; localStorage.setItem('data_resgate_v2', hoje); document.getElementById('telaCarregando').style.display='none'; document.getElementById('telaVoucher').style.display='block'; document.getElementById('nomePremio').innerText = d.produto + " - " + d.loja; document.getElementById('codVoucher').innerText = d.codigo; if(d.isGold) { document.getElementById('tituloPremio').innerText = "🌟 SORTE GRANDE! 🌟"; document.getElementById('ticketBox').style.borderTop = "10px solid #FFD700"; document.body.style.background = "#fff8e1"; } else { document.getElementById('tituloPremio').innerText = "CUPOM GARANTIDO"; document.getElementById('ticketBox').style.borderTop = "10px solid #2E7D32"; } });
</script></body></html>`;

const htmlCaixa = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:Arial;padding:20px;background:#eee;text-align:center} input{padding:15px;font-size:20px;width:80%;text-transform:uppercase;margin:20px 0;border-radius:10px;border:1px solid #ccc} button{padding:15px 30px;font-size:18px;background:#333;color:white;border:none;border-radius:10px;cursor:pointer} .resultado{margin-top:20px;padding:20px;background:white;border-radius:10px;display:none}</style></head><body><h1>📟 Validador de Cupom</h1><p>Digite o código:</p><input type="text" id="codigoInput" placeholder="Ex: MAX-8888"><br><button onclick="validar()">VERIFICAR</button><div id="resultadoBox" class="resultado"><h2 id="msgRes">...</h2><p id="detalheRes">...</p></div><script src="/socket.io/socket.io.js"></script><script>const socket = io(); function validar(){ const cod = document.getElementById('codigoInput').value; if(cod) socket.emit('validar_cupom', cod); } socket.on('resultado_validacao', d => { const box = document.getElementById('resultadoBox'); box.style.display = 'block'; document.getElementById('msgRes').innerText = d.msg; document.getElementById('msgRes').style.color = d.sucesso ? 'green' : 'red'; document.getElementById('detalheRes').innerText = d.detalhe || ''; });</script></body></html>`;

const htmlAdmin = `<!DOCTYPE html><html><body style="background:#222;color:white;font-family:Arial;padding:20px;"><h1>Painel Admin</h1><a href="/baixar-relatorio" style="color:#FFD700">📥 Baixar Excel</a><div id="lista" style="margin-top:20px"></div><script src="/socket.io/socket.io.js"></script><script>const socket=io();socket.on('dados_admin',d=>{let html="";d.forEach((i,x)=>{html+=\`<div style='border-bottom:1px solid #555;padding:10px;opacity:\${i.ativa?1:0.5}'><b>\${i.loja} (\${i.modo})</b> - Qtd: \${i.qtd}</div>\`});document.getElementById('lista').innerHTML=html;})</script></body></html>`;

// --- SERVIDOR ---
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname));
app.use(express.static('public')); 

let historicoVendas = []; 
let slideAtual = 0;

campanhas.forEach(c => { if(!c.totalResgates) c.totalResgates = 0; });

setInterval(() => { slideAtual++; if (slideAtual >= campanhas.length) slideAtual = 0; io.emit('trocar_slide', campanhas[slideAtual]); }, 15000);

function gerarCodigo(prefixo) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return `${prefixo}-${result}`;
}

app.get('/tv', (req, res) => res.send(htmlTV));
app.get('/mobile', (req, res) => res.send(htmlMobile));
app.get('/admin', (req, res) => res.send(htmlAdmin));
app.get('/caixa', (req, res) => res.send(htmlCaixa));
app.get('/', (req, res) => res.redirect('/tv'));
app.get('/qrcode', (req, res) => { const url = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}/mobile`; QRCode.toDataURL(url, (e, s) => res.send(s)); });
app.get('/baixar-relatorio', (req, res) => {
    let csv = "\uFEFFDATA,HORA,LOJA,CODIGO,PREMIO,STATUS\n";
    historicoVendas.forEach(h => { csv += `${h.data},${h.hora},${h.loja},${h.codigo},${h.premio},${h.status}\n`; });
    res.header('Content-Type', 'text/csv; charset=utf-8'); res.attachment('relatorio_vendas.csv'); res.send(csv);
});

io.on('connection', (socket) => {
    socket.emit('trocar_slide', campanhas[slideAtual]);
    socket.emit('dados_admin', campanhas);
    socket.on('resgatar_oferta', (id) => {
        let camp = campanhas[id];
        if (camp && camp.qtd > 0) {
            const sorte = Math.random() * 100;
            let premio = "10% OFF"; let isGold = false;
            if (sorte > 95) { premio = "50% OFF"; isGold = true; }
            camp.qtd--; camp.totalResgates++;
            const cod = gerarCodigo(camp.prefixo || 'LOJA');
            historicoVendas.push({ data: new Date().toLocaleDateString('pt-BR'), hora: new Date().toLocaleTimeString('pt-BR'), loja: camp.loja, codigo: cod, premio: premio, status: 'Emitido' });
            io.emit('atualizar_qtd', camp); socket.emit('sucesso', { codigo: cod, produto: premio, isGold: isGold, loja: camp.loja }); io.emit('dados_admin', campanhas);
        }
    });
    socket.on('validar_cupom', (cod) => {
        const cupom = historicoVendas.find(h => h.codigo === cod.toUpperCase());
        if (!cupom) socket.emit('resultado_validacao', { sucesso: false, msg: "Código Inválido" });
        else if (cupom.status === 'Usado') socket.emit('resultado_validacao', { sucesso: false, msg: "Já Utilizado!" });
        else { cupom.status = 'Usado'; socket.emit('resultado_validacao', { sucesso: true, msg: "✅ VÁLIDO!", detalhe: `${cupom.premio} - ${cupom.loja}` }); }
    });
    socket.on('admin_update', (d) => { campanhas[d.id].qtd = parseInt(d.qtd); io.emit('dados_admin', campanhas); });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Sistema GOLD rodando na porta ${PORT}`));
