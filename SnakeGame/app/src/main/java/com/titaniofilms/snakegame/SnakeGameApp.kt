package com.titaniofilms.snakegame

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlin.math.abs
import kotlin.random.Random

// Colors
val SnakeGreen = Color(0xFF4CAF50)
val SnakeGreenDark = Color(0xFF388E3C)
val SnakeGreenLight = Color(0xFF81C784)
val FoodRed = Color(0xFFFF5252)
val FoodGold = Color(0xFFFFD700)
val BoardDark = Color(0xFF1A1A2E)
val BoardLight = Color(0xFF16213E)
val AccentBlue = Color(0xFF0F3460)
val TextWhite = Color(0xFFE8E8E8)

enum class Direction { UP, DOWN, LEFT, RIGHT }
enum class GameState { MENU, PLAYING, PAUSED, GAME_OVER }

data class Point(val x: Int, val y: Int)

@Composable
fun SnakeGameApp() {
    var gameState by remember { mutableStateOf(GameState.MENU) }
    var score by remember { mutableIntStateOf(0) }
    var highScore by remember { mutableIntStateOf(0) }

    when (gameState) {
        GameState.MENU -> MenuScreen(
            highScore = highScore,
            onStart = { gameState = GameState.PLAYING }
        )
        GameState.PLAYING -> GameScreen(
            onGameOver = { finalScore ->
                score = finalScore
                if (finalScore > highScore) highScore = finalScore
                gameState = GameState.GAME_OVER
            }
        )
        GameState.PAUSED -> {} // handled inside GameScreen
        GameState.GAME_OVER -> GameOverScreen(
            score = score,
            highScore = highScore,
            onRestart = { gameState = GameState.PLAYING },
            onMenu = { gameState = GameState.MENU }
        )
    }
}

@Composable
fun MenuScreen(highScore: Int, onStart: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BoardDark)
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "🐍",
            fontSize = 80.sp
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "SNAKE",
            fontSize = 48.sp,
            fontWeight = FontWeight.Bold,
            color = SnakeGreen,
            letterSpacing = 8.sp
        )
        Text(
            text = "GAME",
            fontSize = 24.sp,
            fontWeight = FontWeight.Light,
            color = SnakeGreenLight,
            letterSpacing = 12.sp
        )
        Spacer(modifier = Modifier.height(48.dp))

        if (highScore > 0) {
            Text(
                text = "🏆 High Score: $highScore",
                fontSize = 18.sp,
                color = FoodGold
            )
            Spacer(modifier = Modifier.height(24.dp))
        }

        Button(
            onClick = onStart,
            modifier = Modifier
                .width(200.dp)
                .height(56.dp),
            colors = ButtonDefaults.buttonColors(containerColor = SnakeGreen),
            shape = RoundedCornerShape(28.dp)
        ) {
            Text(
                text = "PLAY",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 4.sp
            )
        }

        Spacer(modifier = Modifier.height(48.dp))
        Text(
            text = "Swipe to control",
            fontSize = 14.sp,
            color = TextWhite.copy(alpha = 0.5f)
        )
    }
}

@Composable
fun GameScreen(onGameOver: (Int) -> Unit) {
    val boardSize = 20 // 20x20 grid
    var snake by remember { mutableStateOf(listOf(Point(10, 10), Point(9, 10), Point(8, 10))) }
    var food by remember { mutableStateOf(generateFood(boardSize, listOf(Point(10, 10)))) }
    var bonusFood by remember { mutableStateOf<Point?>(null) }
    var direction by remember { mutableStateOf(Direction.RIGHT) }
    var nextDirection by remember { mutableStateOf(Direction.RIGHT) }
    var score by remember { mutableIntStateOf(0) }
    var speed by remember { mutableLongStateOf(180L) }
    var isRunning by remember { mutableStateOf(true) }

    // Game loop
    LaunchedEffect(isRunning) {
        while (isRunning) {
            delay(speed)
            direction = nextDirection
            val head = snake.first()
            val newHead = when (direction) {
                Direction.UP -> Point(head.x, head.y - 1)
                Direction.DOWN -> Point(head.x, head.y + 1)
                Direction.LEFT -> Point(head.x - 1, head.y)
                Direction.RIGHT -> Point(head.x + 1, head.y)
            }

            // Check collisions
            if (newHead.x < 0 || newHead.x >= boardSize ||
                newHead.y < 0 || newHead.y >= boardSize ||
                snake.contains(newHead)
            ) {
                isRunning = false
                onGameOver(score)
                return@LaunchedEffect
            }

            val ateFood = newHead == food
            val ateBonus = bonusFood != null && newHead == bonusFood

            snake = if (ateFood || ateBonus) {
                listOf(newHead) + snake
            } else {
                listOf(newHead) + snake.dropLast(1)
            }

            if (ateFood) {
                score += 10
                food = generateFood(boardSize, snake)
                // Speed up slightly
                if (speed > 80) speed -= 2
                // Random chance of bonus food
                if (bonusFood == null && Random.nextInt(5) == 0) {
                    bonusFood = generateFood(boardSize, snake + food)
                }
            }

            if (ateBonus) {
                score += 50
                bonusFood = null
            }
        }
    }

    // Bonus food timeout
    LaunchedEffect(bonusFood) {
        if (bonusFood != null) {
            delay(5000)
            bonusFood = null
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BoardDark)
            .statusBarsPadding()
    ) {
        // Score bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "SCORE",
                fontSize = 12.sp,
                color = TextWhite.copy(alpha = 0.5f),
                letterSpacing = 2.sp
            )
            Text(
                text = "$score",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = SnakeGreen
            )
            Text(
                text = "🐍 ${snake.size}",
                fontSize = 16.sp,
                color = TextWhite.copy(alpha = 0.7f)
            )
        }

        // Game board
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .padding(8.dp)
                .pointerInput(Unit) {
                    detectDragGestures { _, dragAmount ->
                        val (dx, dy) = dragAmount
                        if (abs(dx) > abs(dy)) {
                            // Horizontal swipe
                            if (dx > 0 && direction != Direction.LEFT) {
                                nextDirection = Direction.RIGHT
                            } else if (dx < 0 && direction != Direction.RIGHT) {
                                nextDirection = Direction.LEFT
                            }
                        } else {
                            // Vertical swipe
                            if (dy > 0 && direction != Direction.UP) {
                                nextDirection = Direction.DOWN
                            } else if (dy < 0 && direction != Direction.DOWN) {
                                nextDirection = Direction.UP
                            }
                        }
                    }
                }
        ) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val cellSize = size.width / boardSize

                // Draw board background with grid
                for (x in 0 until boardSize) {
                    for (y in 0 until boardSize) {
                        val color = if ((x + y) % 2 == 0) BoardDark else BoardLight
                        drawRect(
                            color = color,
                            topLeft = Offset(x * cellSize, y * cellSize),
                            size = Size(cellSize, cellSize)
                        )
                    }
                }

                // Draw border
                drawRect(
                    color = AccentBlue,
                    topLeft = Offset.Zero,
                    size = size,
                    style = androidx.compose.ui.graphics.drawscope.Stroke(width = 3f)
                )

                // Draw food
                drawCircle(
                    color = FoodRed,
                    radius = cellSize * 0.4f,
                    center = Offset(
                        food.x * cellSize + cellSize / 2,
                        food.y * cellSize + cellSize / 2
                    )
                )
                // Food glow
                drawCircle(
                    color = FoodRed.copy(alpha = 0.3f),
                    radius = cellSize * 0.55f,
                    center = Offset(
                        food.x * cellSize + cellSize / 2,
                        food.y * cellSize + cellSize / 2
                    )
                )

                // Draw bonus food
                bonusFood?.let { bonus ->
                    drawCircle(
                        color = FoodGold,
                        radius = cellSize * 0.45f,
                        center = Offset(
                            bonus.x * cellSize + cellSize / 2,
                            bonus.y * cellSize + cellSize / 2
                        )
                    )
                    drawCircle(
                        color = FoodGold.copy(alpha = 0.3f),
                        radius = cellSize * 0.6f,
                        center = Offset(
                            bonus.x * cellSize + cellSize / 2,
                            bonus.y * cellSize + cellSize / 2
                        )
                    )
                }

                // Draw snake
                snake.forEachIndexed { index, point ->
                    val isHead = index == 0
                    val progress = index.toFloat() / snake.size
                    val segmentColor = if (isHead) {
                        SnakeGreenLight
                    } else {
                        lerp(SnakeGreen, SnakeGreenDark, progress)
                    }

                    val cornerRadius = if (isHead) cellSize * 0.35f else cellSize * 0.2f

                    drawRoundedRect(
                        color = segmentColor,
                        topLeft = Offset(
                            point.x * cellSize + 1f,
                            point.y * cellSize + 1f
                        ),
                        size = Size(cellSize - 2f, cellSize - 2f),
                        cornerRadius = cornerRadius
                    )

                    // Draw eyes on head
                    if (isHead) {
                        drawSnakeEyes(
                            cellSize = cellSize,
                            head = point,
                            direction = direction
                        )
                    }
                }
            }
        }

        // Direction buttons
        Spacer(modifier = Modifier.height(16.dp))
        DirectionPad(
            onDirection = { dir ->
                when (dir) {
                    Direction.UP -> if (direction != Direction.DOWN) nextDirection = dir
                    Direction.DOWN -> if (direction != Direction.UP) nextDirection = dir
                    Direction.LEFT -> if (direction != Direction.RIGHT) nextDirection = dir
                    Direction.RIGHT -> if (direction != Direction.LEFT) nextDirection = dir
                }
            }
        )
    }
}

@Composable
fun DirectionPad(onDirection: (Direction) -> Unit) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Up
        DPadButton("▲") { onDirection(Direction.UP) }
        Row(
            horizontalArrangement = Arrangement.spacedBy(48.dp)
        ) {
            DPadButton("◀") { onDirection(Direction.LEFT) }
            DPadButton("▶") { onDirection(Direction.RIGHT) }
        }
        // Down
        DPadButton("▼") { onDirection(Direction.DOWN) }
    }
}

@Composable
fun DPadButton(text: String, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = Modifier.size(64.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = AccentBlue.copy(alpha = 0.7f)
        ),
        shape = CircleShape,
        contentPadding = PaddingValues(0.dp)
    ) {
        Text(
            text = text,
            fontSize = 24.sp,
            color = SnakeGreenLight
        )
    }
}

@Composable
fun GameOverScreen(
    score: Int,
    highScore: Int,
    onRestart: () -> Unit,
    onMenu: () -> Unit
) {
    val isNewHighScore = score == highScore && score > 0

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BoardDark)
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "💀",
            fontSize = 64.sp
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "GAME OVER",
            fontSize = 36.sp,
            fontWeight = FontWeight.Bold,
            color = FoodRed,
            letterSpacing = 4.sp
        )
        Spacer(modifier = Modifier.height(32.dp))

        Text(
            text = "Score",
            fontSize = 14.sp,
            color = TextWhite.copy(alpha = 0.5f)
        )
        Text(
            text = "$score",
            fontSize = 48.sp,
            fontWeight = FontWeight.Bold,
            color = if (isNewHighScore) FoodGold else SnakeGreen
        )
        if (isNewHighScore) {
            Text(
                text = "🏆 NEW HIGH SCORE! 🏆",
                fontSize = 16.sp,
                color = FoodGold,
                fontWeight = FontWeight.Bold
            )
        }

        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Best: $highScore",
            fontSize = 16.sp,
            color = TextWhite.copy(alpha = 0.5f)
        )

        Spacer(modifier = Modifier.height(48.dp))

        Button(
            onClick = onRestart,
            modifier = Modifier
                .width(200.dp)
                .height(52.dp),
            colors = ButtonDefaults.buttonColors(containerColor = SnakeGreen),
            shape = RoundedCornerShape(26.dp)
        ) {
            Text(
                text = "PLAY AGAIN",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 2.sp
            )
        }
        Spacer(modifier = Modifier.height(16.dp))
        TextButton(onClick = onMenu) {
            Text(
                text = "MENU",
                fontSize = 16.sp,
                color = TextWhite.copy(alpha = 0.6f),
                letterSpacing = 2.sp
            )
        }
    }
}

// Helper functions
fun generateFood(boardSize: Int, occupied: List<Point>): Point {
    var food: Point
    do {
        food = Point(Random.nextInt(boardSize), Random.nextInt(boardSize))
    } while (occupied.contains(food))
    return food
}

fun lerp(start: Color, end: Color, fraction: Float): Color {
    return Color(
        red = start.red + (end.red - start.red) * fraction,
        green = start.green + (end.green - start.green) * fraction,
        blue = start.blue + (end.blue - start.blue) * fraction,
        alpha = 1f
    )
}

fun DrawScope.drawRoundedRect(
    color: Color,
    topLeft: Offset,
    size: Size,
    cornerRadius: Float
) {
    drawRoundRect(
        color = color,
        topLeft = topLeft,
        size = size,
        cornerRadius = androidx.compose.ui.geometry.CornerRadius(cornerRadius, cornerRadius)
    )
}

fun DrawScope.drawSnakeEyes(
    cellSize: Float,
    head: Point,
    direction: Direction
) {
    val centerX = head.x * cellSize + cellSize / 2
    val centerY = head.y * cellSize + cellSize / 2
    val eyeOffset = cellSize * 0.2f
    val eyeRadius = cellSize * 0.08f
    val pupilRadius = cellSize * 0.04f

    val (eye1, eye2) = when (direction) {
        Direction.UP -> Pair(
            Offset(centerX - eyeOffset, centerY - eyeOffset),
            Offset(centerX + eyeOffset, centerY - eyeOffset)
        )
        Direction.DOWN -> Pair(
            Offset(centerX - eyeOffset, centerY + eyeOffset),
            Offset(centerX + eyeOffset, centerY + eyeOffset)
        )
        Direction.LEFT -> Pair(
            Offset(centerX - eyeOffset, centerY - eyeOffset),
            Offset(centerX - eyeOffset, centerY + eyeOffset)
        )
        Direction.RIGHT -> Pair(
            Offset(centerX + eyeOffset, centerY - eyeOffset),
            Offset(centerX + eyeOffset, centerY + eyeOffset)
        )
    }

    // White of eyes
    drawCircle(color = Color.White, radius = eyeRadius, center = eye1)
    drawCircle(color = Color.White, radius = eyeRadius, center = eye2)
    // Pupils
    drawCircle(color = Color.Black, radius = pupilRadius, center = eye1)
    drawCircle(color = Color.Black, radius = pupilRadius, center = eye2)
}
