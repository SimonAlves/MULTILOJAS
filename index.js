const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const QRCode = require('qrcode');

// IMPORTA AS LOJAS
const campanhas = require('./config'); 

// IMPORTA OS HTMLs (Agora inclui o Painel do Caixa)
const { htmlTV, htmlMobile, htmlAdmin, htmlCaixa } = require('./templates'); 

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname));
app.use(express.static('public')); 

// BANCO DE DADOS EM MEMÓRIA
let historicoVendas = []; 
let slideAtual = 0;

// Inicializa contadores
campanhas.forEach(c => {
    if(!c.totalResgates) c.totalResgates = 0;
});

// Timer de Rotação (15s)
setInterval(() => {
    slideAtual++;
    if (slideAtual >= campanhas.length) slideAtual = 0;
    io.emit('trocar_slide', campanhas[slideAtual]);
}, 15000);

// Gerador de Código Único (Ex: MAX-8X92)
function gerarCodigo(prefixo) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return `${prefixo}-${result}`;
}

// --- ROTAS DO SISTEMA ---
app.get('/tv', (req, res) => res.send(htmlTV));
app.get('/mobile', (req, res) => res.send(htmlMobile));
app.get('/admin', (req, res) => res.send(htmlAdmin));
app.get('/caixa', (req, res) => res.send(htmlCaixa)); // NOVA TELA!

app.get('/', (req, res) => res.redirect('/tv'));

// Rota para o QR Code Dinâmico
app.get('/qrcode', (req, res) => { 
    const url = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}/mobile`; 
    QRCode.toDataURL(url, (e, s) => res.send(s)); 
});

// Relatório Excel (CSV)
app.get('/baixar-relatorio', (req, res) => {
    let csv = "\uFEFFDATA,HORA,LOJA,CODIGO,PREMIO,STATUS\n";
    historicoVendas.forEach(h => {
        csv += `${h.data},${h.hora},${h.loja},${h.codigo},${h.premio},${h.status}\n`;
    });
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment('relatorio_vendas.csv');
    res.send(csv);
});

// --- LÓGICA EM TEMPO REAL ---
io.on('connection', (socket) => {
    // Envia estado inicial
    socket.emit('trocar_slide', campanhas[slideAtual]);
    socket.emit('dados_admin', campanhas);

    // 1. CLIENTE ESCANEOU E PEDIU CUPOM
    socket.on('resgatar_oferta', (id) => {
        let camp = campanhas[id];
        
        if (camp && camp.qtd > 0) {
            // Lógica do Sorteio Difícil (5% vs 95%)
            const sorte = Math.random() * 100; // Gera numero de 0 a 100
            let premio = "10% OFF"; // Padrão (95% das vezes)
            let isGold = false;

            // Se cair nos 5% sortudos (acima de 95)
            if (sorte > 95) {
                premio = "50% OFF";
                isGold = true;
            }

            // Consome estoque e registra
            camp.qtd--;
            camp.totalResgates++;
            
            const agora = new Date();
            const cod = gerarCodigo(camp.prefixo || 'LOJA');
            
            // Salva no histórico
            const registro = {
                data: agora.toLocaleDateString('pt-BR'),
                hora: agora.toLocaleTimeString('pt-BR'),
                loja: camp.loja,
                codigo: cod,
                premio: premio,
                status: 'Emitido' // Status inicial
            };
            historicoVendas.push(registro);

            // Atualiza telas
            io.emit('atualizar_qtd', camp); // Atualiza contador da TV
            socket.emit('sucesso', { codigo: cod, produto: premio, isGold: isGold, loja: camp.loja }); // Responde pro celular
            io.emit('dados_admin', campanhas); // Atualiza admin
        }
    });

    // 2. CAIXA VALIDA O CUPOM
    socket.on('validar_cupom', (codigoParaValidar) => {
        const cupom = historicoVendas.find(h => h.codigo === codigoParaValidar.toUpperCase());
        
        if (!cupom) {
            socket.emit('resultado_validacao', { sucesso: false, msg: "Código Inexistente!" });
        } else if (cupom.status === 'Usado') {
            socket.emit('resultado_validacao', { sucesso: false, msg: "Cupom JÁ UTILIZADO em " + cupom.hora });
        } else {
            // Marca como usado
            cupom.status = 'Usado';
            socket.emit('resultado_validacao', { 
                sucesso: true, 
                msg: "✅ VÁLIDO!", 
                detalhe: `${cupom.premio} em ${cupom.loja}` 
            });
        }
    });

    // 3. ADMIN ATUALIZA ESTOQUE
    socket.on('admin_update', (d) => { 
        campanhas[d.id].qtd = parseInt(d.qtd); 
        io.emit('dados_admin', campanhas); 
        if(slideAtual === d.id) io.emit('trocar_slide', campanhas[d.id]); 
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Sistema GOLD rodando na porta ${PORT}`));
