// --- CONFIGURAÇÃO DAS LOJAS E IMAGENS ---
// Ajustado para os nomes exatos das imagens na sua pasta public.

module.exports = [
    // === 1. ÓTICA MAX ===
    { 
        id: 0, loja: 'OticaMax', 
        arquivo: "image_8f8f81.jpg", // Intro (Usando a de 10% provisoriamente)
        modo: 'intro', cor: '#0055aa', ativa: true 
    },
    { 
        id: 1, loja: 'OticaMax', 
        arquivo: "image_8f8f81.jpg", // Sorte (Se tiver a de 50% depois, troque aqui)
        modo: 'sorte', cor: '#FFD700', qtd: 20, prefixo: 'MAX-SRT', ehSorteio: true 
    },
    { 
        id: 2, loja: 'OticaMax', 
        arquivo: "image_8f8f81.jpg", // Desconto 10%
        modo: 'desconto', cor: '#d60000', qtd: 50, prefixo: 'MAX-10', ehSorteio: false 
    },

    // === 2. HORTIFRUTI ===
    { 
        id: 3, loja: 'Hortifruti', 
        arquivo: "hortfrut.jpg", // Intro
        modo: 'intro', cor: '#2E7D32', ativa: true 
    },
    { 
        id: 4, loja: 'Hortifruti', 
        arquivo: "hortfrut50.jpg", // Sorte (Imagem de 50%)
        modo: 'sorte', cor: '#2E7D32', qtd: 30, prefixo: 'HORT-SRT', ehSorteio: true 
    },
    { 
        id: 5, loja: 'Hortifruti', 
        arquivo: "hortfrut.jpg", // Desconto 10%
        modo: 'desconto', cor: '#2E7D32', qtd: 100, prefixo: 'HORT-10', ehSorteio: false 
    },
    
    // === 3. MAGAZINE LUIZA ===
    { 
        id: 6, loja: 'Magalu', 
        arquivo: "magazineluiza.jpg", // Intro
        modo: 'intro', cor: '#0086FF', ativa: true 
    },
    { 
        id: 7, loja: 'Magalu', 
        arquivo: "magazineluiza50.jpg", // Sorte (Imagem de 50%)
        modo: 'sorte', cor: '#0086FF', qtd: 15, prefixo: 'MGL-SRT', ehSorteio: true 
    },
    { 
        id: 8, loja: 'Magalu', 
        arquivo: "magazineluiza.jpg", // Desconto 10%
        modo: 'desconto', cor: '#0086FF', qtd: 80, prefixo: 'MGL-10', ehSorteio: false 
    },

    // === 4. MATERIAL DE CONSTRUÇÃO ===
    { 
        id: 9, loja: 'Construcao', 
        arquivo: "construcao10.jpg", // Intro
        modo: 'intro', cor: '#E65100', ativa: true 
    },
    { 
        id: 10, loja: 'Construcao', 
        arquivo: "construcao.jpg", // Sorte (Imagem de 50%)
        modo: 'sorte', cor: '#E65100', qtd: 10, prefixo: 'OBRA-SRT', ehSorteio: true 
    },
    { 
        id: 11, loja: 'Construcao', 
        arquivo: "construcao10.jpg", // Desconto 10%
        modo: 'desconto', cor: '#E65100', qtd: 60, prefixo: 'OBRA-10', ehSorteio: false 
    },

    // === 5. CALÇADOS ===
    { 
        id: 12, loja: 'Calcados', 
        arquivo: "calcados10.jpg", // Intro
        modo: 'intro', cor: '#D50000', ativa: true 
    },
    { 
        id: 13, loja: 'Calcados', 
        arquivo: "calcados.jpg", // Sorte (Imagem de 50%)
        modo: 'sorte', cor: '#D50000', qtd: 40, prefixo: 'PE-SRT', ehSorteio: true 
    },
    { 
        id: 14, loja: 'Calcados', 
        arquivo: "calcados10.jpg", // Desconto 10%
        modo: 'desconto', cor: '#D50000', qtd: 50, prefixo: 'PE-10', ehSorteio: false 
    },

    // === 6. FLORICULTURA ===
    { 
        id: 15, loja: 'Floricultura', 
        arquivo: "floricultura10.jpg", // Intro
        modo: 'intro', cor: '#C2185B', ativa: true 
    },
    { 
        id: 16, loja: 'Floricultura', 
        arquivo: "floricultura-sorte.jpg", // Sorte (Imagem de 50%)
        modo: 'sorte', cor: '#C2185B', qtd: 15, prefixo: 'FLOR-SRT', ehSorteio: true 
    },
    { 
        id: 17, loja: 'Floricultura', 
        arquivo: "floricultura10.jpg", // Desconto 10%
        modo: 'desconto', cor: '#C2185B', qtd: 30, prefixo: 'FLOR-10', ehSorteio: false 
    }
];