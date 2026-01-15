const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const QRCode = require('qrcode');

// IMPORTANTE: Puxa as configurações do seu arquivo config.js
const campanhas = require('./config');

// 1. HTML TV (Som Local + Alerta + Rodapé Corrigido)
const htmlTV = `
<!DOCTYPE html>
<html>
<head>
    <title>TV OFERTAS</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        body { margin: 0; background: black; overflow: hidden; font-family: 'Montserrat', sans-serif; height: 100vh; display: flex; flex-direction: column; }
        #main-content { flex: 1; display: flex; width: 100%; height: 85vh; }
        #areaImagem { flex: 3; position: relative; background-color: #000; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        #imgPrincipal { max-width: 100%; max-height: 100%; object-fit: contain; z-index: 2; display: block; box-shadow: 0 0 50px rgba(0,0,0,0.5); }
        #fundoDesfocado { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-size: cover; background-position: center; filter: blur(30px) brightness(0.4); z-index: 1; }
        #sidebar { flex: 1; background: #222; display: flex; flex-direction: column; align-items: center; justify-content: space-evenly; color: white; padding: 20px; text-align: center; box-shadow: -10px 0 30px rgba(0,0,0,0.5); z-index: 10; transition: background-color 0.5s ease; }
        .loja-box { background: white; color: #222; padding: 10px 20px; border-radius: 50px; margin-bottom: 10px; width: 90%; box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
        .loja-nome { font-size: 1.5rem; font-weight: 900; text-transform: uppercase; margin: 0; line-height: 1.1; }
        .oferta-titulo { font-size: 1.8rem; font-weight: 700; margin: 0; line-height: 1.2; text-shadow: 1px 1px 2px rgba(0,0,0,0.3); }
        .qr-container { background: white; padding: 15px; border-radius: 20px; width: 80%; margin: 10px auto; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
        .qr-container img { width: 100%; display: block; }
        .cta-text { color: #FFD700; font-weight: 900; font-size: 1.4rem; text-transform: uppercase; margin-top: 5px; }
        .divider { width: 90%; border-top: 2px dashed rgba(255,255,255,0.3); margin: 10px 0; }
        .counter-number { font-size: 6rem; font-weight: 900; color: #FFD700; line-height: 0.9; margin-top: 5px; text-shadow: 3px 3px 0px rgba(0,0,0,0.3); }
        
        #footer { height: 15vh; background: #111; border-top: 4px solid #FFD700; display:flex; align-items:center; justify-content:space-around; padding:0 10px; z-index:20; }
        .patrocinador-item { opacity: 0.4; transition: all 0.5s; filter: grayscale(100%); display:flex; align-items:center; }
        .patrocinador-item.ativo { opacity: 1; transform: scale(1.2); filter: grayscale(0%); filter: drop-shadow(0 0 5px white); }
        .patrocinador-nome { color: white; font-weight: bold; font-size: 0.8rem; text-transform: uppercase; }
        .pulse { animation: pulse 2s infinite; }
        
        #overlayVitoria { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 9999; display: none; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #FFD700; }
        .animacao-vitoria { animation: zoomIn 0.5s ease-out; }
        @keyframes zoomIn { from {transform: scale(0);} to {transform: scale(1);} }
        .titulo-vitoria { font-size: 5rem; font-weight: 900; text-transform: uppercase; margin: 0; color: #fff; text-shadow: 0 0 20px #FFD700; }
        .subtitulo-vitoria { font-size: 3rem; margin-top: 20px; color: #FFD700; }
    </style>
</head>
<body onclick="desbloquearAudio()">
    <div id="overlayVitoria">
        <h1 class="titulo-vitoria">🎉 TEM GANHADOR! 🎉</h1>
        <h2 class="subtitulo-vitoria" id="textoPremioTV">...</h2>
    </div>

    <div id="main-content">
        <div id="areaImagem"><div id="fundoDesfocado"></div><img id="imgPrincipal" src=""></div>
        <div id="sidebar">
            <div class="loja-box"><h1 id="storeName" class="loja-nome">LOJA</h1></div>
            <h2 id="slideType" class="oferta-titulo">Oferta Especial</h2>
            <div class="qr-container pulse"><img id="qrCode" src="qrcode.png"></div>
            <div id="ctaText" class="cta-text">GARANTA O SEU</div>
            <div class="divider"></div>
            <div class="counter-area" id="counterBox"><p class="counter-label" style="text-transform:uppercase; font-size:0.9rem;">Restam Apenas:</p><div id="qtdDisplay" class="counter-number">--</div></div>
        </div>
    </div>
    
    <div id="footer">
        ${campanhas.filter(c => c.modo === 'intro').map(c => 
            `<div class="patrocinador-item" id="brand-${c.loja}"><span class="patrocinador-nome" style="color:${c.cor}">${c.loja}</span></div>`
        ).join('')}
    </div>

<script src="/socket.io/socket.io.js"></script>
<script>
    const socket = io();
    const imgMain = document.getElementById('imgPrincipal'); const bgBlur = document.getElementById('fundoDesfocado'); const sidebar = document.getElementById('sidebar');
    const storeName = document.getElementById('storeName'); const lojaBox = document.querySelector('.loja-box'); const slideType = document.getElementById('slideType');
    const ctaText = document.getElementById('ctaText'); const qtdDisplay = document.getElementById('qtdDisplay'); const counterBox = document.getElementById('counterBox');
    
    // SOM LOCAL (SEM FALHAR)
    const audioTv = new Audio('/vitoria.mp3'); 
    audioTv.volume = 1.0; 
    
    function desbloquearAudio(){ audioTv.play().then(()=>audioTv.pause()); }

    socket.on('trocar_slide', d => {
        const caminhoImagem = '/' + d.arquivo;
        imgMain.src = caminhoImagem; 
        
        // CORREÇÃO AQUI: Usando crases (backticks) corretamente
        bgBlur.style.backgroundImage = \`url('\${caminhoImagem}')\`;
        
        sidebar.style.backgroundColor = d.cor; storeName.innerText = d.loja; lojaBox.style.color = d.cor;
        if(d.modo === 'intro') { slideType.innerText = "Conheça a Loja"; ctaText.innerText = "ACESSE AGORA"; counterBox.style.display = 'none'; document.querySelector('.qr-container').classList.remove('pulse'); }
        else { slideType.innerText = "Sorteio do Dia"; ctaText.innerText = "TENTE A SORTE"; counterBox.style.display = 'block'; qtdDisplay.innerText = d.qtd; document.querySelector('.qr-container').classList.add('pulse'); }
        document.querySelectorAll('.patrocinador-item').forEach(el => el.classList.remove('ativo'));
        const marcaEl = document.getElementById('brand-' + d.loja); if(marcaEl) marcaEl.classList.add('ativo');
        fetch('/qrcode').then(r=>r.text()).then(u => document.getElementById('qrCode').src = u);
    });
    socket.on('atualizar_qtd', d => { qtdDisplay.innerText = d.qtd; });
    socket.on('aviso_vitoria_tv', d => {
        const overlay = document.getElementById('overlayVitoria');
        document.getElementById('textoPremioTV').innerText = \`Acabou de ganhar \${d.premio} na \${d.loja}!\`;
        overlay.style.display = 'flex'; overlay.classList.add('animacao-vitoria');
        audioTv.currentTime = 0; audioTv.play().catch(e => console.log("Precisa clicar na TV para ativar som"));
        var duration = 3000; var end = Date.now() + duration;
        (function frame() { confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } }); confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } }); if (Date.now() < end) requestAnimationFrame(frame); }());
        setTimeout(() => { overlay.style.display = 'none'; }, 6000);
    });
</script></body></html>`;

// 2. HTML MOBILE (COM TRAVA INTELIGENTE)
const htmlMobile = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        body { font-family: 'Roboto', sans-serif; text-align: center; padding: 20px; background: #f0f2f5; margin: 0; }
        .success-header { color: #003399; font-size: 1.5rem; font-weight: 900; margin-bottom: 20px; text-transform: uppercase; }
        .ticket-card { background: white; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 25px; padding-bottom: 20px; }
        .color-bar { height: 10px; background: #F37021; width: 100%; }
        .store-logo { font-size: 2rem; font-weight: 900; margin: 20px 0 5px 0; color: #333; text-transform: uppercase; }
        .voucher-label { font-size: 0.8rem; color: #666; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 15px; }
        .product-name { font-size: 1.8rem; font-weight: 700; color: #222; padding: 0 20px; margin-bottom: 20px; line-height: 1.2; }
        .code-box { background: #f8f9fa; border: 2px dashed #ccc; padding: 15px; margin: 0 20px; border-radius: 8px; }
        .voucher-code { font-family: 'Courier New', monospace; font-size: 2rem; font-weight: 900; color: #333; letter-spacing: 2px; }
        .date-info { font-size: 0.8rem; color: #777; margin-top: 10px; }
        .btn-print { background: #333; color: white; border: none; padding: 15px; width: 100%; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        .btn-print:active { transform: scale(0.98); }
        .loader { border: 5px solid #f3f3f3; border-top: 5px solid #333; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg) } 100% { transform: rotate(360deg) } }
        #formCadastro { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); display: none; }
        .inp-dados { width: 90%; padding: 15px; margin: 10px 0; border: 1px solid #ccc; border-radius: 5px; font-size: 16px; }
        .btn-enviar { background: #28a745; color: white; font-weight: bold; font-size: 18px; border: none; padding: 15px; width: 100%; border-radius: 5px; cursor: pointer; }
        @media print { body { background: white; padding: 0; } .btn-print, .no-print { display: none; } .ticket-card { box-shadow: none; border: 1px solid #ccc; } .success-header { color: black; } }
    </style>
</head>
<body>
    <div id="telaCarregando"><br><h2>Aguardando Sorteio...</h2><div class="loader"></div><p>Olhe para a TV!</p></div>
    <div id="formCadastro">
        <h2 style="color:#333;">🎉 Quase lá!</h2>
        <p>Para liberar seu prêmio, preencha:</p>
        <input type="text" id="cNome" class="inp-dados" placeholder="Seu Nome Completo">
        <input type="tel" id="cZap" class="inp-dados" placeholder="Seu WhatsApp (com DDD)">
        <input type="email" id="cEmail" class="inp-dados" placeholder="Seu E-mail">
        <button onclick="enviarCadastro()" class="btn-enviar">LIBERAR PRÊMIO 🎁</button>
        <p style="font-size:0.7rem; color:#999; margin-top:10px;">Seus dados estão seguros. Lei LGPD.</p>
    </div>
    <div id="telaBloqueio" style="display:none; color:#d9534f;"><h1>🚫 Ops!</h1><p>Você já pegou um cupom hoje.<br>Volte amanhã!</p></div>
    <div id="telaVoucher" style="display:none">
        <div class="success-header">SUCESSO! 🎉</div>
        <div class="ticket-card">
            <div class="color-bar" id="topBar"></div>
            <div class="store-logo" id="lojaNome">LOJA</div>
            <div class="voucher-label">VOUCHER OFICIAL</div>
            <h1 class="product-name" id="nomePremio">...</h1>
            <div class="code-box"><div class="voucher-code" id="codVoucher">...</div></div>
            <div class="date-info">Gerado em: <span id="dataHora"></span><br>Válido hoje.</div>
        </div>
        <button onclick="window.print()" class="btn-print"><span>🖨️</span> IMPRIMIR</button>
        <p class="no-print" style="font-size:0.8rem; color:#aaa; margin-top:20px;">⚠️ Você já garantiu seu cupom de hoje.</p>
    </div>
<script src="/socket.io/socket.io.js"></script>
<script>
    const socket=io();
    let jaPegouHoje = false;
    let campanhaAtualId = null; 
    let travadoNoCadastro = false; // NOVA TRAVA

    const hoje = new Date().toLocaleDateString('pt-BR');
    const ultimoResgate = localStorage.getItem('data_resgate_ferrari');
    
    if(ultimoResgate === hoje){ jaPegouHoje = true; document.getElementById('telaCarregando').style.display='none'; document.getElementById('telaBloqueio').style.display='block'; }
    
    // USANDO SOM LOCAL
    const audioVitoria = new Audio('/vitoria.mp3'); 
    audioVitoria.volume = 0.5;

    socket.on('trocar_slide', d => { 
        // 1. Se já pegou hoje, ignora tudo.
        if (jaPegouHoje) return;

        // 2. Se o formulário já está aberto, IGNORA a TV e mantém o cliente onde está.
        if (travadoNoCadastro) return;

        // 3. Se for um slide de Sorteio (e não estiver travado)
        if(d.modo !== 'intro'){ 
            campanhaAtualId = d.id; 
            travadoNoCadastro = true; // ATIVA A TRAVA! O cliente agora "segura" essa loja.
            
            document.getElementById('telaCarregando').style.display = 'none';
            document.getElementById('formCadastro').style.display = 'block';
        } else {
             // Se for Intro, mostra carregando
             document.getElementById('telaCarregando').style.display = 'block';
             document.getElementById('formCadastro').style.display = 'none';
             document.getElementById('telaVoucher').style.display = 'none';
        }
    });

    function enviarCadastro() {
        const nome = document.getElementById('cNome').value;
        const zap = document.getElementById('cZap').value;
        const email = document.getElementById('cEmail').value;
        if(!nome || !zap || !email) { alert("Por favor, preencha todos os campos!"); return; }
        
        document.getElementById('formCadastro').innerHTML = "<h2>Validando...</h2><div class='loader'></div>";
        socket.emit('resgatar_oferta', { id: campanhaAtualId, cliente: { nome, zap, email } });
    }

    socket.on('sucesso', d => { 
        jaPegouHoje = true; localStorage.setItem('data_resgate_ferrari', hoje);
        document.getElementById('formCadastro').style.display='none'; 
        document.getElementById('telaVoucher').style.display='block'; 
        document.getElementById('lojaNome').innerText = d.loja; 
        document.getElementById('lojaNome').style.color = d.isGold ? '#FFD700' : '#333';
        document.getElementById('nomePremio').innerText = d.produto; 
        document.getElementById('codVoucher').innerText = d.codigo;
        const agora = new Date(); document.getElementById('dataHora').innerText = agora.toLocaleDateString('pt-BR') + ' ' + agora.toLocaleTimeString('pt-BR');
        
        audioVitoria.play().catch(e=>console.log(e));
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => confetti({ particleCount: 100, spread: 100, origin: { y: 0.6 } }), 500);
        
        if(d.isGold) { document.getElementById('topBar').style.background = "#FFD700"; document.querySelector('.success-header').innerText = "SORTE GRANDE! 🌟"; } 
        else { document.getElementById('topBar').style.background = "#F37021"; }
    });
</script></body></html>`;

// 3. HTML CAIXA
const htmlCaixa = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:Arial;padding:20px;background:#eee;text-align:center} input{padding:15px;font-size:20px;width:80%;text-transform:uppercase;margin:20px 0;border-radius:10px;border:1px solid #ccc} button{padding:15px 30px;font-size:18px;background:#333;color:white;border:none;border-radius:10px;cursor:pointer} .resultado{margin-top:20px;padding:20px;background:white;border-radius:10px;display:none}</style></head><body><h1>📟 Validador</h1><p>Digite o código:</p><input type="text" id="codigoInput" placeholder="Ex: MAX-8888"><br><button onclick="validar()">VERIFICAR</button><div id="resultadoBox" class="resultado"><h2 id="msgRes">...</h2><p id="detalheRes">...</p></div><script src="/socket.io/socket.io.js"></script><script>const socket = io(); function validar(){ const cod = document.getElementById('codigoInput').value; if(cod) socket.emit('validar_cupom', cod); } socket.on('resultado_validacao', d => { const box = document.getElementById('resultadoBox'); box.style.display = 'block'; document.getElementById('msgRes').innerText = d.msg; document.getElementById('msgRes').style.color = d.sucesso ? 'green' : 'red'; document.getElementById('detalheRes').innerText = d.detalhe || ''; });</script></body></html>`;

// 4. HTML ADMIN (Com monitoramento de estoque e baixas)
const htmlAdmin = `
<!DOCTYPE html>
<html>
<head>
    <title>Painel Admin</title>
    <style>
        body { background: #222; color: white; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; }
        .card { background: #333; padding: 15px; margin-bottom: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border-left: 5px solid #555; }
        .btn-down { background-color: #FFD700; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-bottom: 20px; }
        .badge { padding: 5px 10px; border-radius: 15px; font-size: 0.9em; font-weight: bold; }
        .estoque { background: #0086FF; color: white; }
        .baixas { background: #28a745; color: white; }
        .loja-title { font-size: 1.2em; font-weight: bold; }
    </style>
</head>
<body>
    <h1>Painel Admin ⚙️</h1>
    <a href="/baixar-relatorio" class="btn-down">📥 Baixar Excel Completo (Com Leads)</a>
    <div id="lista">Carregando dados...</div>
    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket=io();
        socket.on('dados_admin', d => {
            let html="";
            d.forEach((i) => {
                if(i.ehSorteio) {
                    html += \`
                    <div class="card" style="border-left-color: \${i.cor}">
                        <div class="loja-title">\${i.loja}</div>
                        <div>
                            <span class="badge estoque">📦 Restam: \${i.qtd}</span>
                            <span class="badge baixas" style="margin-left:10px;">📉 Usados: \${i.baixas}</span>
                        </div>
                    </div>\`;
                }
            });
            document.getElementById('lista').innerHTML = html;
        })
    </script>
</body>
</html>`;

// ==================================================================
// MOTOR DO SERVIDOR
// ==================================================================
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

// ROTAS
app.get('/tv', (req, res) => res.send(htmlTV));
app.get('/mobile', (req, res) => res.send(htmlMobile));
app.get('/admin', (req, res) => res.send(htmlAdmin));
app.get('/caixa', (req, res) => res.send(htmlCaixa));
app.get('/', (req, res) => res.redirect('/tv'));
app.get('/qrcode', (req, res) => { const url = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}/mobile`; QRCode.toDataURL(url, (e, s) => res.send(s)); });

// EXCEL COM LEADS
app.get('/baixar-relatorio', (req, res) => {
    let csv = "\uFEFFDATA,HORA,LOJA,CODIGO,PREMIO,STATUS,NOME,WHATSAPP,EMAIL\n";
    historicoVendas.forEach(h => { 
        const nomeLimpo = h.clienteNome ? h.clienteNome.replace(/,/g, '') : '';
        csv += `${h.data},${h.hora},${h.loja},${h.codigo},${h.premio},${h.status},${nomeLimpo},${h.clienteZap || ''},${h.clienteEmail || ''}\n`; 
    });
    res.header('Content-Type', 'text/csv; charset=utf-8'); res.attachment('relatorio_vendas.csv'); res.send(csv);
});

const getDadosComBaixas = () => {
    return campanhas.map(c => {
        const qtdBaixas = historicoVendas.filter(h => h.loja === c.loja && h.status === 'Usado').length;
        return { ...c, baixas: qtdBaixas };
    });
};

io.on('connection', (socket) => {
    socket.emit('trocar_slide', campanhas[slideAtual]);
    socket.emit('dados_admin', getDadosComBaixas());
    
    // RESGATE DO CLIENTE
    socket.on('resgatar_oferta', (dadosRecebidos) => {
        const id = dadosRecebidos.id;
        const dadosCliente = dadosRecebidos.cliente || {}; 

        let camp = campanhas[id];
        if (camp && camp.qtd > 0) {
            const sorte = Math.random() * 100;
            let premio = "10% OFF"; let isGold = false;
            if (sorte > 95) { premio = "50% OFF"; isGold = true; }
            camp.qtd--; camp.totalResgates++;
            const cod = gerarCodigo(camp.prefixo || 'LOJA');
            
            historicoVendas.push({ 
                data: new Date().toLocaleDateString('pt-BR'), 
                hora: new Date().toLocaleTimeString('pt-BR'), 
                loja: camp.loja, 
                codigo: cod, 
                premio: premio, 
                status: 'Emitido',
                clienteNome: dadosCliente.nome,
                clienteZap: dadosCliente.zap,
                clienteEmail: dadosCliente.email
            });
            
            socket.emit('sucesso', { codigo: cod, produto: premio, isGold: isGold, loja: camp.loja }); 
            io.emit('atualizar_qtd', camp);
            io.emit('aviso_vitoria_tv', { loja: camp.loja, premio: premio, isGold: isGold });
            io.emit('dados_admin', getDadosComBaixas());
        }
    });

    // CAIXA VALIDAÇÃO
    socket.on('validar_cupom', (cod) => {
        const cupom = historicoVendas.find(h => h.codigo === cod.toUpperCase());
        if (!cupom) {
            socket.emit('resultado_validacao', { sucesso: false, msg: "Código Inválido" });
        } else if (cupom.status === 'Usado') {
            socket.emit('resultado_validacao', { sucesso: false, msg: "Já Utilizado!" });
        } else { 
            cupom.status = 'Usado'; 
            socket.emit('resultado_validacao', { sucesso: true, msg: "✅ VÁLIDO!", detalhe: `${cupom.premio} - ${cupom.loja}` });
            io.emit('dados_admin', getDadosComBaixas());
        }
    });

    socket.on('admin_update', (d) => { campanhas[d.id].qtd = parseInt(d.qtd); io.emit('dados_admin', getDadosComBaixas()); });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Sistema FERRARI + LEADS + SOM OFFLINE rodando na porta ${PORT}`));
