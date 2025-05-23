// Banco de palavras para o jogo
const wordBank = {
    animais: ["CACHORRO", "GATO", "ELEFANTE", "LEAO", "TIGRE", "GIRAFA", "ZEBRA", "MACACO", "URSO", "COBRA"],
    frutas: ["BANANA", "MACA", "UVA", "LARANJA", "ABACAXI", "MELANCIA", "MORANGO", "PERA", "LIMAO", "MANGA"],
    paises: ["BRASIL", "PORTUGAL", "ARGENTINA", "ALEMANHA", "FRANCA", "ITALIA", "ESPANHA", "JAPAO", "CHINA", "MEXICO"],
    profissoes: ["PROFESSOR", "MEDICO", "ENGENHEIRO", "ADVOGADO", "DENTISTA", "CHEF", "BOMBEIRO", "POLICIAL", "PINTOR", "MUSICO"]
};

// Configurações por dificuldade
const difficultySettings = {
    easy: {
        gridSize: 10,
        wordCount: 5,
        directions: ['horizontal', 'vertical']
    },
    medium: {
        gridSize: 15,
        wordCount: 8,
        directions: ['horizontal', 'vertical', 'diagonal']
    },
    hard: {
        gridSize: 20,
        wordCount: 12,
        directions: ['horizontal', 'vertical', 'diagonal', 'horizontalReverse', 'verticalReverse', 'diagonalReverse']
    }
};

// Variáveis globais
let currentWords = [];
let grid = [];
let foundWords = [];
let selectedCells = [];
let gridSize, possibleDirections;

// Elementos DOM
const gameGrid = document.getElementById('game-grid');
const wordsToFind = document.getElementById('words-to-find');
const newGameBtn = document.getElementById('newGameBtn');
const difficultySelect = document.getElementById('difficultySelect');
const messageEl = document.getElementById('message');

// Variável para rastrear se o usuário está clicando em letras
let isSelectingByClick = false;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    newGameBtn.addEventListener('click', startNewGame);
    difficultySelect.addEventListener('change', startNewGame);
    startNewGame();
});

// Inicia um novo jogo
function startNewGame() {
    // Limpar seleções e mensagens anteriores
    foundWords = [];
    selectedCells = [];
    messageEl.textContent = '';
    
    // Obter configurações baseadas na dificuldade
    const difficulty = difficultySelect.value;
    const settings = difficultySettings[difficulty];
    gridSize = settings.gridSize;
    possibleDirections = settings.directions;
    
    // Selecionar palavras aleatórias
    selectRandomWords(settings.wordCount);
    
    // Criar e preencher o grid
    createGrid();
    placeWordsInGrid();
    fillEmptyCells();
    renderGrid();
    
    // Atualizar a lista de palavras para encontrar
    updateWordList();
    
    // Atualizar contador de palavras encontradas
    updateFoundCounter();
}

// Seleciona palavras aleatórias para o jogo
function selectRandomWords(count) {
    currentWords = [];
    
    // Escolher uma categoria aleatória
    const categories = Object.keys(wordBank);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // Embaralhar palavras da categoria e selecionar as primeiras 'count' palavras
    const shuffledWords = [...wordBank[randomCategory]].sort(() => 0.5 - Math.random());
    
    // Filtrar palavras longas demais para o grid
    const filteredWords = shuffledWords.filter(word => word.length <= gridSize);
    
    // Selecionar palavras
    currentWords = filteredWords.slice(0, count);
}

// Cria a matriz do grid vazia
function createGrid() {
    grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
}

// Posiciona as palavras no grid
function placeWordsInGrid() {
    // Ordenar palavras por tamanho (maior primeiro) para melhor encaixe
    const sortedWords = [...currentWords].sort((a, b) => b.length - a.length);
    
    for (const word of sortedWords) {
        let placed = false;
        let attempts = 0;
        const maxAttempts = 100;
        
        while (!placed && attempts < maxAttempts) {
            attempts++;
            
            // Escolher direção aleatória
            const direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
            
            // Tentar posicionar a palavra
            placed = tryToPlaceWord(word, direction);
        }
        
        // Se não conseguiu posicionar após várias tentativas, ignorar esta palavra
        if (!placed) {
            console.log(`Não foi possível posicionar a palavra: ${word}`);
            const index = currentWords.indexOf(word);
            if (index > -1) {
                currentWords.splice(index, 1);
            }
        }
    }
}

// Tenta posicionar uma palavra no grid
function tryToPlaceWord(word, direction) {
    const wordLength = word.length;
    let startRow, startCol, rowIncrement, colIncrement, maxRow, maxCol;
    
    // Definir limites e incrementos baseados na direção
    switch (direction) {
        case 'horizontal':
            rowIncrement = 0;
            colIncrement = 1;
            maxRow = gridSize;
            maxCol = gridSize - wordLength;
            break;
        case 'horizontalReverse':
            rowIncrement = 0;
            colIncrement = -1;
            maxRow = gridSize;
            maxCol = gridSize - 1;
            word = word.split('').reverse().join(''); // Inverter a palavra
            break;
        case 'vertical':
            rowIncrement = 1;
            colIncrement = 0;
            maxRow = gridSize - wordLength;
            maxCol = gridSize;
            break;
        case 'verticalReverse':
            rowIncrement = -1;
            colIncrement = 0;
            maxRow = gridSize - 1;
            maxCol = gridSize;
            word = word.split('').reverse().join(''); // Inverter a palavra
            break;
        case 'diagonal':
            rowIncrement = 1;
            colIncrement = 1;
            maxRow = gridSize - wordLength;
            maxCol = gridSize - wordLength;
            break;
        case 'diagonalReverse':
            rowIncrement = 1;
            colIncrement = -1;
            maxRow = gridSize - wordLength;
            maxCol = gridSize - 1;
            word = word.split('').reverse().join(''); // Inverter a palavra
            break;
        default:
            return false;
    }
    
    // Escolher posição inicial aleatória
    startRow = Math.floor(Math.random() * maxRow);
    startCol = Math.floor(Math.random() * maxCol);
    
    // Verificar se a palavra cabe na posição
    let fits = true;
    let positions = [];
    
    for (let i = 0; i < wordLength; i++) {
        const row = startRow + i * rowIncrement;
        const col = startCol + i * colIncrement;
        
        // Verificar limites
        if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
            fits = false;
            break;
        }
        
        // Verificar se a célula está vazia ou tem a mesma letra
        if (grid[row][col] !== '' && grid[row][col] !== word[i]) {
            fits = false;
            break;
        }
        
        positions.push({ row, col, letter: word[i] });
    }
    
    // Se a palavra cabe, colocá-la no grid
    if (fits) {
        for (const pos of positions) {
            grid[pos.row][pos.col] = pos.letter;
        }
        return true;
    }
    
    return false;
}

// Preenche células vazias com letras aleatórias
function fillEmptyCells() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (grid[row][col] === '') {
                const randomLetter = letters[Math.floor(Math.random() * letters.length)];
                grid[row][col] = randomLetter;
            }
        }
    }
}

// Renderiza o grid na página
function renderGrid() {
    // Limpar o grid
    gameGrid.innerHTML = '';
    gameGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    
    // Remover container de botões anterior se existir
    const oldButtonContainer = document.querySelector('.button-container');
    if (oldButtonContainer) {
        oldButtonContainer.remove();
    }
    
    // Remover status de jogo se existir
    const oldGameStatus = document.querySelector('.game-status');
    if (oldGameStatus) {
        oldGameStatus.remove();
    }
    
    // Verificar se estamos em um dispositivo móvel
    const isMobile = window.innerWidth <= 768;
    
    // Ajustar o tamanho das células baseado no tamanho da tela
    const cellSize = isMobile ? 35 : 40;
    
    // Se for dispositivo móvel, reorganizar a interface
    if (isMobile) {
        reorganizeMobileInterface();
    }
    
    // Criar células do grid
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.textContent = grid[row][col];
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // Adicionar eventos
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('touchstart', function(e) {
                // Prevenir zoom em dispositivos móveis
                e.preventDefault();
            }, { passive: false });
            
            gameGrid.appendChild(cell);
        }
    }
    
    // Informar o usuário sobre como jogar (especialmente para novos usuários)
    if (!localStorage.getItem('cacaPalavrasInstructionShown')) {
        const instruction = document.createElement('div');
        instruction.className = 'instruction';
        instruction.innerHTML = '<p>Clique nas letras para formar as palavras e depois confirme!</p>';
        instruction.style.textAlign = 'center';
        instruction.style.padding = '10px';
        instruction.style.backgroundColor = '#f9f9f9';
        instruction.style.marginBottom = '15px';
        instruction.style.borderRadius = '5px';
        
        // Inserir instruções antes do grid
        gameGrid.parentNode.insertBefore(instruction, gameGrid);
        
        // Marcar que as instruções foram exibidas
        localStorage.setItem('cacaPalavrasInstructionShown', 'true');
        
        // Remover após 5 segundos
        setTimeout(() => {
            instruction.style.opacity = '0';
            instruction.style.transition = 'opacity 0.5s';
            setTimeout(() => instruction.remove(), 500);
        }, 5000);
    }
    
    // Botão para confirmar a seleção
    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Confirmar';
    confirmButton.id = 'confirmButton';
    confirmButton.addEventListener('click', checkSelectedWord);
    
    // Botão para limpar a seleção
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Limpar';
    clearButton.id = 'clearButton';
    clearButton.addEventListener('click', () => {
        clearSelection();
        messageEl.textContent = '';
    });
    
    // Adicionar botões
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    buttonContainer.appendChild(confirmButton);
    buttonContainer.appendChild(clearButton);
    
    // Adicionar container de botões após o grid
    gameGrid.parentNode.appendChild(buttonContainer);
    
    // Rolagem suave para o início ao iniciar novo jogo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Atualiza a lista de palavras para encontrar
function updateWordList() {
    wordsToFind.innerHTML = '';
    
    for (const word of currentWords) {
        const li = document.createElement('li');
        li.textContent = word;
        li.dataset.word = word;
        
        if (foundWords.includes(word)) {
            li.classList.add('found');
        }
        
        wordsToFind.appendChild(li);
    }
    
    // Atualizar contador de palavras encontradas
    updateFoundCounter();
}

// Atualiza o contador de palavras encontradas
function updateFoundCounter() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Criar ou atualizar o status do jogo
        let gameStatus = document.querySelector('.game-status');
        
        if (!gameStatus) {
            gameStatus = document.createElement('div');
            gameStatus.className = 'game-status';
            document.querySelector('.container').appendChild(gameStatus);
        }
        
        gameStatus.innerHTML = `<span class="found-counter">${foundWords.length}</span>/${currentWords.length}`;
    }
}

// Reorganiza a interface para dispositivos móveis
function reorganizeMobileInterface() {
    const container = document.querySelector('.container');
    const gameContainer = document.querySelector('.game-container');
    const wordList = document.querySelector('.word-list');
    
    // Converter a seção de palavras para um toggle
    if (!document.querySelector('.words-toggle')) {
        // Remover a lista de palavras do seu local atual
        gameContainer.removeChild(wordList);
        
        // Criar a seção de toggle para as palavras
        const wordsToggle = document.createElement('div');
        wordsToggle.className = 'toggle-section words-toggle';
        
        // Criar o cabeçalho do toggle
        const toggleHeader = document.createElement('div');
        toggleHeader.className = 'toggle-header';
        toggleHeader.innerHTML = `
            <h3>Palavras para encontrar (${currentWords.length})</h3>
            <span class="toggle-indicator">▼</span>
        `;
        
        // Criar o conteúdo do toggle
        const toggleContent = document.createElement('div');
        toggleContent.className = 'toggle-content';
        toggleContent.appendChild(wordList);
        
        // Montar a estrutura
        wordsToggle.appendChild(toggleHeader);
        wordsToggle.appendChild(toggleContent);
        
        // Inserir o toggle antes do container do jogo
        container.insertBefore(wordsToggle, gameContainer);
        
        // Adicionar texto explícito de Ver mais/Ver menos
        const toggleText = document.createElement('span');
        toggleText.className = 'toggle-text';
        toggleText.textContent = 'Ver mais';
        toggleHeader.appendChild(toggleText);
        
        // Adicionar evento de toggle
        toggleHeader.addEventListener('click', () => {
            wordsToggle.classList.toggle('expanded');
            // Atualizar texto do botão
            if (wordsToggle.classList.contains('expanded')) {
                toggleText.textContent = 'Ver menos';
            } else {
                toggleText.textContent = 'Ver mais';
            }
        });
    }
    
    // Converter opções do jogo para um toggle se ainda não existir
    if (!document.querySelector('.options-toggle')) {
        const gameOptions = document.querySelector('.game-options');
        
        // Remover opções do seu local atual
        container.removeChild(gameOptions);
        
        // Criar a seção de toggle para as opções
        const optionsToggle = document.createElement('div');
        optionsToggle.className = 'toggle-section options-toggle';
        
        // Criar o cabeçalho do toggle
        const toggleHeader = document.createElement('div');
        toggleHeader.className = 'toggle-header';
        toggleHeader.innerHTML = `
            <h3>Opções do Jogo</h3>
            <span class="toggle-indicator">▼</span>
        `;
        
        // Adicionar texto explícito de Ver mais/Ver menos
        const toggleText = document.createElement('span');
        toggleText.className = 'toggle-text';
        toggleText.textContent = 'Ver mais';
        toggleHeader.appendChild(toggleText);
        
        // Criar o conteúdo do toggle
        const toggleContent = document.createElement('div');
        toggleContent.className = 'toggle-content';
        toggleContent.appendChild(gameOptions);
        
        // Montar a estrutura
        optionsToggle.appendChild(toggleHeader);
        optionsToggle.appendChild(toggleContent);
        
        // Inserir o toggle no início do container
        container.insertBefore(optionsToggle, container.firstChild.nextSibling);
        
        // Adicionar evento de toggle
        toggleHeader.addEventListener('click', () => {
            optionsToggle.classList.toggle('expanded');
            // Atualizar texto do botão
            if (optionsToggle.classList.contains('expanded')) {
                toggleText.textContent = 'Ver menos';
            } else {
                toggleText.textContent = 'Ver mais';
            }
        });
    }
}

// Manipula o clique em uma célula
function handleCellClick(e) {
    const cell = e.target;
    if (!cell.classList.contains('grid-cell')) return;
    
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    // Verificar se a célula já está selecionada
    const alreadySelectedIndex = selectedCells.findIndex(
        c => c.row === row && c.col === col
    );
    
    if (alreadySelectedIndex !== -1) {
        // Se for a última célula adicionada, remova-a
        if (alreadySelectedIndex === selectedCells.length - 1) {
            cell.classList.remove('selected');
            selectedCells.pop();
            updateCurrentWordDisplay();
        }
        return;
    }
    
    // Se não há células selecionadas ou a célula está adjacente à última selecionada
    if (selectedCells.length === 0 || isCellAdjacent(row, col)) {
        // Adicionar a célula à seleção
        cell.classList.add('selected');
        selectedCells.push({
            row: row,
            col: col,
            element: cell
        });
        
        // Atualizar a exibição da palavra atual
        updateCurrentWordDisplay();
    }
}

// Verifica se uma célula é adjacente à última célula selecionada
function isCellAdjacent(row, col) {
    if (selectedCells.length === 0) return true;
    
    const lastCell = selectedCells[selectedCells.length - 1];
    const rowDiff = Math.abs(row - lastCell.row);
    const colDiff = Math.abs(col - lastCell.col);
    
    // Célula adjacente: pode estar na horizontal, vertical ou diagonal
    return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
}

// Atualiza a exibição da palavra atual
function updateCurrentWordDisplay() {
    if (selectedCells.length === 0) {
        messageEl.textContent = '';
        return;
    }
    
    let currentWord = '';
    for (const cell of selectedCells) {
        currentWord += grid[cell.row][cell.col];
    }
    
    messageEl.textContent = `Palavra selecionada: ${currentWord}`;
    messageEl.style.color = '#333';
}

// Verifica a palavra selecionada quando o usuário clica em 'Confirmar Palavra'
function checkSelectedWord() {
    if (selectedCells.length <= 1) {
        messageEl.textContent = 'Selecione pelo menos duas letras para formar uma palavra!';
        messageEl.style.color = '#f44336';
        return;
    }
    
    // Formar a palavra da seleção
    let selectedWord = '';
    for (const cell of selectedCells) {
        selectedWord += grid[cell.row][cell.col];
    }
    
    // Verificar se a palavra está na lista e não foi encontrada ainda
    const wordIndex = currentWords.findIndex(word => 
        (word === selectedWord || word === selectedWord.split('').reverse().join('')) && 
        !foundWords.includes(word)
    );
    
    if (wordIndex !== -1) {
        // Palavra encontrada!
        const foundWord = currentWords[wordIndex];
        foundWords.push(foundWord);
        
        // Destacar as células da palavra encontrada
        selectedCells.forEach(cell => {
            cell.element.classList.remove('selected');
            cell.element.classList.add('highlighted');
        });
        
        // Atualizar a lista de palavras
        const wordElement = document.querySelector(`li[data-word="${foundWord}"]`);
        if (wordElement) {
            wordElement.classList.add('found');
        }
        
        // Verificar se o jogo acabou
        if (foundWords.length === currentWords.length) {
            messageEl.textContent = 'Parabéns! Você encontrou todas as palavras!';
            messageEl.style.fontSize = '24px';
            messageEl.style.color = '#4CAF50';
        } else {
            messageEl.textContent = `Você encontrou: ${foundWord}!`;
            messageEl.style.color = '#4CAF50';
            setTimeout(() => {
                messageEl.textContent = '';
            }, 2000);
        }
        
        // Atualizar contador de palavras encontradas
        updateFoundCounter();
        
        // Reiniciar a seleção
        selectedCells = [];
    } else {
        // Palavra não encontrada na lista
        messageEl.textContent = 'Esta palavra não está na lista para encontrar!';
        messageEl.style.color = '#f44336';
        setTimeout(() => {
            messageEl.textContent = '';
        }, 2000);
        clearSelection();
    }
}

// Função para criar efeitos de celebração quando uma palavra é encontrada
function celebrateFoundWord(foundWord) {
    // Animação nas células destacadas
    selectedCells.forEach(cell => {
        cell.element.style.transition = 'transform 0.3s, background-color 0.3s';
        cell.element.classList.add('highlighted');
        
        // Animação de pulso
        setTimeout(() => {
            cell.element.style.transform = 'scale(1.2)';
            setTimeout(() => {
                cell.element.style.transform = 'scale(1.1)';
            }, 150);
        }, 0);
    });
    
    // Atualizar lista de palavras
    const wordElement = document.querySelector(`li[data-word="${foundWord}"]`);
    if (wordElement) {
        wordElement.classList.add('found');
        wordElement.style.transition = 'all 0.3s';
        wordElement.style.transform = 'scale(1.1)';
        wordElement.style.fontWeight = 'bold';
        setTimeout(() => {
            wordElement.style.transform = 'scale(1)';
        }, 300);
    }
    
    // Tenta criar um feedback sonoro simples
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 523.25; // Dó (C5)
        gainNode.gain.value = 0.1;
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        
        setTimeout(() => {
            oscillator.frequency.value = 659.25; // Mi (E5)
        }, 100);
        
        setTimeout(() => {
            oscillator.frequency.value = 783.99; // Sol (G5)
        }, 200);
        
        setTimeout(() => {
            oscillator.stop();
        }, 300);
    } catch (e) {
        console.log('Feedback sonoro não suportado');
    }
}

// Limpa a seleção atual
function clearSelection(keepFirst = false) {
    const cellsToRemove = keepFirst ? selectedCells.slice(1) : selectedCells;
    
    for (const cell of cellsToRemove) {
        if (cell.element && !cell.element.classList.contains('highlighted')) {
            cell.element.classList.remove('selected');
        }
    }
    
    if (!keepFirst) {
        selectedCells = [];
    }
}

// Função para lidar com eventos de toque inicial
function handleTouchStart(e) {
    // Prevenir comportamento padrão
    e.preventDefault();
    
    // Simular evento mousedown
    startSelection({
        target: e.target,
        type: 'touchstart',
        preventDefault: () => {}
    });
}

// Função para lidar com eventos de toque em movimento
function handleTouchMove(e) {
    e.preventDefault(); // Impedir rolagem da página
    
    if (!gameGrid.classList.contains('selecting')) return;
    
    // Obter posição do toque
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element && element.classList.contains('grid-cell')) {
        // Simular evento mouseover
        continueSelection({
            target: element,
            buttons: 1,
            type: 'touchmove'
        });
    }
}
