const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// --- CONFIGURAÇÃO DA PASTA PÚBLICA ---
// O servidor vai procurar seus arquivos (tv.html, controle.html, vitoria.mp3) aqui
app.use(express.static(path.join(__dirname, 'public')));

// --- LÓGICA DO SOCKET (A comunicação) ---
io.on('connection', (socket) => {
    console.log('🔌 Novo dispositivo conectado: ' + socket.id);

    // 1. Recebe o aviso do Celular
    socket.on('comando_sorteio', () => {
        console.log('📲 O Celular acionou o sorteio!');

        // 2. Avisa APENAS os outros dispositivos (A TV)
        // Usamos 'broadcast' para o sinal ir para a TV, mas não voltar para o celular
        // (porque o celular já tocou o som sozinho)
        socket.broadcast.emit('tocar_na_tv');
    });

    socket.on('disconnect', () => {
        console.log('❌ Dispositivo desconectou: ' + socket.id);
    });
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
// Usa a porta configurada no ambiente ou a 3000 por padrão
const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
    console.log('---------------------------------------------------');
    console.log(`🚀 SERVIDOR RODANDO NA PORTA ${PORT}`);
    console.log(`📺 Link para a TV:      http://localhost:${PORT}/tv.html`);
    console.log(`📱 Link para o Celular: http://localhost:${PORT}/controle.html`);
    console.log('---------------------------------------------------');
});
