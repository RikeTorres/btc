const transactionsDiv = document.getElementById('transactions');
const rankingDiv = document.getElementById('ranking');
const precoDiv = document.getElementById('preco');
let savedTransactions = JSON.parse(localStorage.getItem('savedTransactions')) || []; 
let precoBRL = 0; // Variável global para armazenar o preço do BTC em BRL
const botao = document.getElementById("botao");

botao.addEventListener("click", () => {
    location.reload();
});

// Função para buscar e exibir transações recentes
function transcacoesRecentes() {
    try {
        fetch("https://blockchain.info/unconfirmed-transactions?format=json")
        .then(resposta => resposta.json()) 
        .then(dados => {
            exibirTransacoes(dados.txs);  
            adicionarAoRanking(dados.txs); // Adiciona ao ranking sem atualizar
        })
        .catch(erro => {
            transactionsDiv.innerHTML = `<p>Erro ao carregar transações. Tente novamente mais tarde.</p>`;
        });
    } catch (erro) {
        console.error("Erro inesperado:", erro); 
    }
}

// Função para exibir o preço do BTC
function precoBtc() {
    try {
        fetch("https://blockchain.info/ticker")
        .then(resposta => resposta.json())
        .then(dados => {
            precoBRL = dados.BRL.last; // Armazena o preço em uma variável global
            const precoFormatado = precoBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            precoDiv.innerText = `Preço do BTC em BRL: ${precoFormatado}`;
        })
        .catch(erro =>{
            precoDiv.innerHTML = `<p>Erro ao carregar transações. Tente novamente mais tarde.</p>`;
        })
    } catch (erro) {
        console.error("Erro inesperado:", erro); 
    }
}

// Exibe as transações recentes na div
function exibirTransacoes(transactions) {
    transactionsDiv.innerHTML = ""; 
    transactions.slice(0, 10).forEach(txs => {  // Limita a exibir 10 transações recentes
        const txsElement = document.createElement("div");
        let valorBTC = (txs.out.reduce((total, output) => total + output.value, 0) / 100000000).toFixed(8);
        let valorBRL = (valorBTC * precoBRL).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        txsElement.classList.add("transactions");
        txsElement.innerHTML = `
        <strong>Hash:</strong> ${txs.hash} <br>
        <strong>Valor:</strong> ${valorBTC} BTC (${valorBRL}) <br>
        <strong>Data:</strong> ${new Date(txs.time * 1000).toLocaleString()}`;
        transactionsDiv.appendChild(txsElement); 
    });
}

// Função para adicionar transações ao ranking
function adicionarAoRanking(transactions) {
    const novasTransacoes = transactions.filter(txs => {
        const totalValue = txs.out.reduce((total, output) => total + output.value, 0);
        return totalValue > 1000000000 // 10 BTC
            && !savedTransactions.some(saved => saved.hash === txs.hash);
    });

    savedTransactions = [...savedTransactions, ...novasTransacoes];

    savedTransactions.sort((a, b) => {
        const totalValueA = a.out.reduce((total, output) => total + output.value, 0);
        const totalValueB = b.out.reduce((total, output) => total + output.value, 0);
        return totalValueB - totalValueA; 
    });

    savedTransactions = savedTransactions.slice(0, 10);
    localStorage.setItem('savedTransactions', JSON.stringify(savedTransactions));

    rankingDiv.innerHTML = "<h1>Ranking</h1><h2>Maiores Transações já Registradas</h2>";

    savedTransactions.forEach(txs => {
        const txsElement = document.createElement("div");
        let valorBTC = (txs.out.reduce((total, output) => total + output.value, 0) / 100000000).toFixed(8);
        let valorBRL = (valorBTC * precoBRL).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        txsElement.classList.add("transactions");
        txsElement.innerHTML = `
        <strong>Hash:</strong> ${txs.hash} <br>
        <strong>Valor:</strong> ${valorBTC} BTC (${valorBRL}) <br>
        <strong>Data:</strong> ${new Date(txs.time * 1000).toLocaleString()}`;
        rankingDiv.appendChild(txsElement); 
    });
}

// Função para exibir o ranking na inicialização (caso haja transações no localStorage)
function exibirRankingInicial() {
    if (savedTransactions.length > 0) {
        rankingDiv.innerHTML = "<h1>Ranking</h1><h2>Maiores Transações já Registradas</h2>";
        savedTransactions.forEach(txs => {
            const txsElement = document.createElement("div");
            let valorBTC = (txs.out.reduce((total, output) => total + output.value, 0) / 100000000).toFixed(8);
            let valorBRL = (valorBTC * precoBRL).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            txsElement.classList.add("transactions");
            txsElement.innerHTML = `
            <strong>Hash:</strong> ${txs.hash} <br>
            <strong>Valor:</strong> ${valorBTC} BTC (${valorBRL}) <br>
            <strong>Data:</strong> ${new Date(txs.time * 1000).toLocaleString()}`;
            rankingDiv.appendChild(txsElement); 
        });
    }
}

// Exibe o ranking ao carregar a página, se houver dados salvos
exibirRankingInicial();

// Chama as funções para buscar e exibir transações e preço do BTC na primeira vez
transcacoesRecentes();
precoBtc();
