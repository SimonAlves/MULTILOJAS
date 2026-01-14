// ==================================================================================
// ARQUIVO: config.js
// ÁREA DE EDIÇÃO DO FUNCIONÁRIO - LOJAS E PRÊMIOS
// ==================================================================================

const listaLojas = [
    // --- LOJA 1: OTICA MAX ---
    { id: 0, loja: 'OticaMax', arquivo: "otica.jpg", modo: 'intro', cor: '#0055aa', ativa: true },
    { id: 1, loja: 'OticaMax', arquivo: "otica50.jpg", modo: 'sorte', cor: '#FFD700', qtd: 20, prefixo: 'MAX', ehSorteio: true },

    // --- LOJA 2: HORTIFRUTI ---
    { id: 2, loja: 'Hortifruti', arquivo: "hortfrut.jpg", modo: 'intro', cor: '#2E7D32', ativa: true },
    { id: 3, loja: 'Hortifruti', arquivo: "hortfrut50.jpg", modo: 'sorte', cor: '#2E7D32', qtd: 30, prefixo: 'HORT', ehSorteio: true },

    // --- LOJA 3: MAGALU ---
    { id: 4, loja: 'Magalu', arquivo: "magazineluiza.jpg", modo: 'intro', cor: '#0086FF', ativa: true },
    { id: 5, loja: 'Magalu', arquivo: "magazineluiza50.jpg", modo: 'sorte', cor: '#0086FF', qtd: 15, prefixo: 'MGL', ehSorteio: true },

    // --- LOJA 4: CONSTRUCAO ---
    { id: 6, loja: 'Construcao', arquivo: "construcao10.jpg", modo: 'intro', cor: '#E65100', ativa: true },
    { id: 7, loja: 'Construcao', arquivo: "construcao.jpg", modo: 'sorte', cor: '#E65100', qtd: 10, prefixo: 'OBRA', ehSorteio: true },

    // --- LOJA 5: CALCADOS ---
    { id: 8, loja: 'Calcados', arquivo: "calcados10.jpg", modo: 'intro', cor: '#D50000', ativa: true },
    { id: 9, loja: 'Calcados', arquivo: "calcados.jpg", modo: 'sorte', cor: '#D50000', qtd: 40, prefixo: 'PE', ehSorteio: true },

    // --- LOJA 6: FLORICULTURA ---
    { id: 10, loja: 'Floricultura', arquivo: "floricultura10.jpg", modo: 'intro', cor: '#C2185B', ativa: true },
    { id: 11, loja: 'Floricultura', arquivo: "floricultura-sorte.jpg", modo: 'sorte', cor: '#C2185B', qtd: 15, prefixo: 'FLOR', ehSorteio: true },

    // --- LOJA 7: CDL MOGI ---
    { id: 12, loja: 'CDL', arquivo: "cdl.jpg", modo: 'intro', cor: '#0054a6', ativa: true },
    { id: 13, loja: 'CDL', arquivo: "cdl50.jpg", modo: 'sorte', cor: '#0054a6', qtd: 50, prefixo: 'CDL', ehSorteio: true }
];

module.exports = listaLojas;
