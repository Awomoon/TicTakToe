
        document.addEventListener('DOMContentLoaded', () => {
            // DOM Elements
            const gameBoard = document.getElementById('gameBoard');
            const cells = document.querySelectorAll('.cell');
            const gameStatus = document.getElementById('gameStatus');
            const resetBtn = document.getElementById('resetBtn');
            const playerModeRadios = document.querySelectorAll('input[name="player-mode"]');
            const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
            const difficultyGroup = document.getElementById('difficultyGroup');
            const offlineBadge = document.querySelector('.offline-badge');
            const body = document.body;
            
            // Game State
            let board = ['', '', '', '', '', '', '', '', ''];
            let currentPlayer = 'X';
            let gameActive = true;
            let gameMode = 'pvp';
            let difficulty = 'easy';
            let isOnline = true;
            
            // Initialize Game
            init();
            
            function init() {
                // Event Listeners
                cells.forEach(cell => {
                    cell.addEventListener('click', handleCellClick);
                });
                
                resetBtn.addEventListener('click', resetGame);
                
                playerModeRadios.forEach(radio => {
                    radio.addEventListener('change', () => {
                        gameMode = radio.value;
                        updateDifficultyVisibility();
                        resetGame();
                    });
                });
                
                difficultyRadios.forEach(radio => {
                    radio.addEventListener('change', () => {
                        difficulty = radio.value;
                        resetGame();
                    });
                });
                
                // Check online status
                updateOnlineStatus();
                window.addEventListener('online', updateOnlineStatus);
                window.addEventListener('offline', updateOnlineStatus);
                
                updateDifficultyVisibility();
                updateGameStatus();
            }
            
            function updateOnlineStatus() {
                isOnline = navigator.onLine;
                if (isOnline) {
                    body.classList.remove('offline');
                    offlineBadge.style.display = 'none';
                } else {
                    body.classList.add('offline');
                    offlineBadge.style.display = 'block';
                    // Show offline status in game status
                    gameStatus.textContent = 'Playing offline';
                    gameStatus.className = 'game-status visible';
                    setTimeout(() => {
                        if (gameActive) {
                            updateGameStatus();
                        }
                    }, 2000);
                }
            }
            
            function handleCellClick(e) {
                if (!gameActive) return;
                
                const cell = e.target;
                const index = parseInt(cell.getAttribute('data-index'));
                
                // If cell is occupied, ignore
                if (board[index] !== '') return;
                
                // Make player move
                makeMove(index, currentPlayer);
                
                // Check for game result
                const result = checkGameResult();
                if (result) {
                    endGame(result);
                    return;
                }
                
                // Switch turns or make computer move
                if (gameMode === 'pvp') {
                    switchPlayer();
                    updateGameStatus();
                } else {
                    currentPlayer = 'O';
                    setTimeout(() => {
                        makeComputerMove();
                    }, 600);
                }
            }
            
            function makeMove(index, player) {
                board[index] = player;
                const cell = cells[index];
                
                // Animation for placing the mark
                cell.style.transform = 'scale(0)';
                cell.style.opacity = '0';
                
                setTimeout(() => {
                    cell.textContent = player;
                    cell.classList.add(player.toLowerCase());
                    cell.style.transform = 'scale(1)';
                    cell.style.opacity = '1';
                    cell.classList.add('disabled');
                }, 150);
            }
            
            function makeComputerMove() {
                if (!gameActive) return;
                
                let moveIndex;
                
                switch (difficulty) {
                    case 'easy':
                        moveIndex = getRandomMove();
                        break;
                    case 'medium':
                        moveIndex = getMediumMove();
                        break;
                    case 'hard':
                        moveIndex = getBestMove();
                        break;
                }
                
                if (moveIndex !== undefined) {
                    makeMove(moveIndex, 'O');
                    
                    // Check for game result
                    const result = checkGameResult();
                    if (result) {
                        endGame(result);
                    } else {
                        currentPlayer = 'X';
                        updateGameStatus();
                    }
                }
            }
            
            function getRandomMove() {
                const emptyCells = board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
                if (emptyCells.length === 0) return;
                return emptyCells[Math.floor(Math.random() * emptyCells.length)];
            }
            
            function getMediumMove() {
                // Try to win if possible
                for (let i = 0; i < 9; i++) {
                    if (board[i] === '') {
                        board[i] = 'O';
                        if (checkWin('O')) {
                            board[i] = '';
                            return i;
                        }
                        board[i] = '';
                    }
                }
                
                // Block player from winning
                for (let i = 0; i < 9; i++) {
                    if (board[i] === '') {
                        board[i] = 'X';
                        if (checkWin('X')) {
                            board[i] = '';
                            return i;
                        }
                        board[i] = '';
                    }
                }
                
                // Take center if available
                if (board[4] === '') return 4;
                
                // Take a corner if available
                const corners = [0, 2, 6, 8];
                const emptyCorners = corners.filter(i => board[i] === '');
                if (emptyCorners.length > 0) {
                    return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
                }
                
                // Take any available edge
                return getRandomMove();
            }
            
            function getBestMove() {
                // Check if computer can win immediately
                for (let i = 0; i < 9; i++) {
                    if (board[i] === '') {
                        board[i] = 'O';
                        if (checkWin('O')) {
                            board[i] = '';
                            return i;
                        }
                        board[i] = '';
                    }
                }
                
                // Check if player can win next move and block
                for (let i = 0; i < 9; i++) {
                    if (board[i] === '') {
                        board[i] = 'X';
                        if (checkWin('X')) {
                            board[i] = '';
                            return i;
                        }
                        board[i] = '';
                    }
                }
                
                // Try to take center
                if (board[4] === '') return 4;
                
                // Try to take a corner
                const corners = [0, 2, 6, 8];
                const emptyCorners = corners.filter(i => board[i] === '');
                if (emptyCorners.length > 0) {
                    return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
                }
                
                // Take any available edge
                return getRandomMove();
            }
            
            function checkWin(player) {
                const winPatterns = [
                    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
                    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
                    [0, 4, 8], [2, 4, 6]             // diagonals
                ];
                
                return winPatterns.some(pattern => {
                    const [a, b, c] = pattern;
                    return board[a] === player && board[b] === player && board[c] === player;
                });
            }
            
            function checkGameResult() {
                if (checkWin(currentPlayer)) {
                    return currentPlayer === 'X' ? 'playerWin' : 'computerWin';
                }
                
                if (!board.includes('')) {
                    return 'tie';
                }
                
                return null;
            }
            
            function endGame(result) {
                gameActive = false;
                
                // Highlight winning cells if applicable
                if (result !== 'tie') {
                    const winner = result === 'playerWin' ? 'X' : 'O';
                    highlightWinningCells(winner);
                }
                
                // Create confetti effect for wins
                if (result !== 'tie') {
                    createConfetti(result === 'playerWin' ? 'X' : 'O');
                }
                
                // Update game status message
                updateGameStatus(result);
                
                // Save game result to localStorage for offline persistence
                if (typeof Storage !== 'undefined') {
                    try {
                        const stats = JSON.parse(localStorage.getItem('ticTacToeStats')) || { wins: 0, losses: 0, ties: 0 };
                        
                        if (result === 'playerWin') stats.wins = (stats.wins || 0) + 1;
                        else if (result === 'computerWin') stats.losses = (stats.losses || 0) + 1;
                        else if (result === 'tie') stats.ties = (stats.ties || 0) + 1;
                        
                        localStorage.setItem('ticTacToeStats', JSON.stringify(stats));
                    } catch (e) {
                        console.error('Error saving game stats:', e);
                    }
                }
            }
            
            function highlightWinningCells(player) {
                const winPatterns = [
                    [0, 1, 2], [3, 4, 5], [6, 7, 8],
                    [0, 3, 6], [1, 4, 7], [2, 5, 8],
                    [0, 4, 8], [2, 4, 6]
                ];
                
                for (const pattern of winPatterns) {
                    const [a, b, c] = pattern;
                    if (board[a] === player && board[b] === player && board[c] === player) {
                        cells[a].classList.add('win');
                        cells[b].classList.add('win');
                        cells[c].classList.add('win');
                        
                        // Add specific pulse animation based on player
                        if (player === 'X') {
                            cells[a].style.animation = 'x-pulse 1s infinite';
                            cells[b].style.animation = 'x-pulse 1s infinite';
                            cells[c].style.animation = 'x-pulse 1s infinite';
                        } else {
                            cells[a].style.animation = 'o-pulse 1s infinite';
                            cells[b].style.animation = 'o-pulse 1s infinite';
                            cells[c].style.animation = 'o-pulse 1s infinite';
                        }
                        break;
                    }
                }
            }
            
            function createConfetti(player) {
                const colors = player === 'X' ? 
                    ['#3a86ff', '#4cc9f0', '#4361ee'] : 
                    ['#ff006e', '#f72585', '#b5179e'];
                
                for (let i = 0; i < 50; i++) {
                    const confetti = document.createElement('div');
                    confetti.className = 'confetti';
                    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    confetti.style.left = Math.random() * 100 + '%';
                    confetti.style.width = Math.random() * 10 + 5 + 'px';
                    confetti.style.height = Math.random() * 10 + 5 + 'px';
                    confetti.style.animation = `confetti-fall ${Math.random() * 3 + 2}s linear forwards`;
                    gameBoard.appendChild(confetti);
                    
                    // Remove confetti after animation
                    setTimeout(() => {
                        confetti.remove();
                    }, 5000);
                }
            }
            
            function switchPlayer() {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            }
            
            function updateGameStatus(result) {
                gameStatus.className = 'game-status';
                
                if (!result) {
                    gameStatus.textContent = `Player ${currentPlayer}'s turn`;
                    return;
                }
                
                gameStatus.classList.add('visible');
                
                switch (result) {
                    case 'playerWin':
                        gameStatus.textContent = 'Player X wins! 🎉';
                        gameStatus.classList.add('win');
                        break;
                    case 'computerWin':
                        gameStatus.textContent = 'Player O wins!';
                        gameStatus.classList.add('win');
                        break;
                    case 'tie':
                        gameStatus.textContent = "It's a tie! 🤝";
                        gameStatus.classList.add('tie');
                        break;
                    default:
                        gameStatus.textContent = `Player ${currentPlayer}'s turn`;
                }
            }
            
            function resetGame() {
                // Reset board state
                board = ['', '', '', '', '', '', '', '', ''];
                currentPlayer = 'X';
                gameActive = true;
                
                // Reset UI
                cells.forEach(cell => {
                    cell.textContent = '';
                    cell.className = 'cell';
                    cell.style.animation = '';
                    cell.setAttribute('data-index', cell.getAttribute('data-index'));
                });
                
                updateGameStatus();
            }
            
            function updateDifficultyVisibility() {
                difficultyGroup.style.display = gameMode === 'pvc' ? 'flex' : 'none';
            }
        });