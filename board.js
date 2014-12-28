//(function () {
    var canvas
//    var
        canMakeMove = true
    var finishedMove = false
    var lastAttackingPos
    var humanPlayer
    var p1, p2
    var lastP1, lastP2

//    var ctx = null
    ctx = null

    // var
    Board = {
        BLACK: 0,
        WHITE: 1,

        BPAWN: 0,
        WPAWN: 1,
        BKING: 2,
        WKING: 3,
        EMPTY: 5,
        WHITE_WINS: -100,
        BLACK_WINS: 100
    }


    var ru = [4, 5, 6, 7, 9, 10, 11, null, 12, 13, 14, 15, 17, 18, 19, null, 20, 21, 22, 23, 25, 26, 27, null, 28, 29, 30, 31, null, null, null, null]
    var lu = [null, 4, 5, 6, 8, 9, 10, 11, null, 12, 13, 14, 16, 17, 18, 19, null, 20, 21, 22, 24, 25, 26, 27, null, 28, 29, 30, null, null, null, null]
    var rd = [null, null, null, null, 1, 2, 3, null, 4, 5, 6, 7, 9, 10, 11, null, 12, 13, 14, 15, 17, 18, 19, null, 20, 21, 22, 23, 25, 26, 27, null]
    var ld = [null, null, null, null, 0, 1, 2, 3, null, 4, 5, 6, 8, 9, 10, 11, null, 12, 13, 14, 16, 17, 18, 19, null, 20, 21, 22, 24, 25, 26, 27]
    canvas = document.getElementById('board')
    ctx = canvas.getContext('2d')

    humanPlayer = window.location.hash
    if (humanPlayer.toLowerCase() == '#white') {
        humanPlayer = Board.WHITE
    } else {
        humanPlayer = Board.BLACK
    }
    console.log(humanPlayer)

    Board.getCoordinates = function(x, y) {
        var ret = (7 - y) * 4 + (x - (1 - (y % 2 == 1))) / 2
        if (parseInt(ret) == ret) {
            return ret
        }
        return undefined
    }

    Board.drawBoard = function (ctx) {
        var i, j
        ctx.clearRect(0, 0, 400, 400)
        for (i = 0; i < 8; ++i) {
            for (j = 0; j < 8; ++j) {
                ctx.fillStyle = ['white', 'black'][(i + j) % 2]
                var q = Board.getCoordinates(i, j)
                if ( q != undefined && (q == lastP1 || q == lastP2) ) {
                    ctx.fillStyle = 'yellow'
                }
                ctx.fillRect(i * 50, j * 50, 50, 50)
            }
        }

        ctx.strokeRect(0, 0, 400, 400)
    }

    Board.drawItem = function (ctx, item, posy, posx) {
        var x, y
        var old = ctx.fillStyle
        var color = ['rgb(117, 194, 105)', 'red'][item & 1]

        if (item > 4) {
            return
        }

        ctx.beginPath()
        x = posx * 100 + 25
        y = 400 - (posy + 1) * 50 + 25
        if (posy % 2 == 1) {
            x += 50
        }

        ctx.arc(x, y, 22, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.fillStyle = color
        ctx.fill()
        ctx.stroke()

        if (item > 1) {
            ctx.beginPath()
            ctx.arc(x, y, 18, 0, 2 * Math.PI)
            ctx.closePath()
            ctx.stroke()
        }

        ctx.fillStyle = old
    }

    Board.drawPosition = function (ctx, boardPos) {
        var i, x, y
        Board.drawBoard(ctx)
        for (i = 0; i < 32; ++i) {
            y = parseInt(i / 4)
            x = i % 4
            Board.drawItem(ctx, boardPos[i], y, x)
        }
    }

    Board.movesUp = function (item) {
        return item == Board.BPAWN || item == Board.BKING || item == Board.WKING
    }

    Board.movesDown = function (item) {
        return item == Board.WPAWN || item == Board.BKING || item == Board.WKING
    }

    Board.enemy = function (player, item) {
        if (item == Board.EMPTY) {
            return false
        }
        if (player == Board.BLACK) {
            return item == Board.WPAWN || item == Board.WKING
        }
        return item == Board.BPAWN || item == Board.BKING
    }

    Board.player = function (player, item) {
        if (item == Board.EMPTY) {
            return false
        }
        return !Board.enemy(player, item)
    }

    Board.checkPromotion = function(figure, pos) {
        if ( figure == Board.BPAWN && pos > 27 ) {
            return Board.BKING
        }
        if ( figure == Board.WPAWN && pos < 4 ) {
            return Board.WKING
        }
        return figure
    }

    Board.attackDirection = function(boardPos, player, i, dir) {
        var tmp = null
        if ( dir[i] != null && Board.enemy(player, boardPos[dir[i]]) && boardPos[dir[dir[i]]] == Board.EMPTY ) {
            tmp = boardPos.slice()
            tmp[i] = Board.EMPTY
            tmp[dir[i]] = Board.EMPTY
            tmp[dir[dir[i]]] = Board.checkPromotion(boardPos[i], dir[dir[i]])
        }
        return tmp
    }

    Board.attackingMovesFromPosition = function(boardPos, player, i, returnPos) {
        var result = []
        var moves
        var mv, tmpBoard

        if ( !Board.enemy(player, boardPos[i]) ) {
            if (Board.movesUp(boardPos[i])) {
                tmp = Board.attackDirection(boardPos, player, i, ru)
                if ( tmp != null ) {
                    moves = Board.attackingMovesFromPosition(tmp, player, ru[ru[i]], true)
                    for (mv in moves) {
                        result.push([moves[mv][0], [i].concat(moves[mv][1])])
                    }
                }
                tmp = Board.attackDirection(boardPos, player, i, lu)
                if ( tmp != null ) {
                    moves = Board.attackingMovesFromPosition(tmp, player, lu[lu[i]], true)
                    for (mv in moves) {
                        result.push([moves[mv][0], [i].concat(moves[mv][1])])
                    }
                }
            }
            if (Board.movesDown(boardPos[i])) {
                tmp = Board.attackDirection(boardPos, player, i, ld)
                if ( tmp != null ) {
                    moves = Board.attackingMovesFromPosition(tmp, player, ld[ld[i]], true)
                    for (mv in moves) {
                        result.push([moves[mv][0], [i].concat(moves[mv][1])])
                    }
                }
                tmp = Board.attackDirection(boardPos, player, i, rd)
                if ( tmp != null ) {
                    moves = Board.attackingMovesFromPosition(tmp, player, rd[rd[i]], true)
                    for (mv in moves) {
                        result.push([moves[mv][0], [i].concat(moves[mv][1])])
                    }
                }
            }
        }
        if ( result.length == 0 ) {
            if ( returnPos ) {
                return [[boardPos, [i]]]
            }
        }
        return result
    }

    Board.attackingMoves = function (boardPos, player) {
        var result = []
        var i

        for (i = 0; i < 32; ++i) {
            if (boardPos[i] == Board.EMPTY) {
                continue
            }
            if (!Board.enemy(player, boardPos[i])) {
                result = result.concat(Board.attackingMovesFromPosition(boardPos, player, i, false))
            }
        }
        return result
    }

    Board.possibleMoves = function (boardPos, player) {
        var result
        var tmp
        var i

        result = Board.attackingMoves(boardPos, player)
        if (result.length > 0) {
            return result
        }

        for (i = 0; i < 32; ++i) {
            if (!Board.enemy(player, boardPos[i])) {
                if (Board.movesUp(boardPos[i])) {
                    if (boardPos[lu[i]] == Board.EMPTY) {
                        tmp = boardPos.slice()
                        tmp[i] = Board.EMPTY
                        tmp[lu[i]] = boardPos[i]
                        result.push([tmp, [i, lu[i]]])
                    }
                    if (boardPos[ru[i]] == Board.EMPTY) {
                        tmp = boardPos.slice()
                        tmp[i] = Board.EMPTY
                        tmp[ru[i]] = boardPos[i]
                        result.push([tmp, [i, ru[i]]])
                    }
                }
                if (Board.movesDown(boardPos[i])) {
                    if (boardPos[ld[i]] == Board.EMPTY) {
                        tmp = boardPos.slice()
                        tmp[i] = Board.EMPTY
                        tmp[ld[i]] = boardPos[i]
                        result.push([tmp, [i, ld[i]]])
                    }
                    if (boardPos[rd[i]] == Board.EMPTY) {
                        tmp = boardPos.slice()
                        tmp[i] = Board.EMPTY
                        tmp[rd[i]] = boardPos[i]
                        result.push([tmp, [i, rd[i]]])
                    }
                }
            }
        }
        return result
    }

    Board.isStable = function(boardPos, player) {
        var moves = Board.attackingMoves(boardPos, player)
        return moves.length == 0
    }

    Board.evalPosition = function(boardPos) {
        var i, j, br, wr

        var sideSquares = [0, 8, 16, 24, 7, 15, 23, 31]
        var centerSquares = [9, 17, 13, 21, 10, 18, 14, 22]

        br = 0.0
        wr = 0.0

        for (i = 0; i < 32; ++i) {
            if (boardPos[i] == Board.BPAWN) {
                br += 1.0
            }
            if (boardPos[i] == Board.WPAWN) {
                wr += 1.0
            }
            if (boardPos[i] == Board.BKING) {
                br += 2.75
            }
            if (boardPos[i] == Board.WKING) {
                wr += 2.75
            }
        }

        for (i = 0; i < 8; ++i) {
            if (boardPos[sideSquares[i]] == Board.BPAWN || boardPos[sideSquares[i]] == Board.BKING) {
                br += 0.1
            }
            if (boardPos[sideSquares[i]] == Board.WPAWN || boardPos[sideSquares[i]] == Board.WKING) {
                wr += 0.1
            }
            if (boardPos[centerSquares[i]] == Board.BPAWN) {
                br += 0.1
            }
            if (boardPos[centerSquares[i]] == Board.WPAWN) {
                wr += 0.1
            }
            if (boardPos[centerSquares[i]] == Board.BKING) {
                br += 0.2
            }
            if (boardPos[centerSquares[i]] == Board.WKING) {
                wr += 0.2
            }
        }

        return br - wr
    }

    Board.makeMove = function (boardPos, player, depth, move) {
        var moveList, r, bestMove, i, m

        if (depth <= 0 && Board.isStable(boardPos, player)) {
            return [Board.evalPosition(boardPos), move]
        }

        if (player == Board.BLACK) {
            r = Board.WHITE_WINS
        } else {
            r = Board.BLACK_WINS
        }
        bestMove = null

        moveList = Board.possibleMoves(boardPos, player)
        for (i = 0; i < moveList.length; ++i) {
            m = moveList[i]
            l = Board.makeMove(m[0], 1 - player, depth - 1, m[1])
            if (player == Board.BLACK) {
                if (l[0] >= r) {
                    r = l[0]
                    bestMove = m[1]
                }
            } else {
                if (l[0] <= r) {
                    r = l[0]
                    bestMove = m[1]
                }
            }
        }

        return [r, bestMove]
    }

    Board.checkMove = function(boardObj, p1, p2, humanPlayer) {
        var attackingMoves = Board.attackingMoves(boardObj, humanPlayer)
        var possibleMoves
        var move, i

        if ( lastAttackingPos != undefined && p1 != lastAttackingPos ) {
            return false
        }

        if ( attackingMoves.length > 0 ) {
            for(i = 0; i < attackingMoves.length; ++i) {
                move = attackingMoves[i]
                if ( move[1][0] == p1 && move[1][1] == p2 ) {
                    if ( move[1].length == 2 ) {
                        finishedMove = true
                        lastAttackingPos = undefined
                    }
                    return true
                }
            }
            return false
        }

        possibleMoves = Board.possibleMoves(boardObj, humanPlayer)
        for(i = 0; i < possibleMoves.length; ++i) {
            move = possibleMoves[i]
            if (move[1][0] == p1 && move[1][1] == p2) {
                finishedMove = true
                lastAttackingPos = undefined
                return true
            }
        }

        return false
    }

    count = 0
    last = null
    dbg = []
    var computeTree = function(pos, player, depth) {
        console.log(pos, player, depth)
        count++
        if (depth == 0) {
            last = pos
            dbg.push(pos)
            return
        }
        var kk = Board.possibleMoves(pos, player)
        for (var i1 = 0; i1 < kk.length; ++i1) {
            console.log(kk[i1][1])
            computeTree(kk[i1][0], player ? 0 : 1, depth - 1)
        }
    }

    Board.applyMove = function(boardObj, p1, p2, player) {
        console.log('mv ', p1, p2, ['black', 'white'][player])
        lastP1 = p1
        lastP2 = p2
        if ( p1 < p2 ) {
            if (p2 > 27 && boardObj[p1] < 2) {
                boardObj[p1] += 2 // HACK: make it king and then move it
            }

            if ( p2 - p1 == 7 ) {
                boardObj[p2] = boardObj[p1]
                boardObj[p1] = Board.EMPTY
                boardObj[lu[p1]] = Board.EMPTY
                return
            }
            if ( p2 - p1 == 9 ) {
                boardObj[p2] = boardObj[p1]
                boardObj[p1] = Board.EMPTY
                boardObj[ru[p1]] = Board.EMPTY
                return
            }
        } else {
            if (p2 < 4 && boardObj[p1] < 2) {
                boardObj[p1] += 2
            }
            if ( p1 - p2 == 7 ) {
                boardObj[p2] = boardObj[p1]
                boardObj[p1] = Board.EMPTY
                boardObj[rd[p1]] = Board.EMPTY
                return
            }
            if ( p1 - p2 == 9 ) {
                boardObj[p2] = boardObj[p1]
                boardObj[p1] = Board.EMPTY
                boardObj[ld[p1]] = Board.EMPTY
                return
            }
        }
        boardObj[p2] = boardObj[p1]
        boardObj[p1] = Board.EMPTY
    }

//    var
//        initial = [
//        0, 0, 0, 0,
//        0, 0, 0, 0,
//        0, 0, 0, 0,
//        5, 5, 5, 5,
//        5, 5, 5, 5,
//        1, 1, 1, 1,
//        1, 1, 1, 1,
//        1, 1, 1, 1
//    ]
//    var
//        starting = [
//        0, 0, 0, 0,
//        0, 5, 2, 0,
//        0, 5, 0, 5,
//        5, 0, 0, 5,
//        5, 1, 5, 5,
//        5, 1, 1, 1,
//        5, 1, 3, 1,
//        1, 5, 1, 1
//    ]
//    zz = Board.possibleMoves(starting, 0)
//    computeTree(starting, 0, 3)
//    console.log(count)
//    console.log(zz)
//    Board.drawPosition(ctx, initial)
//    console.log(count)
//    Board.drawPosition(ctx, last)
//    Board.drawPosition(ctx, zz[0][0])
//    console.log(zz[0][1])
//    console.log(Board.makeMove(starting, Board.BLACK, 3))


    boardObj = [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        5, 5, 5, 5,
        5, 5, 5, 5,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1
    ]

//    boardObj = [
//        0, 0, 0, 0,
//        0, 5, 2, 0,
//        0, 5, 0, 5,
//        5, 0, 0, 5,
//        5, 1, 5, 5,
//        5, 1, 1, 1,
//        5, 1, 3, 1,
//        1, 5, 1, 1
//    ]

    Board.drawPosition(ctx, boardObj)

    if ( humanPlayer == Board.WHITE ) {
        computerMove = Board.makeMove(boardObj, 1 - humanPlayer, 6)
        console.log(computerMove)

        canMakeMove = false
        Board.applyMove(boardObj, computerMove[1][0], computerMove[1][1], 1 - humanPlayer)
        Board.drawPosition(ctx, boardObj)
        canMakeMove = true
    }

    canvas.addEventListener('click', function() {
        var computerMove
        var x = parseInt((event.pageX - canvas.offsetLeft) / 50)
        var y = parseInt((event.pageY - canvas.offsetTop) / 50)

        if ( canMakeMove ) {
            if ( p1 != undefined ) {
                p2 = Board.getCoordinates(x, y)
                if (p2 == undefined) {
                    p1 = undefined
                }
            } else {
                p1 = Board.getCoordinates(x, y)
            }
            console.log('p1: ', p1, 'p2: ', p2, humanPlayer)
            if ( p1 != undefined && p2 != undefined ) {
                if (Board.checkMove(boardObj, p1, p2, humanPlayer)) {
                    console.log(' -- here')
                    Board.applyMove(boardObj, p1, p2, humanPlayer)
                    Board.drawPosition(ctx, boardObj)
                    if (finishedMove) {
                        p1 = undefined
                        p2 = undefined
                        finishedMove = false
                        canMakeMove = false
                        console.log(boardObj)
                        Board.drawPosition(ctx, boardObj)
                        computerMove = Board.makeMove(boardObj, 1 - humanPlayer, 6)
                        console.log(computerMove)
                        if (computerMove[1].length == 2) {
                            Board.applyMove(boardObj, computerMove[1][0], computerMove[1][1], 1 - humanPlayer)
                            Board.drawPosition(ctx, boardObj)
                            canMakeMove = true
                        } else {
                            var k = 1
                            Board.applyMove(boardObj, computerMove[1][0], computerMove[1][1], 1 - humanPlayer)
                            Board.drawPosition(ctx, boardObj)
                            var interval = setInterval(function () {
                                if (k == computerMove[1].length - 1) {
                                    clearInterval(interval)
                                    console.log(boardObj)
                                    canMakeMove = true
                                    return
                                }
                                console.log('k: ', k)
                                console.log('computerMove[1].length: ', computerMove[1].length)
                                Board.applyMove(boardObj, computerMove[1][k], computerMove[1][k+1], 1 - humanPlayer)
                                Board.drawPosition(ctx, boardObj)
                                k++
                            }, 250)
                        }
                    }
                } else {
                    p1 = p2 = undefined
                }
            }
        }

    }, false)
//}())