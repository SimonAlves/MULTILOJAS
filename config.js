// ==================================================================================
// ARQUIVO: config.js
// ÁREA DE EDIÇÃO DO FUNCIONÁRIO - APENAS SORTEIOS ATIVOS (INTROS BLOQUEADAS)
// ==================================================================================

const listaLojas = [
    // --- LOJA 1: OTICA MAX ---
    /* BLOQUEADO (Intro)
    { id: 99, loja: 'OticaMax', arquivo: "otica.jpg", modo: 'intro', cor: '#0055aa', ativa: true },
    */
    { id: 0, loja: 'OticaMax', arquivo: "otica50.jpg", modo: 'sorte', cor: '#FFD700', qtd: 20, prefixo: 'MAX', ehSorteio: true },


    // --- LOJA 2: HORTIFRUTI ---
    /* BLOQUEADO (Intro)
    { id: 99, loja: 'Hortifruti', arquivo: "hortfrut.jpg", modo: 'intro', cor: '#2E7D32', ativa: true },
    */
    { id: 1, loja: 'Hortifruti', arquivo: "hortfrut50.jpg", modo: 'sorte', cor: '#2E7D32', qtd: 30, prefixo: 'HORT', ehSorteio: true },


    // --- LOJA 3: MAGALU ---
    /* BLOQUEADO (Intro)
    { id: 99, loja: 'Magalu', arquivo: "magazineluiza.jpg", modo: 'intro', cor: '#0086FF', ativa: true },
    */
    { id: 2, loja: 'Magalu', arquivo: "magazineluiza50.jpg", modo: 'sorte', cor: '#0086FF', qtd: 15, prefixo: 'MGL', ehSorteio: true },


    // --- LOJA 4: CONSTRUCAO ---
    /* BLOQUEADO (Intro)
    { id: 99, loja: 'Construcao', arquivo: "construcao10.jpg", modo: 'intro', cor: '#E65100', ativa: true },
    */
    { id: 3, loja: 'Construcao', arquivo: "construcao.jpg", modo: 'sorte', cor: '#E65100', qtd: 10, prefixo: 'OBRA', ehSorteio: true },


    // --- LOJA 5: CALCADOS ---
    /* BLOQUEADO (Intro)
    { id: 99, loja: 'Calcados', arquivo: "calcados10.jpg", modo: 'intro', cor: '#D50000', ativa: true },
    */
    { id: 4, loja: 'Calcados', arquivo: "calcados.jpg", modo: 'sorte', cor: '#D50000', qtd: 40, prefixo: 'PE', ehSorteio: true },


    // --- LOJA 6: FLORICULTURA ---
    /* BLOQUEADO (Intro)
    { id: 99, loja: 'Floricultura', arquivo: "floricultura10.jpg", modo: 'intro', cor: '#C2185B', ativa: true },
    */
    { id: 5, loja: 'Floricultura', arquivo: "floricultura-sorte.jpg", modo: 'sorte', cor: '#C2185B', qtd: 15, prefixo: 'FLOR', ehSorteio: true },


    // --- LOJA 7: CDL MOGI ---
    /* BLOQUEADO (Intro)
    { id: 99, loja: 'CDL', arquivo: "cdl.jpg", modo: 'intro', cor: '#0054a6', ativa: true },
    */
    { id: 6, loja: 'CDL', arquivo: "cdl50.jpg", modo: 'sorte', cor: '#0054a6', qtd: 50, prefixo: 'CDL', ehSorteio: true },


    // --- LOJA 8: SINCOMERCIO (ADICIONADO) ---
    /* BLOQUEADO (Intro)
    { id: 99, loja: 'Sincomercio', arquivo: "sincomercio_intro.jpg", modo: 'intro', cor: '#003366', ativa: true },
    */
    { id: 7, loja: 'Sincomercio', arquivo: "sincomercio.jpg", modo: 'sorte', cor: '#003366', qtd: 50, prefixo: 'MED', ehSorteio: true }
];

module.exports = listaLojas;
