const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const QRCode = require('qrcode');

// --- IMPORTANDO AS CONFIGURAÇÕES ---
const campanhas = require('./config'); 

// ---------------------------------------------------------
// VISUAL NOVO (ESTILO AM/PM - VERTICAL)
// ---------------------------------------------------------

const htmlTV = `
<!DOCTYPE html>
<html>
<head>
    <title>TV SHOPPING OFERTAS</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        /* RESET E ESTRUTURA */
        body { margin: 0; background: black; overflow: hidden; font-family: 'Montserrat', sans-serif; height: 100vh; display: flex; flex-direction: column; }
        
        /* LAYOUT PRINCIPAL */
        #main-content { flex: 1; display: flex; width: 100%; height: 85vh; }

        /* LADO ESQUERDO: IMAGEM DO PRODUTO (80% da tela) */
        #areaImagem { 
            flex: 3.5; 
            position: relative; 
            background-color: #000; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            overflow: hidden; 
        }
        
        #imgPrincipal { 
            max-width: 100%; 
            max-height: 100%; 
            object-fit: contain; 
            z-index: 2; 
            display: block;
            box-shadow: 0 0 50px rgba(0,0,0,0.5);
        }
        
        #fundoDesfocado { 
            position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
            background-size: cover; background-position: center; 
            filter: blur(30px) brightness(0.4); 
            z-index: 1; 
        }

        /* LADO DIREITO: BARRA LATERAL (ESTILO AM/PM) */
        #sidebar { 
            flex: 1.2; 
            background: #003399; /* Cor padrão, muda dinamicamente */
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: space-between; /* Espalha o conteúdo */
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
            box-shadow: -10px 0 30px rgba(0,0,0,0.5);
            z-index: 10;
            transition: background-color 0.5s ease;
        }

        /* CABEÇALHO DA BARRA */
        .sidebar-header { margin-bottom: 20px; }
        .loja-nome { font-size: 1.8rem; font-weight: 900; text-transform: uppercase; margin: 0; line-height: 1; text-shadow: 2px 2px 0px rgba(0,0,0,0.2); }
        .oferta-titulo { font-size: 1.2rem; margin-top: 10px; font-weight: 400; opacity: 0.9; }

        /* QR CODE BOX (Quadrado Branco) */
        .qr-container {
            background: white;
            padding: 15px;
            border-radius: 15px;
            width: 80%;
            margin: 0 auto;
            box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        }
        
        .qr-container img { width: 100%; display: block; }

        /* CTA (Chamada para Ação) */
        .cta-text {
            color: #FFD700; /* Amarelo Ouro */
            font-weight: 900;
            font-size: 1.6rem;
            margin-top: 15px;
            text-transform: uppercase;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }

        /* DIVISOR TRACEJADO */
        .divider {
            width: 100%;
            border-top: 2px dashed rgba(255,255,255,0.4);
            margin: 20px 0;
        }

        /* CONTADOR (Rodapé da Barra) */
        .counter-area { width: 100%; }
        .counter-label { font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; margin-bottom: 0; }
        .counter-number {
            font-size: 5rem;
            font-weight: 900;
            color: #FFD700; /* Amarelo Ouro */
            line-height: 1;
            margin-top: 5px;
            text-shadow: 2px 2px 0px rgba(0,0,0,0.3);
        }

        /* RODAPÉ GERAL (PARCEIROS) */
        #footer { height: 15vh; background: #111; border-top: 4px solid #FFD700; display:flex; align-items:center; justify-content:space-around; padding:0 20px; z-index:20; }
        .patrocinador-item { opacity: 0.4; transition: all 0.5s; filter: grayscale(100%); }
        .patrocinador-item.ativo { opacity: 1; transform: scale(1.1); filter: grayscale(0%); }
        .patrocinador-nome { color: white; font-weight: bold; font-size: 0.9rem; text-transform: uppercase; }
        
        /* ANIMAÇÕES */
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
    </style>
</head>
<body>

    <div id="main-content">
        <div id="areaImagem">
            <div id="fundoDesfocado"></div>
            <img id="imgPrincipal" src="">
        </div>

        <div id="sidebar">
            <div class="sidebar-header">
                <h1 id="storeName" class="loja-nome">LOJA</h1>
                <h2 id="slideType" class="oferta-titulo">Oferta Especial</h2>
            </div>

            <div class="qr-section">
                <div class="qr-container pulse">
                    <img id="qrCode" src="qrcode.png">
                </div>
                <div id="ctaText" class="cta-text">GARANTA O SEU</div>
            </div>

            <div class="divider"></div>

            <div class="counter-area">
                <p class="counter-label">RESTAM APENAS:</p>
                <div id="qtdDisplay" class="counter-number">--</div>
            </div>
        </div>
    </div>

    <div id="footer">
        <div style="color:#555; font-size:0.8rem; font-weight:bold;">PARCEIROS:</div>
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
    
    // Elementos da Tela
    const imgMain = document.getElementById('imgPrincipal');
    const bgBlur = document.getElementById('fundoDesfocado');
    const sidebar = document.getElementById('sidebar');
    const storeName = document.getElementById('storeName');
    const slideType = document.getElementById('slideType');
    const ctaText = document.getElementById('ctaText');
    const qtdDisplay = document.getElementById('qtdDisplay');
    const counterArea = document.querySelector('.counter-area');

    socket.on('trocar_slide', d => {
        // 1. Imagem (Com correção de caminho)
        const caminhoImagem = '/' + d.arquivo;
        imgMain.src = caminhoImagem;
        bgBlur.style.backgroundImage = \`url('\${caminhoImagem}')\`;

        // 2. Cores e Textos da Barra Lateral
        sidebar.style.backgroundColor = d.cor; // A barra inteira pega a cor da loja
        storeName.innerText = d.loja; // Nome da Loja no topo

        // 3. Lógica do Tipo de Slide (Intro vs Sorte vs Desconto)
        if(d.modo === 'intro') {
            slideType.innerText = "Conheça as Novidades";
            ctaText.innerText = "ACESSE AGORA";
            counterArea.style.display = 'none'; // Esconde contador na intro
            document.querySelector('.qr-container').classList.remove('pulse');
        } 
        else if(d.modo === 'sorte') {
            slideType.innerText = "Sorteio Exclusivo";
            ctaText.innerText = "TENTE A SORTE";
            counterArea.style.display = 'block';
            qtdDisplay.innerText = d.qtd;
            document.querySelector('.qr-container').classList.add('pulse');
        }
        else if(d.modo === 'desconto') {
            slideType.innerText = "Oferta Relâmpago";
            ctaText.innerText = "PEGAR CUPOM";
            counterArea.style.display = 'block';
            qtdDisplay.innerText = d.qtd;
            document.querySelector('.qr-container').classList.add('pulse');
        }

        // 4. Rodapé (Brilho na loja atual)
        document.querySelectorAll('.patrocinador-item').forEach(el => el.classList.remove('ativo'));
        const idMarca = 'brand-' + d.loja;
        const marcaEl = document.getElementById(idMarca);
        if(marcaEl) marcaEl.classList.add('ativo');

        // 5. Gera QR Code
        fetch('/qrcode').then(r=>r.text()).then(u => document.getElementById('qrCode').src = u);
    });

    socket.on('atualizar_qtd', d => {
        qtdDisplay.innerText = d.qtd;
    });
</script>
</body>
</html>
`;

const htmlMobile = `
<!DOCTYPE html><html><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:Arial,sans-serif;text-align:center;padding:20px;background:#f0f2f5}.loader{border:5px solid #f3f3f3;border-top:5px solid #333;border-radius:50%;width:50px;height:50px;animation:spin 1s linear infinite;margin:20px auto}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style><body>
<div id="telaCarregando"><img src="logo_shopping.png" width="80" onerror="this.style.display='none'"><br><h2>Conectado!</h2><p>Aguarde a oferta na TV...</p><div class="loader"></div></div>
<div id="telaVoucher" style="display:none; background:white; padding:20px; border-radius:15px; box-shadow:0 10px 25px rgba(0,0,0,0.1);">
    <h1 style="color:#2E7D32">PARABÉNS!</h1><h2 id="nomePremio">...</h2>
    <div style="background:#eee; padding:10px; margin:20px 0; border:2px dashed #999; font-family:monospace; font-size:24px; font-weight:bold;" id="codVoucher">...</div>
    <p>Tire um print desta tela.</p>
</div>
<script src="/socket.io/socket.io.js"></script><script>
const socket=io();let jaPegou=false;
socket.on('trocar_slide',d=>{ if(d.modo !== 'intro' && !jaPegou){ document.getElementById('telaCarregando').innerHTML = "<h2>Processando...</h2><div class='loader'></div>"; setTimeout(()=>{ socket.emit('resgatar_oferta', d.id); }, 1500); }});
socket.on('sucesso',d=>{ jaPegou=true; document.getElementById('telaCarregando').style.display='none'; document.getElementById('telaVoucher').style.display='block'; document.getElementById('nomePremio').innerText=d.produto; document.getElementById('codVoucher').innerText=d.codigo; });
</script></body></html>`;

const htmlAdmin = `<!DOCTYPE html><html><body style="background:#222;color:white;font-family:Arial;padding:20px;"><h1>Painel Admin</h1><div id="lista"></div><script src="/socket.io/socket.io.js"></script><script>const socket=io();socket.on('dados_admin',d=>{let html="";d.forEach((i,x)=>{html+=\`<div style='border-bottom:1px solid #555;padding:10px;opacity:\${i.ativa?1:0.5}'><b>\${i.loja} (\${i.modo})</b> - Qtd: \${i.qtd}</div>\`});document.getElementById('lista').innerHTML=html;})</script></body></html>`;

// --- CONFIGURAÇÃO DO SERVIDOR ---
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname));
app.use(express.static('public')); 

let historicoVendas = []; 
let slideAtual = 0;

campanhas.forEach(c => {
    if(!c.resgatesPorHora) c.resgatesPorHora = new Array(24).fill(0);
    if(!c.totalResgates) c.totalResgates = 0;
});

setInterval(() => {
    slideAtual++;
    if (slideAtual >= campanhas.length) slideAtual = 0;
    io.emit('trocar_slide', campanhas[slideAtual]);
}, 15000);

function gerarCodigo(prefixo) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return `${prefixo}-${result}`;
}

app.get('/baixar-relatorio', (req, res) => {
    let csv = "\uFEFFDATA,HORA,PRODUTO,CODIGO,TIPO_PREMIO\n";
    historicoVendas.forEach(h => {
        csv += `${h.data},${h.hora},${h.produto},${h.codigo},${h.tipo}\n`;
    });
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment('relatorio_shopping.csv');
    res.send(csv);
});

app.get('/tv', (req, res) => res.send(htmlTV));
app.get('/admin', (req, res) => res.send(htmlAdmin));
app.get('/mobile', (req, res) => res.send(htmlMobile));
app.get('/', (req, res) => res.redirect('/tv'));
app.get('/qrcode', (req, res) => { 
    const url = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}/mobile`; 
    QRCode.toDataURL(url, (e, s) => res.send(s)); 
});

io.on('connection', (socket) => {
    socket.emit('trocar_slide', campanhas[slideAtual]);
    socket.emit('dados_admin', campanhas);
    socket.on('pedir_atualizacao', () => { socket.emit('trocar_slide', campanhas[slideAtual]); });
    socket.on('resgatar_oferta', (id) => {
        let camp = campanhas[id];
        if (camp && camp.qtd > 0) {
            camp.qtd--;
            camp.totalResgates++;
            const agora = new Date();
            const horaAtual = agora.getHours();
            if(horaAtual >= 0 && horaAtual <= 23) camp.resgatesPorHora[horaAtual]++;
            
            let cod = gerarCodigo(camp.prefixo || 'PROMO');
            let nomeFinal = camp.modo === 'sorte' ? "SORTEIO: " + camp.loja : "DESCONTO: " + camp.loja;
            
            historicoVendas.push({
                data: agora.toLocaleDateString('pt-BR'),
                hora: agora.toLocaleTimeString('pt-BR'),
                produto: nomeFinal,
                codigo: cod,
                tipo: camp.modo
            });

            io.emit('atualizar_qtd', camp);
            if(slideAtual === id) io.emit('trocar_slide', camp);
            socket.emit('sucesso', { codigo: cod, produto: nomeFinal, isGold: camp.modo === 'sorte' });
            io.emit('dados_admin', campanhas);
        }
    });

    socket.on('admin_update', (d) => { 
        campanhas[d.id].qtd = parseInt(d.qtd); 
        io.emit('dados_admin', campanhas); 
        if(slideAtual === d.id) io.emit('trocar_slide', campanhas[d.id]); 
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Sistema rodando na porta ${PORT}`));
