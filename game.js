class Game2048 {
    constructor() {
        this.grid = [];
        this.size = 4;
        this.score = 0;
        this.gameContainer = document.querySelector('.game-container');
        this.gridElement = document.querySelector('.grid');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('best-score');
        this.gameOverElement = document.querySelector('.game-over');
        this.restartButton = document.getElementById('restart-btn');

        this.initGrid();
        this.addEventListeners();
        this.spawnTile();
        this.spawnTile();
        this.updateGrid();
    }

    initGrid() {
        // Create a 4x4 grid of empty cells
        for (let i = 0; i < this.size; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.grid[i][j] = null;
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.row = i;
                cell.dataset.col = j;
                this.gridElement.appendChild(cell);
            }
        }
    }

    spawnTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === null) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }

        if (emptyCells.length === 0) return false;

        const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const value = Math.random() < 0.9 ? 2 : 4;
        this.grid[row][col] = value;
        this.createTileElement(row, col, value);
        return true;
    }

    createTileElement(row, col, value) {
        const tile = document.createElement('div');
        tile.classList.add('tile', `tile-${value}`);
        tile.textContent = value;
        
        // Calculate position based on grid dimensions
        const cellSize = (this.gridElement.clientWidth - 45) / 4;
        const left = 15 + col * (cellSize + 15);
        const top = 15 + row * (cellSize + 15);
        
        tile.style.left = `${left}px`;
        tile.style.top = `${top}px`;
        
        this.gameContainer.appendChild(tile);
    }

    updateGrid() {
        // Remove existing tiles
        document.querySelectorAll('.tile').forEach(tile => tile.remove());

        // Recreate tiles based on grid state
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== null) {
                    this.createTileElement(i, j, this.grid[i][j]);
                }
            }
        }

        // Update score
        this.scoreElement.textContent = this.score;
        const bestScore = localStorage.getItem('bestScore') || 0;
        if (this.score > bestScore) {
            localStorage.setItem('bestScore', this.score);
        }
        this.bestScoreElement.textContent = Math.max(this.score, bestScore);
    }

    moveTiles(direction) {
        let moved = false;
        const rotatedGrid = this.rotateGrid(direction);
        
        for (let i = 0; i < this.size; i++) {
            const row = rotatedGrid[i];
            const newRow = this.mergeTiles(row);
            rotatedGrid[i] = newRow;
            
            // Check if the row changed
            if (JSON.stringify(row) !== JSON.stringify(newRow)) {
                moved = true;
            }
        }

        // Rotate grid back to original orientation
        this.grid = this.unrotateGrid(rotatedGrid, direction);
        
        if (moved) {
            this.spawnTile();
            this.updateGrid();
            this.checkGameOver();
        }
    }

    mergeTiles(row) {
        // Remove zeros
        row = row.filter(cell => cell !== null);
        
        // Merge adjacent equal tiles
        for (let i = 0; i < row.length - 1; i++) {
            if (row[i] === row[i + 1]) {
                row[i] *= 2;
                this.score += row[i];
                row.splice(i + 1, 1);
            }
        }
        
        // Pad with nulls
        while (row.length < this.size) {
            row.push(null);
        }
        
        return row;
    }

    rotateGrid(direction) {
        const rotated = [
            [null, null, null, null],
            [null, null, null, null],
            [null, null, null, null],
            [null, null, null, null]
        ];

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                switch(direction) {
                    case 'left':
                        rotated[i][j] = this.grid[i][j];
                        break;
                    case 'right':
                        rotated[i][j] = this.grid[i][this.size - 1 - j];
                        break;
                    case 'up':
                        rotated[i][j] = this.grid[j][i];
                        break;
                    case 'down':
                        rotated[i][j] = this.grid[this.size - 1 - j][i];
                        break;
                }
            }
        }
        
        return rotated;
    }

    unrotateGrid(rotated, direction) {
        const unrotated = [
            [null, null, null, null],
            [null, null, null, null],
            [null, null, null, null],
            [null, null, null, null]
        ];

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                switch(direction) {
                    case 'left':
                        unrotated[i][j] = rotated[i][j];
                        break;
                    case 'right':
                        unrotated[i][this.size - 1 - j] = rotated[i][j];
                        break;
                    case 'up':
                        unrotated[j][i] = rotated[i][j];
                        break;
                    case 'down':
                        unrotated[this.size - 1 - j][i] = rotated[i][j];
                        break;
                }
            }
        }
        
        return unrotated;
    }

    checkGameOver() {
        // Check if there are any empty cells
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === null) return;
            }
        }

        // Check if any adjacent cells can be merged
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (
                    (i > 0 && this.grid[i][j] === this.grid[i-1][j]) ||
                    (i < this.size - 1 && this.grid[i][j] === this.grid[i+1][j]) ||
                    (j > 0 && this.grid[i][j] === this.grid[i][j-1]) ||
                    (j < this.size - 1 && this.grid[i][j] === this.grid[i][j+1])
                ) {
                    return;
                }
            }
        }

        // Game over
        this.gameOverElement.classList.remove('hidden');
    }

    restart() {
        // Reset grid
        this.grid = [];
        this.score = 0;
        this.gridElement.innerHTML = '';
        this.gameOverElement.classList.add('hidden');

        this.initGrid();
        this.spawnTile();
        this.spawnTile();
        this.updateGrid();
    }

    addEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    this.moveTiles('left');
                    break;
                case 'ArrowRight':
                    this.moveTiles('right');
                    break;
                case 'ArrowUp':
                    this.moveTiles('up');
                    break;
                case 'ArrowDown':
                    this.moveTiles('down');
                    break;
            }
        });

        // Touch controls for mobile
        let touchStartX = 0;
        let touchStartY = 0;

        this.gameContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        this.gameContainer.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe
                if (diffX > 0) {
                    this.moveTiles('right');
                } else {
                    this.moveTiles('left');
                }
            } else {
                // Vertical swipe
                if (diffY > 0) {
                    this.moveTiles('down');
                } else {
                    this.moveTiles('up');
                }
            }
        });

        // Restart buttons
        this.restartButton.addEventListener('click', () => this.restart());
        document.getElementById('restart-btn-bottom').addEventListener('click', () => this.restart());
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
