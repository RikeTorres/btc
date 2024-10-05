const transactionsDiv = document.getElementById('transactions');
const rankingDiv = document.getElementById('ranking');
let savedTransactions = JSON.parse(localStorage.getItem('savedTransactions')) || []; 
const botao = document.querySelector("button");

botao.addEventListener("click", ()=>{
    location.reload();
})

// Função para buscar e exibir transações recentes
function transcacoesRecentes() {
    try {
        fetch("https://blockchain.info/unconfirmed-transactions?format=json")
        .then(resposta => resposta.json()) 
        .then(dados => {
            console.log(dados);
            exibirTransacoes(dados.txs);  
            adicionarAoRanking(dados.txs); // Função para adicionar ao ranking sem atualizar
        })
        .catch(erro => {
            console.error("Erro ao buscar transações:", erro);
            transactionsDiv.innerHTML = `<p>Erro ao carregar transações. Tente novamente mais tarde.</p>`;
        });
    } catch (erro) {
        console.error("Erro inesperado:", erro); 
    }
}

// Exibe as transações recentes na div
function exibirTransacoes(transactions) {
    transactionsDiv.innerHTML = ""; 
    transactions.slice(0, 10).forEach(txs => {  // Limita a exibir 10 transações recentes
        const txsElement = document.createElement("div");
        txsElement.classList.add("transactions");
        txsElement.innerHTML = `
        <strong>Hash:</strong> ${txs.hash} <br>
        <strong>Valor:</strong> ${(txs.out.reduce((total, output) => total + output.value, 0) / 100000000).toFixed(8)} BTC <br>
        <strong>Data:</strong> ${new Date(txs.time * 1000).toLocaleString()}`;
        transactionsDiv.appendChild(txsElement); 
    });
}

// Função para adicionar transações ao ranking
function adicionarAoRanking(transactions) {
    // Filtra as transações maiores que 10 BTC e evita duplicatas no ranking
    const novasTransacoes = transactions.filter(txs => {
        const totalValue = txs.out.reduce((total, output) => total + output.value, 0);
        return totalValue > 1000000000 // 10 BTC
            && !savedTransactions.some(saved => saved.hash === txs.hash);
    });

    // Adiciona novas transações ao array salvo de transações
    savedTransactions = [...savedTransactions, ...novasTransacoes];

    // Ordena as transações do ranking do maior para o menor valor
    savedTransactions.sort((a, b) => {
        const totalValueA = a.out.reduce((total, output) => total + output.value, 0);
        const totalValueB = b.out.reduce((total, output) => total + output.value, 0);
        return totalValueB - totalValueA; // Ordena de maior para menor
    });

    // Mantém apenas as 10 maiores transações
    savedTransactions = savedTransactions.slice(0, 10);

    // Salva as transações no localStorage
    localStorage.setItem('savedTransactions', JSON.stringify(savedTransactions));

    // Limpa a div de ranking antes de exibir as transações ordenadas
    rankingDiv.innerHTML = "<h1>Ranking</h1><h2>Maiores Transações já Registradas</h2>";

    // Exibe as transações salvas no ranking
    savedTransactions.forEach(txs => {
        const txsElement = document.createElement("div");
        txsElement.classList.add("transactions");
        txsElement.innerHTML = `
        <strong>Hash:</strong> ${txs.hash} <br>
        <strong>Valor:</strong> ${(txs.out.reduce((total, output) => total + output.value, 0) / 100000000).toFixed(8)} BTC <br>
        <strong>Data:</strong> ${new Date(txs.time * 1000).toLocaleString()}`;
        rankingDiv.appendChild(txsElement); 
    });
}

// Função para exibir o ranking na inicialização (caso haja transações no localStorage)
function exibirRankingInicial() {
    if (savedTransactions.length > 0) {
        // Ordena as transações do ranking do maior para o menor valor
        savedTransactions.sort((a, b) => {
            const totalValueA = a.out.reduce((total, output) => total + output.value, 0);
            const totalValueB = b.out.reduce((total, output) => total + output.value, 0);
            return totalValueB - totalValueA; // Ordena de maior para menor
        });

        // Exibe as transações salvas no ranking
        rankingDiv.innerHTML = "<h1>Ranking</h1><h2>Maiores Transações já Registradas</h2>";
        savedTransactions.forEach(txs => {
            const txsElement = document.createElement("div");
            txsElement.classList.add("transactions");
            txsElement.innerHTML = `
            <strong>Hash:</strong> ${txs.hash} <br>
            <strong>Valor:</strong> ${(txs.out.reduce((total, output) => total + output.value, 0) / 100000000).toFixed(8)} BTC <br>
            <strong>Data:</strong> ${new Date(txs.time * 1000).toLocaleString()}`;
            rankingDiv.appendChild(txsElement); 
        });
    }
}

// Exibe o ranking ao carregar a página, se houver dados salvos
exibirRankingInicial();

// Atualiza transações a cada 60 segundos
// setInterval(transcacoesRecentes, 60000);

// Chama a função para buscar e exibir transações na primeira vez
transcacoesRecentes();
