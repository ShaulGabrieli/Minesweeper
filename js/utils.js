'use strict'
const MINE = '💣'
const FLAG = '🚩'

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            if (!currCell.isShown) currCell = ' '
            if (currCell.isMine && currCell.isShown) currCell = MINE
            if (currCell.isShown && !currCell.isMine) {
                currCell.minesAroundCount === 0 ? (currCell = ' ') : (currCell = currCell.minesAroundCount)
            }

            var cellClass = getClassName({ i: i, j: j })

            strHTML += `\t<td data-i=${i} data-j=${j} class="cell ${cellClass}"  onclick="cellClicked(${i},${j})"  oncontextmenu="javascript:cellMarked(this);return false;">${currCell}</td>`
        }
        strHTML += '</tr>\n'
    }

    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

// location is an object like this - { i: 2, j: 7 }
function renderCell(location, value) {
    // Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}

function setMinesNegsCount() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var bombsCount = 0
            bombsCount = countNeighborsMines(i, j, gBoard)
            gBoard[i][j].minesAroundCount = bombsCount
        }
    }
    renderBoard(gBoard)
}

function countNeighborsMines(cellI, cellJ, mat) {
    var neighborsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue
            if (mat[i][j].isMine) neighborsCount++
        }
    }
    return neighborsCount
}
function MinesOnFirstClick(i, j) {
    if (!gGame.isOn) {
        gGame.isOn = true
        createRandomBomb(i, j, gLevel.MINES)
        setMinesNegsCount()
    }
}
function activeHint(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            const cellClassName = getClassName({ i, j })
            var elCell = document.querySelector('.' + cellClassName)
            var currCell = gBoard[i][j]
            if (isDark) {
                elCell.style.backgroundColor = 'black'
                elCell.style.color = 'rgb(235, 235, 235)'
            } else {
                elCell.style.backgroundColor = 'rgb(174, 173, 173)'
            }
            if (currCell.isMine) currCell = MINE
            else currCell.minesAroundCount === 0 ? (currCell = ' ') : (currCell = currCell.minesAroundCount)
            renderCell({ i, j }, currCell)
        }
    }
    gHintTimout = setTimeout(() => {
        for (var i = cellI - 1; i <= cellI + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue
            for (var j = cellJ - 1; j <= cellJ + 1; j++) {
                if (j < 0 || j >= gBoard[0].length) continue
                const cellClassName = getClassName({ i, j })
                var elCell = document.querySelector('.' + cellClassName)
                var currCell = gBoard[i][j]
                currCell = ' '
                if (isDark) {
                    elCell.style.backgroundColor = 'grey'
                    elCell.style.color = 'rgb(235, 235, 235)'
                } else {
                    elCell.style.backgroundColor = 'grey'
                }
                renderCell({ i, j }, currCell)
            }
        }
    }, 1000)
    gIsHintActive = !gIsHintActive
    gHintsLeft--
}

function cellClicked(i, j) {
    clearTimeout(gSafeTimeout)
    if (!gGame.isOn) timer()
    if (gBombsTillLose === 0) return
    MinesOnFirstClick(i, j)
    const cellClassName = getClassName({ i, j })
    const elCell = document.querySelector('.' + cellClassName)
    if (gIsHintActive) {
        activeHint(i, j)
        return
    }
    clearTimeout(gHintTimout)
    if (isDark) {
        elCell.style.backgroundColor = 'black'
        elCell.style.color = 'rgb(235, 235, 235)'
    } else {
        elCell.style.backgroundColor = 'rgb(174, 173, 173)'
    }
    expandShown(gBoard, elCell, i, j)
    var currCell = gBoard[i][j]
    if (currCell.isMarked) return
    if (currCell.isShown) return
    else {
        currCell.isShown = true
        gIsShownCount++
        if (currCell.isMine) {
            currCell = MINE
            gBombsTillLose--
            if (gThreeLivesLeft) {
                var strHTML = ''
                const elHearts = document.querySelector('.hearts')
                if (gBombsTillLose === 2) {
                    strHTML = `${gHeart}${gHeart}`
                    elHearts.innerHTML = strHTML
                } else {
                    strHTML = `${gHeart}`
                    elHearts.innerHTML = strHTML
                }
                elCell.style.backgroundColor = 'rgb(174, 173, 173)'
                renderCell({ i, j }, currCell)
                gFlagsNeededCount--
            }

            if (gBombsTillLose === 0) {
                const elHearts = document.querySelector('.hearts')
                elHearts.innerHTML = ''
                elCell.style.backgroundColor = 'red'
                renderCell({ i, j }, currCell)
                revelBombs()
                gameOver()
            }
        } else {
            gRegularCells--
            currCell.minesAroundCount === 0 ? (currCell = ' ') : (currCell = currCell.minesAroundCount)
            renderCell({ i, j }, currCell)
            checkGameOver()
            return
        }
        gGame.shownCount = gIsShownCount
        gGame.markedCount = gFlagsNeededCount
    }
}

function createRandomBomb(i, j, num) {
    for (var k = 0; k < num; k++) {
        const location = findEmptyCell(gBoard)
        if (gBoard[location.i][location.j].isMine || (i === location.i && j === location.j)) {
            k--
        } else {
            gBoard[location.i][location.j].isMine = true
        }
    }
}

function cellMarked(elCell) {
    const currCell = gBoard[elCell.dataset.i][elCell.dataset.j]
    if (currCell.isShown) return
    const location = {
        i: elCell.dataset.i,
        j: elCell.dataset.j,
    }

    if (!currCell.isMarked) {
        gFlagsNeededCount--
        currCell.isMarked = true
        renderCell(location, FLAG)
    } else {
        gFlagsNeededCount++
        currCell.isMarked = false
        renderCell(location, ' ')
    }
    checkGameOver()
    var flagCount = document.querySelector('.flag-count')
    flagCount.innerHTML = `<span class="flag-count">🚩 ${gFlagsNeededCount}</span>`
}

function expandShown(board, elCell, i, j) {
    const mineNeighbors = countNeighborsMines(i, j, board)
    if (mineNeighbors === 0) {
        clickOnNeighbors(i, j, board)
    }
}

function revelBombs() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine) {
                gBoard[i][j].isShown = true
                renderCell({ i, j }, MINE)
            }
        }
    }
}

function clickOnNeighbors(cellI, cellJ, mat) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue
            var currCell = mat[i][j]
            const cellClassName = getClassName({ i, j })
            const elCell = document.querySelector('.' + cellClassName)
            if (!currCell.isShown) {
                if (!gIsHintActive) gRegularCells--
            }
            if (isDark) {
                elCell.style.backgroundColor = 'black'
                elCell.style.color = 'rgb(235, 235, 235)'
            } else {
                elCell.style.backgroundColor = 'rgb(174, 173, 173)'
            }
            currCell.isShown = true
            currCell.minesAroundCount === 0 ? (currCell = ' ') : (currCell = currCell.minesAroundCount)
            renderCell({ i, j }, currCell)
        }
    }
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function findEmptyCell(board) {
    const emptyCells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            emptyCells.push({ i, j })
        }
    }
    const randomNumIdx = getRandomInt(0, emptyCells.length)
    const randomCell = emptyCells[randomNumIdx]
    return randomCell
}

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}

function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}
