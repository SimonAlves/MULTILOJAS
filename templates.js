// --- VISUAL TV (ESTILO AM/PM) ---
const htmlTV = `
<!DOCTYPE html>
<html>
<head>
    <title>TV OFERTAS</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap" rel="stylesheet">
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
        #footer { height: 15vh; background: #111; border-top: 4px solid #FFD700; display:flex; align-items:center; justify-content:space-around; padding:0 20px; z-index:20; }
        .patrocinador-item { opacity: 0.4; transition: all 0.5s; filter: grayscale(100%); display:flex; align-items:center; }
        .patrocinador-item.ativo { opacity: 1; transform: scale(1.2); filter: grayscale(0%); filter: drop-shadow(0 0 5px white); }
        .patrocinador-nome { color: white; font-weight: bold; font-size: 0.9rem; text-transform: uppercase; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
    </style>
</head>
<body>
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
    const imgMain = document.getElementById('imgPrincipal'); const bgBlur = document.getElementById('fundoDesfocado'); const sidebar = document.getElementById('sidebar');
    const storeName = document.getElementById('storeName'); const lojaBox = document.querySelector('.loja-box'); const slideType = document.getElementById('slideType');
    const ctaText = document.getElementById('ctaText'); const qtdDisplay = document.getElementById('qtdDisplay'); const counterBox = document.getElementById('counterBox');

    socket.on('trocar_slide', d => {
        const caminhoImagem = '/' + d.arquivo;
        imgMain.src = caminhoImagem; bgBlur.style.backgroundImage = \`url('\${caminhoImagem}')\`;
        sidebar.style.backgroundColor = d.cor; storeName.innerText = d.loja; lojaBox.style.color = d.cor;
        
        if(d.modo === 'intro') {
            slideType.innerText = "Conheça a Loja"; ctaText.innerText = "ACESSE AGORA"; counterBox.style.display = 'none'; document.querySelector('.qr-container').classList.remove('pulse');
        } else {
            slideType.innerText = "Sorteio do Dia"; ctaText.innerText = "TENTE A SORTE"; counterBox.style.display = 'block'; qtdDisplay.innerText = d.qtd; document.querySelector('.qr-container').classList.add('pulse');
        }

        document.querySelectorAll('.patrocinador-item').forEach(el => el.classList.remove('ativo'));
        const marcaEl = document.getElementById('brand-' + d.loja);
        if(marcaEl) marcaEl.classList.add('ativo');

        fetch('/qrcode').then(r=>r.text()).then(u => document.getElementById('qrCode').src = u);
    });
    socket.on('atualizar_qtd', d => { qtdDisplay.innerText = d.qtd; });
</script></body></html>`;

// --- CELULAR (COM TRAVA 24H) ---
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

// VERIFICA SE JÁ PEGOU HOJE (TRAVA 24H)
if(ultimoResgate === hoje){
    jaPegouHoje = true;
    document.getElementById('telaCarregando').style.display='none';
    document.getElementById('telaBloqueio').style.display='block';
    // Se quiser mostrar o cupom antigo, pode recuperar do localStorage aqui
}

socket.on('trocar_slide',d=>{ 
    if(d.modo !== 'intro' && !jaPegouHoje){ 
        document.getElementById('telaCarregando').innerHTML = "<h2>Sorteando... 🍀</h2><div class='loader'></div>"; 
        // Delay dramático de 2s antes de pedir
        setTimeout(()=>{ socket.emit('resgatar_oferta', d.id); }, 2000); 
    }
});

socket.on('sucesso',d=>{ 
    jaPegouHoje = true;
    localStorage.setItem('data_resgate_v2', hoje); // Grava que pegou hoje
    
    document.getElementById('telaCarregando').style.display='none';
    document.getElementById('telaVoucher').style.display='block';
    
    document.getElementById('nomePremio').innerText = d.produto + " - " + d.loja;
    document.getElementById('codVoucher').innerText = d.codigo;
    
    if(d.isGold) {
        document.getElementById('tituloPremio').innerText = "🌟 SORTE GRANDE! 🌟";
        document.getElementById('ticketBox').style.borderTop = "10px solid #FFD700";
        document.body.style.background = "#fff8e1";
    } else {
        document.getElementById('tituloPremio').innerText = "CUPOM GARANTIDO";
        document.getElementById('ticketBox').style.borderTop = "10px solid #2E7D32";
    }
});
</script></body></html>`;

// --- PAINEL DO CAIXA (VALIDAÇÃO) ---
const htmlCaixa = `
<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:Arial;padding:20px;background:#eee;text-align:center} input{padding:15px;font-size:20px;width:80%;text-transform:uppercase;margin:20px 0;border-radius:10px;border:1px solid #ccc} button{padding:15px 30px;font-size:18px;background:#333;color:white;border:none;border-radius:10px;cursor:pointer} .resultado{margin-top:20px;padding:20px;background:white;border-radius:10px;display:none}</style></head>
<body>
    <h1>📟 Validador de Cupom</h1>
    <p>Digite o código apresentado pelo cliente:</p>
    <input type="text" id="codigoInput" placeholder="Ex: MAX-8888">
    <br>
    <button onclick="validar()">VERIFICAR</button>
    
    <div id="resultadoBox" class="resultado">
        <h2 id="msgRes">...</h2>
        <p id="detalheRes">...</p>
    </div>

<script src="/socket.io/socket.io.js"></script><script>
    const socket = io();
    function validar(){
        const cod = document.getElementById('codigoInput').value;
        if(cod) socket.emit('validar_cupom', cod);
    }
    socket.on('resultado_validacao', d => {
        const box = document.getElementById('resultadoBox');
        box.style.display = 'block';
        document.getElementById('msgRes').innerText = d.msg;
        document.getElementById('msgRes').style.color = d.sucesso ? 'green' : 'red';
        document.getElementById('detalheRes').innerText = d.detalhe || '';
        if(d.sucesso) {
            const audio = new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg'); // Som de sucesso opcional
            audio.play().catch(e=>{});
        }
    });
</script></body></html>`;

const htmlAdmin = `<!DOCTYPE html><html><body style="background:#222;color:white;font-family:Arial;padding:20px;"><h1>Painel Admin</h1><a href="/baixar-relatorio" style="color:#FFD700">📥 Baixar Excel de Vendas</a><div id="lista" style="margin-top:20px"></div><script src="/socket.io/socket.io.js"></script><script>const socket=io();socket.on('dados_admin',d=>{let html="";d.forEach((i,x)=>{html+=\`<div style='border-bottom:1px solid #555;padding:10px;opacity:\${i.ativa?1:0.5}'><b>\${i.loja} (\${i.modo})</b> - Qtd: \${i.qtd}</div>\`});document.getElementById('lista').innerHTML=html;})</script></body></html>`;

module.exports = { htmlTV, htmlMobile, htmlAdmin, htmlCaixa };