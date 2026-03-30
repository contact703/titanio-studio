using UnityEngine;
using System.Collections;

/// <summary>
/// Complete IMGUI-based UI System
/// Uses OnGUI for guaranteed compatibility
/// Features:
/// - Hearts display
/// - Score, coins, high score
/// - Game Over screen with animated buttons
/// - Pause menu
/// - Touch-friendly tap areas
/// </summary>
public class SimpleUI : MonoBehaviour
{
    public static SimpleUI Instance { get; private set; }
    
    [Header("Settings")]
    public int BaseFontSize = 40;
    public Color TextColor = Color.white;
    public Color ShadowColor = new Color(0, 0, 0, 0.7f);
    public Color ButtonColor = new Color(0.2f, 0.7f, 0.3f);
    public Color ButtonHoverColor = new Color(0.3f, 0.8f, 0.4f);
    public Color DangerButtonColor = new Color(0.8f, 0.3f, 0.3f);
    
    private GUIStyle labelStyle;
    private GUIStyle shadowStyle;
    private GUIStyle bigLabelStyle;
    private GUIStyle buttonStyle;
    private GUIStyle dangerButtonStyle;
    private GUIStyle smallStyle;
    
    private bool stylesInitialized = false;
    private bool isPaused = false;
    private float buttonPulse = 0f;
    
    // Animation state
    private float gameOverAnimProgress = 0f;
    private bool isAnimatingGameOver = false;
    
    private void Awake()
    {
        Instance = this;
    }
    
    private void Update()
    {
        // Animate button pulse
        buttonPulse = Mathf.Sin(Time.unscaledTime * 3f) * 0.05f;
        
        // Animate game over screen
        if (GameManager.Instance != null && GameManager.Instance.IsGameOver && !isAnimatingGameOver)
        {
            StartCoroutine(AnimateGameOver());
        }
        
        // Handle pause with Escape or back button
        if (Input.GetKeyDown(KeyCode.Escape))
        {
            if (GameManager.Instance != null && GameManager.Instance.IsPlaying && !GameManager.Instance.IsGameOver)
            {
                TogglePause();
            }
        }
    }
    
    private IEnumerator AnimateGameOver()
    {
        isAnimatingGameOver = true;
        gameOverAnimProgress = 0f;
        
        // Wait a moment before showing
        yield return new WaitForSecondsRealtime(0.5f);
        
        float duration = 0.5f;
        float elapsed = 0f;
        
        while (elapsed < duration)
        {
            elapsed += Time.unscaledDeltaTime;
            gameOverAnimProgress = Mathf.SmoothStep(0, 1, elapsed / duration);
            yield return null;
        }
        
        gameOverAnimProgress = 1f;
    }
    
    private void TogglePause()
    {
        isPaused = !isPaused;
        Time.timeScale = isPaused ? 0f : 1f;
    }
    
    private void InitStyles()
    {
        if (stylesInitialized) return;
        
        // Scale font based on screen
        int fontSize = Mathf.RoundToInt(BaseFontSize * (Screen.height / 1920f));
        fontSize = Mathf.Clamp(fontSize, 20, 80);
        
        labelStyle = new GUIStyle();
        labelStyle.fontSize = fontSize;
        labelStyle.fontStyle = FontStyle.Bold;
        labelStyle.normal.textColor = TextColor;
        labelStyle.alignment = TextAnchor.UpperLeft;
        
        shadowStyle = new GUIStyle(labelStyle);
        shadowStyle.normal.textColor = ShadowColor;
        
        bigLabelStyle = new GUIStyle(labelStyle);
        bigLabelStyle.fontSize = (int)(fontSize * 1.8f);
        bigLabelStyle.alignment = TextAnchor.MiddleCenter;
        
        smallStyle = new GUIStyle(labelStyle);
        smallStyle.fontSize = (int)(fontSize * 0.7f);
        smallStyle.alignment = TextAnchor.MiddleCenter;
        smallStyle.normal.textColor = new Color(1, 1, 1, 0.6f);
        
        buttonStyle = new GUIStyle();
        buttonStyle.fontSize = fontSize;
        buttonStyle.fontStyle = FontStyle.Bold;
        buttonStyle.normal.textColor = Color.white;
        buttonStyle.normal.background = MakeTexture(2, 2, ButtonColor);
        buttonStyle.hover.background = MakeTexture(2, 2, ButtonHoverColor);
        buttonStyle.active.background = MakeTexture(2, 2, new Color(0.15f, 0.5f, 0.2f));
        buttonStyle.alignment = TextAnchor.MiddleCenter;
        buttonStyle.padding = new RectOffset(30, 30, 20, 20);
        buttonStyle.border = new RectOffset(4, 4, 4, 4);
        
        dangerButtonStyle = new GUIStyle(buttonStyle);
        dangerButtonStyle.normal.background = MakeTexture(2, 2, DangerButtonColor);
        dangerButtonStyle.hover.background = MakeTexture(2, 2, new Color(0.9f, 0.4f, 0.4f));
        dangerButtonStyle.active.background = MakeTexture(2, 2, new Color(0.6f, 0.2f, 0.2f));
        
        stylesInitialized = true;
    }
    
    private Texture2D MakeTexture(int width, int height, Color col)
    {
        Color[] pix = new Color[width * height];
        for (int i = 0; i < pix.Length; ++i)
        {
            pix[i] = col;
        }
        Texture2D result = new Texture2D(width, height);
        result.SetPixels(pix);
        result.Apply();
        return result;
    }
    
    private void OnGUI()
    {
        InitStyles();
        
        var gm = GameManager.Instance;
        if (gm == null) return;
        
        // Scale padding based on screen size
        float pad = Screen.height * 0.02f;
        float heartSize = Screen.height * 0.04f;
        
        // ========== HUD (always visible during play) ==========
        if (gm.IsPlaying || gm.IsGameOver)
        {
            DrawHUD(gm, pad, heartSize);
        }
        
        // ========== PAUSE SCREEN ==========
        if (isPaused && !gm.IsGameOver)
        {
            DrawPauseScreen();
        }
        
        // ========== GAME OVER SCREEN ==========
        if (gm.IsGameOver && gameOverAnimProgress > 0)
        {
            DrawGameOverScreen(gm);
        }
        
        // ========== INSTRUCTIONS (first 30m) ==========
        if (gm.IsPlaying && !gm.IsGameOver && !isPaused && gm.Score < 30)
        {
            DrawInstructions();
        }
    }
    
    private void DrawHUD(GameManager gm, float pad, float heartSize)
    {
        // Hearts (top left)
        for (int i = 0; i < gm.MaxLives; i++)
        {
            float x = pad + i * (heartSize + pad * 0.5f);
            float y = pad;
            
            string heart = i < gm.CurrentLives ? "❤️" : "🖤";
            DrawTextWithShadow(new Rect(x, y, heartSize * 1.5f, heartSize * 1.5f), heart, labelStyle);
        }
        
        // Score (top center)
        string scoreText = $"🏃 {gm.Score}m";
        float scoreWidth = Screen.width * 0.3f;
        GUIStyle centerStyle = new GUIStyle(labelStyle);
        centerStyle.alignment = TextAnchor.UpperCenter;
        DrawTextWithShadow(
            new Rect(Screen.width / 2 - scoreWidth / 2, pad, scoreWidth, heartSize * 1.5f),
            scoreText, centerStyle
        );
        
        // Coins (top right)
        string coinText = $"💰 {gm.Coins}";
        GUIStyle rightStyle = new GUIStyle(labelStyle);
        rightStyle.alignment = TextAnchor.UpperRight;
        DrawTextWithShadow(
            new Rect(Screen.width - pad - Screen.width * 0.2f, pad, Screen.width * 0.2f, heartSize * 1.5f),
            coinText, rightStyle
        );
        
        // High Score (below coins)
        string hsText = $"🏆 {gm.HighScore}m";
        GUIStyle hsStyle = new GUIStyle(smallStyle);
        hsStyle.alignment = TextAnchor.UpperRight;
        GUI.Label(
            new Rect(Screen.width - pad - Screen.width * 0.2f, pad + heartSize * 1.2f, Screen.width * 0.2f, heartSize),
            hsText, hsStyle
        );
        
        // Pause button (top right, below high score) - TAP AREA
        if (!gm.IsGameOver)
        {
            float btnSize = heartSize * 2f;
            Rect pauseRect = new Rect(Screen.width - pad - btnSize, pad + heartSize * 2.5f, btnSize, btnSize);
            
            if (GUI.Button(pauseRect, "⏸️", buttonStyle))
            {
                TogglePause();
            }
        }
    }
    
    private void DrawPauseScreen()
    {
        // Dark overlay
        GUI.color = new Color(0, 0, 0, 0.8f);
        GUI.DrawTexture(new Rect(0, 0, Screen.width, Screen.height), Texture2D.whiteTexture);
        GUI.color = Color.white;
        
        float centerY = Screen.height * 0.4f;
        float btnWidth = Screen.width * 0.5f;
        float btnHeight = Screen.height * 0.08f;
        
        // PAUSED title
        DrawTextWithShadow(
            new Rect(0, centerY - btnHeight * 2, Screen.width, btnHeight * 1.5f),
            "⏸️ PAUSED", bigLabelStyle
        );
        
        // Resume button (GREEN - positive)
        Rect resumeRect = new Rect(Screen.width / 2 - btnWidth / 2, centerY, btnWidth, btnHeight);
        if (GUI.Button(resumeRect, "▶️ RESUME", buttonStyle))
        {
            TogglePause();
        }
        
        // Restart button
        Rect restartRect = new Rect(Screen.width / 2 - btnWidth / 2, centerY + btnHeight * 1.3f, btnWidth, btnHeight);
        if (GUI.Button(restartRect, "🔄 RESTART", dangerButtonStyle))
        {
            isPaused = false;
            Time.timeScale = 1f;
            GameManager.Instance?.RestartGame();
        }
    }
    
    private void DrawGameOverScreen(GameManager gm)
    {
        // Animate alpha
        float alpha = gameOverAnimProgress;
        
        // Dark overlay with fade
        GUI.color = new Color(0, 0, 0, 0.85f * alpha);
        GUI.DrawTexture(new Rect(0, 0, Screen.width, Screen.height), Texture2D.whiteTexture);
        GUI.color = new Color(1, 1, 1, alpha);
        
        float centerY = Screen.height * 0.35f;
        float btnWidth = Screen.width * 0.6f;
        float btnHeight = Screen.height * 0.08f;
        
        // GAME OVER title with scale animation
        float titleScale = 1f + (1f - alpha) * 0.3f;
        GUIStyle animatedTitle = new GUIStyle(bigLabelStyle);
        animatedTitle.fontSize = (int)(bigLabelStyle.fontSize * titleScale);
        
        DrawTextWithShadow(
            new Rect(0, centerY - btnHeight * 3, Screen.width, btnHeight * 2f),
            "💀 GAME OVER 💀", animatedTitle
        );
        
        // Score
        GUIStyle scoreStyle = new GUIStyle(labelStyle);
        scoreStyle.alignment = TextAnchor.MiddleCenter;
        scoreStyle.fontSize = (int)(labelStyle.fontSize * 1.2f);
        
        DrawTextWithShadow(
            new Rect(0, centerY - btnHeight, Screen.width, btnHeight * 1.2f),
            $"Score: {gm.Score}m", scoreStyle
        );
        
        // New High Score or Best
        bool isNewRecord = gm.Score >= gm.HighScore && gm.Score > 0;
        GUIStyle recordStyle = new GUIStyle(labelStyle);
        recordStyle.alignment = TextAnchor.MiddleCenter;
        recordStyle.normal.textColor = isNewRecord ? Color.yellow : new Color(1, 1, 1, 0.7f);
        
        string recordText = isNewRecord ? "🎉 NEW HIGH SCORE! 🎉" : $"Best: {gm.HighScore}m";
        DrawTextWithShadow(
            new Rect(0, centerY + btnHeight * 0.3f, Screen.width, btnHeight),
            recordText, recordStyle
        );
        
        // Restart button with pulse animation
        float pulse = 1f + buttonPulse;
        float pulsedWidth = btnWidth * pulse;
        float pulsedHeight = btnHeight * pulse;
        
        Rect restartRect = new Rect(
            Screen.width / 2 - pulsedWidth / 2,
            centerY + btnHeight * 2f,
            pulsedWidth,
            pulsedHeight
        );
        
        if (GUI.Button(restartRect, "🔄 PLAY AGAIN", buttonStyle))
        {
            gm.RestartGame();
        }
        
        // Instructions
        GUI.Label(
            new Rect(0, centerY + btnHeight * 3.5f, Screen.width, btnHeight),
            "Tap button or press R to restart", smallStyle
        );
        
        GUI.color = Color.white;
    }
    
    private void DrawInstructions()
    {
        float y = Screen.height * 0.85f;
        
        GUI.Label(
            new Rect(0, y, Screen.width, Screen.height * 0.1f),
            "⬅️ Swipe or Arrow Keys ➡️", smallStyle
        );
    }
    
    private void DrawTextWithShadow(Rect rect, string text, GUIStyle style)
    {
        // Shadow offset based on font size
        float offset = style.fontSize * 0.05f;
        offset = Mathf.Max(offset, 2f);
        
        // Shadow
        Rect shadowRect = new Rect(rect.x + offset, rect.y + offset, rect.width, rect.height);
        GUIStyle shadow = new GUIStyle(style);
        shadow.normal.textColor = ShadowColor;
        GUI.Label(shadowRect, text, shadow);
        
        // Main text
        GUI.Label(rect, text, style);
    }
}
