const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const QRCode = require('qrcode');

const campanhas = require('./config'); 
const { htmlTV, htmlMobile, htmlAdmin } = require('./templates'); 

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname));
app.use(express.static('public')); 

let historicoVendas = []; 
let slideAtual = 0;

// Inicializa dados
campanhas.forEach(c => {
    if(!c.resgatesPorHora) c.resgatesPorHora = new Array(24).fill(0);
    if(!c.totalResgates) c.totalResgates = 0;
});

// Timer 15 seg
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