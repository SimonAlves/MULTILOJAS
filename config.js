// --- CONFIGURAÇÃO DAS LOJAS E IMAGENS ---
// Configurado exatamente conforme seu print do GitHub

module.exports = [
    // === 1. ÓTICA MAX ===
    { 
        id: 0, loja: 'OticaMax', 
        arquivo: "otica.jpg", // Usando a de 10% como Intro
        modo: 'intro', cor: '#0055aa', ativa: true 
    },
    { 
        id: 1, loja: 'OticaMax', 
        arquivo: "otica50.jpg", // A imagem do Sorteio 50%
        modo: 'sorte', cor: '#FFD700', qtd: 20, prefixo: 'MAX-SRT', ehSorteio: true 
    },
    { 
        id: 2, loja: 'OticaMax', 
        arquivo: "otica.jpg", // A imagem do 10%
        modo: 'desconto', cor: '#d60000', qtd: 50, prefixo: 'MAX-10', ehSorteio: false 
    },

    // === 2. HORTIFRUTI ===
    { 
        id: 3, loja: 'Hortifruti', 
        arquivo: "hortfrut.jpg", 
        modo: 'intro', cor: '#2E7D32', ativa: true 
    },
    { 
        id: 4, loja: 'Hortifruti', 
        arquivo: "hortfrut50.jpg", 
        modo: 'sorte', cor: '#2E7D32', qtd: 30, prefixo: 'HORT-SRT', ehSorteio: true 
    },
    { 
        id: 5, loja: 'Hortifruti', 
        arquivo: "hortfrut.jpg", 
        modo: 'desconto', cor: '#2E7D32', qtd: 100, prefixo: 'HORT-10', ehSorteio: false 
    },
    
    // === 3. MAGAZINE LUIZA ===
    { 
        id: 6, loja: 'Magalu', 
        arquivo: "magazineluiza.jpg", 
        modo: 'intro', cor: '#0086FF', ativa: true 
    },
    { 
        id: 7, loja: 'Magalu', 
        arquivo: "magazineluiza50.jpg", 
        modo: 'sorte', cor: '#0086FF', qtd: 15, prefixo: 'MGL-SRT', ehSorteio: true 
    },
    { 
        id: 8, loja: 'Magalu', 
        arquivo: "magazineluiza.jpg", 
        modo: 'desconto', cor: '#0086FF', qtd: 80, prefixo: 'MGL-10', ehSorteio: false 
    },

    // === 4. MATERIAL DE CONSTRUÇÃO ===
    { 
        id: 9, loja: 'Construcao', 
        arquivo: "construcao10.jpg", 
        modo: 'intro', cor: '#E65100', ativa: true 
    },
    { 
        id: 10, loja: 'Construcao', 
        arquivo: "construcao.jpg", // Pelo seu print, essa é a de 50%
        modo: 'sorte', cor: '#E65100', qtd: 10, prefixo: 'OBRA-SRT', ehSorteio: true 
    },
    { 
        id: 11, loja: 'Construcao', 
        arquivo: "construcao10.jpg", // E essa é a de 10%
        modo: 'desconto', cor: '#E65100', qtd: 60, prefixo: 'OBRA-10', ehSorteio: false 
    },

    // === 5. CALÇADOS ===
    { 
        id: 12, loja: 'Calcados', 
        arquivo: "calcados10.jpg", 
        modo: 'intro', cor: '#D50000', ativa: true 
    },
    { 
        id: 13, loja: 'Calcados', 
        arquivo: "calcados.jpg", // Pelo seu print, essa é a de 50%
        modo: 'sorte', cor: '#D50000', qtd: 40, prefixo: 'PE-SRT', ehSorteio: true 
    },
    { 
        id: 14, loja: 'Calcados', 
        arquivo: "calcados10.jpg", 
        modo: 'desconto', cor: '#D50000', qtd: 50, prefixo: 'PE-10', ehSorteio: false 
    },

    // === 6. FLORICULTURA ===
    { 
        id: 15, loja: 'Floricultura', 
        arquivo: "floricultura10.jpg", 
        modo: 'intro', cor: '#C2185B', ativa: true 
    },
    { 
        id: 16, loja: 'Floricultura', 
        arquivo: "floricultura-sorte.jpg", 
        modo: 'sorte', cor: '#C2185B', qtd: 15, prefixo: 'FLOR-SRT', ehSorteio: true 
    },
    { 
        id: 17, loja: 'Floricultura', 
        arquivo: "floricultura10.jpg", 
        modo: 'desconto', cor: '#C2185B', qtd: 30, prefixo: 'FLOR-10', ehSorteio: false 
    }
];
