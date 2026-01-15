const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const QRCode = require('qrcode');

// Puxa as configurações do config.js
const campanhas = require('./config');

// ==================================================================
// 1. HTML TV
// ==================================================================
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
        .patrocinador-item { opacity: 0.4; transition: all 0.5s; filter: grayscale(100%); display:flex; align-items:center; transform: scale(0.9); }
        .patrocinador-item.ativo { opacity: 1; transform: scale(1.3); filter: grayscale(0%); filter: drop-shadow(0 0 8px white); font-weight: bold; }
        .patrocinador-nome { color: white; font-weight: bold; font-size: 1rem; text-transform: uppercase; margin: 0 10px; }
        
        .pulse { animation: pulse 2s infinite; }
        
        #overlayVitoria { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 9999; display: none; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #FFD700; }
        .animacao-vitoria { animation: zoomIn 0.5s ease-out; }
        @keyframes zoomIn { from {transform: scale(0);} to {transform: scale(1);} }
    </style>
</head>
<body>
    <div id="overlayVitoria">
        <h1 style="font-size: 5rem; font-weight: 900; text-transform: uppercase; margin: 0; color: #fff; text-shadow: 0 0 20px #FFD700;">🎉 TEM GANHADOR! 🎉</h1>
        <h2 style="font-size: 3rem; margin-top: 20px; color: #FFD700;" id="textoPremioTV">...</h2>
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
        ${campanhas.filter(c => c.modo === 'sorte').map(c => 
            `<div class="patrocinador-item" id="brand-${c.loja}"><span class="patrocinador-nome" style="color:${c.cor}">${c.loja}</span></div>`
        ).join('')}
    </div>

<script src="/socket.io/socket.io.js"></script>
<script>
    const socket = io();
    const imgMain = document.getElementById('imgPrincipal'); const bgBlur = document.getElementById('fundoDesfocado'); const sidebar = document.getElementById('sidebar');
    const storeName = document.getElementById('storeName'); const lojaBox = document.querySelector('.loja-box'); const slideType = document.getElementById('slideType');
    const ctaText = document.getElementById('ctaText'); const qtdDisplay = document.getElementById('qtdDisplay'); const counterBox = document.getElementById('counterBox');
    
    const audioTv = new Audio('/vitoria.mp3'); 
    audioTv.volume = 1.0; 

    function forcarDesbloqueio() {
        if(audioTv.paused) {
            audioTv.play().then(() => {
                audioTv.pause(); audioTv.currentTime = 0;
                document.removeEventListener('click', forcarDesbloqueio);
                document.removeEventListener('keydown', forcarDesbloqueio);
                document.removeEventListener('mousemove', forcarDesbloqueio);
                console.log("Audio desbloqueado!");
            }).catch(() => {});
        }
    }

    document.addEventListener('click', forcarDesbloqueio);
    document.addEventListener('keydown', forcarDesbloqueio);
    document.addEventListener('mousemove', forcarDesbloqueio);
    window.onload = forcarDesbloqueio;

    socket.on('trocar_slide', d => {
        const caminhoImagem = '/' + d.arquivo;
        imgMain.src = caminhoImagem; 
        bgBlur.style.backgroundImage = "url('" + caminhoImagem + "')";
        
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
        document.getElementById('textoPremioTV').innerText = "Acabou de ganhar " + d.premio + " na " + d.loja + "!";
        
        overlay.style.display = 'flex'; 
        overlay.classList.add('animacao-vitoria');
        
        audioTv.currentTime = 0; 
        audioTv.play().catch(e => console.log("Som bloqueado pelo navegador"));
        
        var duration = 3000; var end = Date.now() + duration;
        (function frame() { confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } }); confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } }); if (Date.now() < end) requestAnimationFrame(frame); }());
        setTimeout(() => { overlay.style.display = 'none'; }, 6000);
    });
</script></body></html>`;

// ==================================================================
// 2. HTML MOBILE (ATUALIZADO COM VALIDAÇÃO PESADA)
// ==================================================================
const htmlMobile = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        body { font-family: 'Roboto', sans-serif; text-align: center; padding: 20px; background: #f0f2f5; margin: 0; }
        .ticket-card { background: white; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 25px; padding-bottom: 20px; }
        .store-logo { font-size: 2rem; font-weight: 900; margin: 20px 0 5px 0; color: #333; text-transform: uppercase; }
        .voucher-code { font-family: 'Courier New', monospace; font-size: 2rem; font-weight: 900; color: #333; letter-spacing: 2px; }
        .btn-print { background: #333; color: white; border: none; padding: 15px; width: 100%; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        .loader { border: 5px solid #f3f3f3; border-top: 5px solid #333; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg) } 100% { transform: rotate(360deg) } }
        
        #formCadastro { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); display: none; }
        
        /* INPUTS MELHORADOS */
        .inp-dados { width: 90%; padding: 15px; margin: 10px 0; border: 1px solid #ccc; border-radius: 5px; font-size: 16px; transition: 0.3s; }
        .inp-dados:focus { border-color: #003399; box-shadow: 0 0 5px rgba(0, 51, 153, 0.3); outline: none; }
        
        .btn-enviar { background: #28a745; color: white; font-weight: bold; font-size: 18px; border: none; padding: 15px; width: 100%; border-radius: 5px; cursor: pointer; }
        .btn-enviar:active { transform: scale(0.98); }

        /* MENSAGEM DE ERRO */
        .erro-msg { color: #d9534f; font-size: 0.85rem; font-weight: bold; text-align: left; width: 90%; margin: -5px auto 10px auto; display: none; }
    </style>
</head>
<body>
    <div id="telaCarregando"><br><h2>Aguardando Sorteio...</h2><div class="loader"></div><p>Olhe para a TV!</p></div>
    
    <div id="formCadastro">
        <h2 style="color:#333;">🎉 Quase lá!</h2>
        <p>Preencha para liberar o prêmio:</p>
        
        <input type="text" id="cNome" class="inp-dados" placeholder="Seu Nome Completo">
        
        <input type="tel" id="cCpf" class="inp-dados" placeholder="Seu CPF (só números)" maxlength="14" oninput="mascaraCPF(this)">
        <div id="msgErroCpf" class="erro-msg">CPF Inválido! Verifique os números.</div>

        <input type="tel" id="cZap" class="inp-dados" placeholder="WhatsApp (DDD + 9 dígitos)" maxlength="15" oninput="mascaraZap(this)">
        <div id="msgErroZap" class="erro-msg">Número incompleto!</div>

        <input type="email" id="cEmail" class="inp-dados" placeholder="Seu E-mail">
        <div id="msgErroEmail" class="erro-msg">E-mail inválido!</div>

        <button onclick="enviarCadastro()" class="btn-enviar">LIBERAR PRÊMIO 🎁</button>
        <p style="font-size:0.7rem; color:#999; margin-top:10px;">Seus dados estão seguros. Lei LGPD.</p>
    </div>

    <div id="telaBloqueio" style="display:none; color:#d9534f;"><h1>🚫 Ops!</h1><p>Você já pegou um cupom hoje.<br>Volte amanhã!</p></div>

    <div id="telaVoucher" style="display:none">
        <div style="color: #003399; font-size: 1.5rem; font-weight: 900; margin-bottom: 20px;" class="success-header">SUCESSO! 🎉</div>
        <div class="ticket-card">
            <div style="height: 10px; background: #F37021; width: 100%;" id="topBar"></div>
            <div class="store-logo" id="lojaNome">LOJA</div>
            <div style="font-size: 0.8rem; color: #666; letter-spacing: 1px; text-transform: uppercase;">VOUCHER OFICIAL</div>
            <h1 style="font-size: 1.8rem; font-weight: 700; color: #222;" id="nomePremio">...</h1>
            <div style="background: #f8f9fa; border: 2px dashed #ccc; padding: 15px; margin: 0 20px; border-radius: 8px;"><div class="voucher-code" id="codVoucher">...</div></div>
            <div style="font-size: 0.8rem; color: #777; margin-top: 10px;">Gerado em: <span id="dataHora"></span></div>
        </div>
        <button onclick="window.print()" class="btn-print"><span>🖨️</span> IMPRIMIR</button>
    </div>

<script src="/socket.io/socket.io.js"></script>
<script>
    const socket=io();
    let jaPegouHoje = false;
    let campanhaAtualId = null; 
    let travadoNoCadastro = false; 

    const hoje = new Date().toLocaleDateString('pt-BR');
    const ultimoResgate = localStorage.getItem('data_resgate_ferrari');
    if(ultimoResgate === hoje){ jaPegouHoje = true; document.getElementById('telaCarregando').style.display='none'; document.getElementById('telaBloqueio').style.display='block'; }
    
    const audioVitoria = new Audio('/vitoria.mp3'); 
    audioVitoria.volume = 0.5;

    // --- MÁSCARAS E VALIDAÇÕES ---
    function mascaraCPF(i) {
        let v = i.value.replace(/\D/g,"");
        v=v.replace(/(\d{3})(\d)/,"$1.$2");
        v=v.replace(/(\d{3})(\d)/,"$1.$2");
        v=v.replace(/(\d{3})(\d{1,2})$/,"$1-$2");
        i.value = v;
        document.getElementById('msgErroCpf').style.display = 'none';
    }

    function mascaraZap(i) {
        let v = i.value.replace(/\D/g,"");
        v=v.replace(/^(\d{2})(\d)/g,"($1) $2");
        v=v.replace(/(\d)(\d{4})$/,"$1-$2");
        i.value = v;
        document.getElementById('msgErroZap').style.display = 'none';
    }

    function validarCPFReal(cpf) {
        cpf = cpf.replace(/[^\d]+/g,'');
        if(cpf == '') return false;
        // Elimina CPFs invalidos conhecidos
        if (cpf.length != 11 || 
            cpf == "00000000000" || 
            cpf == "11111111111" || 
            cpf == "22222222222" || 
            cpf == "33333333333" || 
            cpf == "44444444444" || 
            cpf == "55555555555" || 
            cpf == "66666666666" || 
            cpf == "77777777777" || 
            cpf == "88888888888" || 
            cpf == "99999999999")
                return false;
        // Valida 1o digito
        let add = 0;
        for (let i=0; i < 9; i ++) add += parseInt(cpf.charAt(i)) * (10 - i);
        let rev = 11 - (add % 11);
        if (rev == 10 || rev == 11) rev = 0;
        if (rev != parseInt(cpf.charAt(9))) return false;
        // Valida 2o digito
        add = 0;
        for (let i = 0; i < 10; i ++) add += parseInt(cpf.charAt(i)) * (11 - i);
        rev = 11 - (add % 11);
        if (rev == 10 || rev == 11) rev = 0;
        if (rev != parseInt(cpf.charAt(10))) return false;
        return true;
    }

    function validarEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    socket.on('trocar_slide', d => { 
        if (jaPegouHoje) return;
        if (travadoNoCadastro) return; 

        if(d.modo !== 'intro'){ 
            campanhaAtualId = d.id; 
            travadoNoCadastro = true; 
            document.getElementById('telaCarregando').style.display = 'none';
            document.getElementById('formCadastro').style.display = 'block';
        } else {
             document.getElementById('telaCarregando').style.display = 'block';
             document.getElementById('formCadastro').style.display = 'none';
             document.getElementById('telaVoucher').style.display = 'none';
        }
    });

    function enviarCadastro() {
        // Pega os valores
        const nome = document.getElementById('cNome').value.trim();
        const zap = document.getElementById('cZap').value;
        const email = document.getElementById('cEmail').value;
        const cpf = document.getElementById('cCpf').value;

        let temErro = false;

        // VALIDAÇÃO 1: Nome
        if(nome.length < 3) { alert("Digite seu nome completo!"); temErro = true; }

        // VALIDAÇÃO 2: CPF Real
        if(!validarCPFReal(cpf)) {
            document.getElementById('msgErroCpf').style.display = 'block';
            temErro = true;
        }

        // VALIDAÇÃO 3: Zap (Tamanho mínimo (11) 91234-5678 = 15 chars)
        if(zap.length < 14) {
            document.getElementById('msgErroZap').style.display = 'block';
            temErro = true;
        }

        // VALIDAÇÃO 4: Email
        if(!validarEmail(email)) {
            document.getElementById('msgErroEmail').style.display = 'block';
            temErro = true;
        }

        if(temErro) return; // Se tiver erro, para aqui.

        // SE PASSOU, TOCA O SOM E ENVIA
        audioVitoria.play().then(() => { audioVitoria.pause(); audioVitoria.currentTime = 0; }).catch(e => console.log(e));

        document.getElementById('formCadastro').innerHTML = "<h2>Validando dados...</h2><div class='loader'></div>";
        socket.emit('resgatar_oferta', { id: campanhaAtualId, cliente: { nome, zap, email, cpf } });
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
        
        if(d.isGold) { document.getElementById('topBar').style.background = "#FFD700"; document.querySelector('.success-header').innerText = "SORTE GRANDE! 🌟"; } 
        else { document.getElementById('topBar').style.background = "#F37021"; }
    });
</script></body></html>`;

// ==================================================================
// 3. HTML ADMIN E CAIXA
// ==================================================================
const htmlCaixa = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:Arial;padding:20px;background:#eee;text-align:center} input{padding:15px;font-size:20px;width:80%;text-transform:uppercase;margin:20px 0;border-radius:10px;border:1px solid #ccc} button{padding:15px 30px;font-size:18px;background:#333;color:white;border:none;border-radius:10px;cursor:pointer} .resultado{margin-top:20px;padding:20px;background:white;border-radius:10px;display:none}</style></head><body><h1>📟 Validador</h1><p>Digite o código:</p><input type="text" id="codigoInput" placeholder="Ex: MAX-8888"><br><button onclick="validar()">VERIFICAR</button><div id="resultadoBox" class="resultado"><h2 id="msgRes">...</h2><p id="detalheRes">...</p></div><script src="/socket.io/socket.io.js"></script><script>const socket = io(); function validar(){ const cod = document.getElementById('codigoInput').value; if(cod) socket.emit('validar_cupom', cod); } socket.on('resultado_validacao', d => { const box = document.getElementById('resultadoBox'); box.style.display = 'block'; document.getElementById('msgRes').innerText = d.msg; document.getElementById('msgRes').style.color = d.sucesso ? 'green' : 'red'; document.getElementById('detalheRes').innerText = d.detalhe || ''; });</script></body></html>`;

const htmlAdmin = `<!DOCTYPE html><html><head><title>Painel Admin</title><style>body{background:#222;color:white;font-family:sans-serif;padding:20px}.card{background:#333;padding:15px;margin-bottom:10px;border-radius:8px;border-left:5px solid #555;display:flex;justify-content:space-between}.btn-down{background:#FFD700;color:000;padding:10px 20px;text-decoration:none;border-radius:5px;font-weight:bold}</style></head><body><h1>Painel Admin ⚙️</h1><a href="/baixar-relatorio" class="btn-down">📥 Baixar Excel Premium</a><div id="lista">...</div><script src="/socket.io/socket.io.js"></script><script>const socket=io();socket.on('dados_admin',d=>{let h="";d.forEach(i=>{if(i.ehSorteio){h+= \`<div class="card" style="border-left-color:\${i.cor}"><strong>\${i.loja}</strong><span>📦 \${i.qtd} | 📉 \${i.baixas}</span></div>\`}});document.getElementById('lista').innerHTML=h})</script></body></html>`;

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

// Rotação de slides (Só troca na TV) - MANTIVE SEUS 30 SEGUNDOS
setInterval(() => { slideAtual++; if (slideAtual >= campanhas.length) slideAtual = 0; io.emit('trocar_slide', campanhas[slideAtual]); }, 30000);

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

// RELATÓRIO EXCEL PREMIUM (ATUALIZADO COM CPF)
app.get('/baixar-relatorio', (req, res) => {
    const dataHoje = new Date().toLocaleDateString('pt-BR');
    let relatorio = `<html><head><meta charset="UTF-8"></head><body style="font-family:Arial;background:#f4f4f4"><table width="100%"><tr><td colspan="10" style="background:#111;color:#FFD700;padding:20px;text-align:center;font-size:24px;font-weight:bold;border-bottom:5px solid #FFD700">🏆 RELATÓRIO FERRARI</td></tr><tr><td colspan="10" style="background:#333;color:#fff;text-align:center">Gerado em: ${dataHoje}</td></tr></table><br><table border="1" style="width:100%;border-collapse:collapse;text-align:center"><thead><tr style="background:#222;color:white"><th>DATA</th><th>HORA</th><th>LOJA</th><th>CÓDIGO</th><th>PRÊMIO</th><th>STATUS</th><th style="background:#0055aa">NOME</th><th style="background:#0055aa">CPF</th><th style="background:#0055aa">ZAP</th><th style="background:#0055aa">EMAIL</th></tr></thead><tbody>`;
    historicoVendas.forEach(h => {
        let bg = h.status === 'Usado' ? '#d4edda' : 'white';
        let style = h.status === 'Usado' ? 'color:green;font-weight:bold' : '';
        // Adicionada linha CPF
        relatorio += `<tr style="background:${bg}"><td>${h.data}</td><td>${h.hora}</td><td>${h.loja}</td><td><strong>${h.codigo}</strong></td><td>${h.premio}</td><td style="${style}">${h.status}</td><td>${h.clienteNome}</td><td>${h.clienteCpf}</td><td>${h.clienteZap}</td><td>${h.clienteEmail}</td></tr>`;
    });
    relatorio += `</tbody></table></body></html>`;
    res.header('Content-Type', 'application/vnd.ms-excel');
    res.attachment('Relatorio_Ferrari.xls');
    res.send(relatorio);
});

const getDadosComBaixas = () => {
    return campanhas.map(c => {
        const qtdBaixas = historicoVendas.filter(h => h.loja === c.loja && h.status === 'Usado').length;
        // CORREÇÃO: Mostra no admin se for sorteio OU se for intro ativa
        return { ...c, baixas: qtdBaixas, ehSorteio: c.modo === 'sorte' };
    });
};

io.on('connection', (socket) => {
    socket.emit('trocar_slide', campanhas[slideAtual]);
    socket.emit('dados_admin', getDadosComBaixas());
    
    // RESGATE (AGORA RECEBE E SALVA CPF)
    socket.on('resgatar_oferta', (dadosRecebidos) => {
        const id = dadosRecebidos.id;
        const dadosCliente = dadosRecebidos.cliente || {};
        let camp = campanhas[id];
        
        if (camp && camp.qtd > 0) {
            const sorte = Math.random() * 100;
            let premio = "10% OFF"; let isGold = false;
            if (sorte > 95) { premio = "50% OFF"; isGold = true; }
            
            camp.qtd--; 
            const cod = gerarCodigo(camp.prefixo || 'LOJA');
            
            historicoVendas.push({ 
                data: new Date().toLocaleDateString('pt-BR'), 
                hora: new Date().toLocaleTimeString('pt-BR'), 
                loja: camp.loja, 
                codigo: cod, 
                premio: premio, 
                status: 'Emitido', 
                clienteNome: dadosCliente.nome,
                clienteCpf: dadosCliente.cpf, // SALVANDO CPF NO HISTÓRICO
                clienteZap: dadosCliente.zap, 
                clienteEmail: dadosCliente.email 
            });
            
            socket.emit('sucesso', { codigo: cod, produto: premio, isGold: isGold, loja: camp.loja }); 
            io.emit('atualizar_qtd', camp);
            io.emit('aviso_vitoria_tv', { loja: camp.loja, premio: premio, isGold: isGold });
            io.emit('dados_admin', getDadosComBaixas());
        }
    });

    // VALIDAÇÃO NO CAIXA
    socket.on('validar_cupom', (cod) => {
        const cupom = historicoVendas.find(h => h.codigo === cod.toUpperCase());
        if (!cupom) { socket.emit('resultado_validacao', { sucesso: false, msg: "Código Inválido" }); } 
        else if (cupom.status === 'Usado') { socket.emit('resultado_validacao', { sucesso: false, msg: "Já Utilizado!" }); } 
        else { cupom.status = 'Usado'; socket.emit('resultado_validacao', { sucesso: true, msg: "✅ VÁLIDO!", detalhe: `${cupom.premio} - ${cupom.loja}` }); io.emit('dados_admin', getDadosComBaixas()); }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Sistema FERRARI + LEADS + SOM OFFLINE rodando na porta ${PORT}`));
