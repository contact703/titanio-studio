using UnityEngine;
using System.Collections;

/// <summary>
/// POLISHED UI - Complete game UI using IMGUI with animations
/// Based on research: Oversimplified UI, clear feedback, minimal tutorial
/// </summary>
public class PolishedUI : MonoBehaviour
{
    [Header("References")]
    public SlimeController player;
    public InfiniteLevelGenerator levelGen;
    
    [Header("Colors")]
    public Color primaryColor = new Color(0.2f, 0.8f, 0.4f);
    public Color secondaryColor = new Color(0.9f, 0.7f, 0.2f);
    public Color dangerColor = new Color(0.9f, 0.2f, 0.2f);
    public Color textColor = Color.white;
    public Color shadowColor = new Color(0, 0, 0, 0.5f);
    
    [Header("Animation")]
    public float heartPulseSpeed = 2f;
    public float scorePopDuration = 0.3f;
    public float comboDisplayDuration = 1f;
    
    // State
    private bool isPaused = false;
    private bool isGameOver = false;
    private bool showTutorial = true;
    private float tutorialAlpha = 1f;
    private float gameOverProgress = 0f;
    private bool isNewRecord = false;
    
    // Score animation
    private int displayedScore = 0;
    private float scorePopScale = 1f;
    
    // Combo display
    private string comboText = "";
    private float comboAlpha = 0f;
    private Vector2 comboPosition;
    
    // Near miss display
    private float nearMissAlpha = 0f;
    private int nearMissCombo = 0;
    
    // Styles
    private GUIStyle titleStyle;
    private GUIStyle scoreStyle;
    private GUIStyle buttonStyle;
    private GUIStyle labelStyle;
    private GUIStyle shadowStyle;
    private GUIStyle comboStyle;
    private bool stylesInitialized = false;
    
    void Start()
    {
        if (player == null)
            player = FindObjectOfType<SlimeController>();
        if (levelGen == null)
            levelGen = FindObjectOfType<InfiniteLevelGenerator>();
        
        // Subscribe to events
        if (player != null)
        {
            player.OnScoreChanged += OnScoreChanged;
            player.OnLivesChanged += OnLivesChanged;
            player.OnNearMiss += OnNearMiss;
            player.OnDeath += OnDeath;
            player.OnCollect += OnCollect;
        }
        
        // Hide tutorial after first touch
        StartCoroutine(HideTutorialAfterDelay());
    }
    
    IEnumerator HideTutorialAfterDelay()
    {
        yield return new WaitForSeconds(3f);
        
        while (tutorialAlpha > 0)
        {
            tutorialAlpha -= Time.deltaTime;
            yield return null;
        }
        showTutorial = false;
    }
    
    void OnScoreChanged(int newScore)
    {
        StartCoroutine(AnimateScore(newScore));
    }
    
    IEnumerator AnimateScore(int targetScore)
    {
        // Pop effect
        scorePopScale = 1.2f;
        
        float t = 0;
        int startScore = displayedScore;
        
        while (t < scorePopDuration)
        {
            t += Time.deltaTime;
            float progress = t / scorePopDuration;
            
            displayedScore = Mathf.RoundToInt(Mathf.Lerp(startScore, targetScore, progress));
            scorePopScale = Mathf.Lerp(1.2f, 1f, progress);
            
            yield return null;
        }
        
        displayedScore = targetScore;
        scorePopScale = 1f;
    }
    
    void OnLivesChanged(int lives)
    {
        // Heart shake handled in OnGUI
    }
    
    void OnNearMiss(int combo, Vector3 position)
    {
        nearMissCombo = combo;
        nearMissAlpha = 1f;
        
        // Convert world position to screen
        Vector3 screenPos = Camera.main.WorldToScreenPoint(position);
        comboPosition = new Vector2(screenPos.x, Screen.height - screenPos.y);
        
        if (combo >= 2)
        {
            comboText = combo + "x NEAR MISS!";
        }
        else
        {
            comboText = "CLOSE!";
        }
        comboAlpha = 1f;
    }
    
    void OnCollect(float value)
    {
        // Small score pop handled by score animation
    }
    
    void OnDeath()
    {
        isGameOver = true;
        isNewRecord = player.Score > PlayerPrefs.GetInt("HighScore", 0);
        StartCoroutine(AnimateGameOver());
    }
    
    IEnumerator AnimateGameOver()
    {
        gameOverProgress = 0f;
        
        while (gameOverProgress < 1f)
        {
            gameOverProgress += Time.unscaledDeltaTime * 2f;
            yield return null;
        }
        gameOverProgress = 1f;
    }
    
    void Update()
    {
        // Pause toggle
        if (Input.GetKeyDown(KeyCode.Escape) || Input.GetKeyDown(KeyCode.P))
        {
            TogglePause();
        }
        
        // Fade effects
        if (nearMissAlpha > 0)
            nearMissAlpha -= Time.deltaTime * 2f;
        if (comboAlpha > 0)
            comboAlpha -= Time.deltaTime / comboDisplayDuration;
    }
    
    void TogglePause()
    {
        if (isGameOver) return;
        
        isPaused = !isPaused;
        Time.timeScale = isPaused ? 0f : 1f;
    }
    
    void InitStyles()
    {
        if (stylesInitialized) return;
        
        // Title style
        titleStyle = new GUIStyle(GUI.skin.label);
        titleStyle.fontSize = Mathf.RoundToInt(Screen.height * 0.08f);
        titleStyle.fontStyle = FontStyle.Bold;
        titleStyle.alignment = TextAnchor.MiddleCenter;
        titleStyle.normal.textColor = textColor;
        
        // Score style
        scoreStyle = new GUIStyle(GUI.skin.label);
        scoreStyle.fontSize = Mathf.RoundToInt(Screen.height * 0.05f);
        scoreStyle.fontStyle = FontStyle.Bold;
        scoreStyle.alignment = TextAnchor.MiddleLeft;
        scoreStyle.normal.textColor = textColor;
        
        // Button style
        buttonStyle = new GUIStyle(GUI.skin.button);
        buttonStyle.fontSize = Mathf.RoundToInt(Screen.height * 0.04f);
        buttonStyle.fontStyle = FontStyle.Bold;
        buttonStyle.normal.textColor = textColor;
        buttonStyle.hover.textColor = secondaryColor;
        buttonStyle.padding = new RectOffset(30, 30, 15, 15);
        
        // Label style
        labelStyle = new GUIStyle(GUI.skin.label);
        labelStyle.fontSize = Mathf.RoundToInt(Screen.height * 0.03f);
        labelStyle.alignment = TextAnchor.MiddleCenter;
        labelStyle.normal.textColor = textColor;
        
        // Shadow style
        shadowStyle = new GUIStyle(titleStyle);
        shadowStyle.normal.textColor = shadowColor;
        
        // Combo style
        comboStyle = new GUIStyle(GUI.skin.label);
        comboStyle.fontSize = Mathf.RoundToInt(Screen.height * 0.05f);
        comboStyle.fontStyle = FontStyle.Bold;
        comboStyle.alignment = TextAnchor.MiddleCenter;
        comboStyle.normal.textColor = primaryColor;
        
        stylesInitialized = true;
    }
    
    void OnGUI()
    {
        InitStyles();
        
        if (isGameOver)
        {
            DrawGameOver();
        }
        else if (isPaused)
        {
            DrawPause();
        }
        else
        {
            DrawHUD();
            if (showTutorial)
                DrawTutorial();
            DrawCombo();
        }
    }
    
    void DrawHUD()
    {
        float padding = Screen.height * 0.02f;
        float heartSize = Screen.height * 0.06f;
        
        // === TOP LEFT: Lives (Hearts) ===
        int lives = player != null ? player.Lives : 3;
        for (int i = 0; i < 3; i++)
        {
            float x = padding + i * (heartSize + 5);
            float y = padding;
            
            // Pulse animation for active hearts
            float scale = 1f;
            if (i < lives)
            {
                scale = 1f + Mathf.Sin(Time.time * heartPulseSpeed + i * 0.5f) * 0.1f;
            }
            
            Rect heartRect = new Rect(
                x + heartSize * (1 - scale) / 2,
                y + heartSize * (1 - scale) / 2,
                heartSize * scale,
                heartSize * scale
            );
            
            // Draw heart (using text emoji or colored box)
            GUIStyle heartStyle = new GUIStyle(GUI.skin.label);
            heartStyle.fontSize = Mathf.RoundToInt(heartSize * scale);
            heartStyle.normal.textColor = i < lives ? dangerColor : new Color(0.3f, 0.3f, 0.3f);
            
            GUI.Label(heartRect, "♥", heartStyle);
        }
        
        // === TOP CENTER: Score ===
        scoreStyle.fontSize = Mathf.RoundToInt(Screen.height * 0.05f * scorePopScale);
        
        string scoreText = displayedScore.ToString();
        Vector2 scoreSize = scoreStyle.CalcSize(new GUIContent(scoreText));
        Rect scoreRect = new Rect(
            (Screen.width - scoreSize.x) / 2,
            padding,
            scoreSize.x,
            scoreSize.y
        );
        
        // Shadow
        GUI.color = shadowColor;
        GUI.Label(new Rect(scoreRect.x + 2, scoreRect.y + 2, scoreRect.width, scoreRect.height), scoreText, scoreStyle);
        GUI.color = Color.white;
        
        // Score
        GUI.Label(scoreRect, scoreText, scoreStyle);
        
        // === TOP RIGHT: Coins ===
        if (player != null && player.Coins > 0)
        {
            GUIStyle coinStyle = new GUIStyle(scoreStyle);
            coinStyle.fontSize = Mathf.RoundToInt(Screen.height * 0.035f);
            coinStyle.alignment = TextAnchor.MiddleRight;
            coinStyle.normal.textColor = secondaryColor;
            
            string coinText = "🪙 " + player.Coins;
            Rect coinRect = new Rect(
                Screen.width - 150 - padding,
                padding,
                150,
                heartSize
            );
            GUI.Label(coinRect, coinText, coinStyle);
        }
        
        // === BOTTOM: Stage indicator ===
        if (levelGen != null)
        {
            GUIStyle stageStyle = new GUIStyle(labelStyle);
            stageStyle.alignment = TextAnchor.MiddleCenter;
            stageStyle.normal.textColor = new Color(1, 1, 1, 0.5f);
            
            Rect stageRect = new Rect(
                0,
                Screen.height - padding - 30,
                Screen.width,
                30
            );
            GUI.Label(stageRect, "STAGE " + levelGen.CurrentStage, stageStyle);
        }
        
        // === Near Miss Flash ===
        if (nearMissAlpha > 0)
        {
            Color flashColor = primaryColor;
            flashColor.a = nearMissAlpha * 0.3f;
            GUI.color = flashColor;
            GUI.DrawTexture(new Rect(0, 0, Screen.width, Screen.height * 0.1f), Texture2D.whiteTexture);
            GUI.DrawTexture(new Rect(0, Screen.height * 0.9f, Screen.width, Screen.height * 0.1f), Texture2D.whiteTexture);
            GUI.color = Color.white;
        }
    }
    
    void DrawTutorial()
    {
        Color tutColor = textColor;
        tutColor.a = tutorialAlpha;
        
        GUIStyle tutStyle = new GUIStyle(labelStyle);
        tutStyle.fontSize = Mathf.RoundToInt(Screen.height * 0.04f);
        tutStyle.normal.textColor = tutColor;
        
        Rect tutRect = new Rect(
            0,
            Screen.height * 0.7f,
            Screen.width,
            Screen.height * 0.1f
        );
        
        string tutText = "← SWIPE TO MOVE →";
        #if UNITY_STANDALONE || UNITY_EDITOR
        tutText = "← A/D or ARROW KEYS →";
        #endif
        
        GUI.Label(tutRect, tutText, tutStyle);
    }
    
    void DrawCombo()
    {
        if (comboAlpha <= 0) return;
        
        Color c = primaryColor;
        c.a = comboAlpha;
        comboStyle.normal.textColor = c;
        
        float scale = 1f + (1f - comboAlpha) * 0.5f;
        comboStyle.fontSize = Mathf.RoundToInt(Screen.height * 0.05f * scale);
        
        Vector2 size = comboStyle.CalcSize(new GUIContent(comboText));
        Rect comboRect = new Rect(
            comboPosition.x - size.x / 2,
            comboPosition.y - size.y / 2 - (1f - comboAlpha) * 50f,
            size.x,
            size.y
        );
        
        GUI.Label(comboRect, comboText, comboStyle);
    }
    
    void DrawPause()
    {
        // Darken background
        GUI.color = new Color(0, 0, 0, 0.7f);
        GUI.DrawTexture(new Rect(0, 0, Screen.width, Screen.height), Texture2D.whiteTexture);
        GUI.color = Color.white;
        
        float centerY = Screen.height / 2;
        float buttonWidth = Screen.width * 0.4f;
        float buttonHeight = Screen.height * 0.08f;
        
        // Title
        Rect titleRect = new Rect(0, centerY - 150, Screen.width, 80);
        GUI.Label(titleRect, "PAUSED", titleStyle);
        
        // Resume button
        Rect resumeRect = new Rect(
            (Screen.width - buttonWidth) / 2,
            centerY,
            buttonWidth,
            buttonHeight
        );
        if (GUI.Button(resumeRect, "▶ RESUME", buttonStyle))
        {
            TogglePause();
        }
        
        // Quit button
        Rect quitRect = new Rect(
            (Screen.width - buttonWidth) / 2,
            centerY + buttonHeight + 20,
            buttonWidth,
            buttonHeight
        );
        if (GUI.Button(quitRect, "✕ QUIT", buttonStyle))
        {
            Time.timeScale = 1f;
            UnityEngine.SceneManagement.SceneManager.LoadScene(
                UnityEngine.SceneManagement.SceneManager.GetActiveScene().name
            );
        }
    }
    
    void DrawGameOver()
    {
        // Animated dark overlay
        float overlayAlpha = Mathf.Lerp(0, 0.85f, gameOverProgress);
        GUI.color = new Color(0, 0, 0, overlayAlpha);
        GUI.DrawTexture(new Rect(0, 0, Screen.width, Screen.height), Texture2D.whiteTexture);
        GUI.color = Color.white;
        
        if (gameOverProgress < 0.3f) return;
        
        float contentAlpha = (gameOverProgress - 0.3f) / 0.7f;
        float slideIn = Mathf.Lerp(-100, 0, EaseOutBack(contentAlpha));
        
        float centerY = Screen.height / 2;
        float buttonWidth = Screen.width * 0.5f;
        float buttonHeight = Screen.height * 0.08f;
        
        // Game Over title
        titleStyle.normal.textColor = new Color(1, 1, 1, contentAlpha);
        Rect titleRect = new Rect(0, centerY - 180 + slideIn, Screen.width, 100);
        
        // Shadow
        shadowStyle.normal.textColor = new Color(0, 0, 0, contentAlpha * 0.5f);
        GUI.Label(new Rect(3, titleRect.y + 3, Screen.width, 100), "GAME OVER", shadowStyle);
        GUI.Label(titleRect, "GAME OVER", titleStyle);
        
        // Score
        scoreStyle.alignment = TextAnchor.MiddleCenter;
        scoreStyle.normal.textColor = new Color(1, 1, 1, contentAlpha);
        scoreStyle.fontSize = Mathf.RoundToInt(Screen.height * 0.06f);
        
        Rect scoreRect = new Rect(0, centerY - 80 + slideIn, Screen.width, 60);
        GUI.Label(scoreRect, "SCORE: " + (player != null ? player.Score : 0), scoreStyle);
        
        // High Score
        labelStyle.normal.textColor = new Color(secondaryColor.r, secondaryColor.g, secondaryColor.b, contentAlpha);
        Rect highScoreRect = new Rect(0, centerY - 30 + slideIn, Screen.width, 40);
        int highScore = player != null ? player.HighScore : PlayerPrefs.GetInt("HighScore", 0);
        GUI.Label(highScoreRect, "BEST: " + highScore, labelStyle);
        
        // New Record
        if (isNewRecord)
        {
            float pulse = 1f + Mathf.Sin(Time.unscaledTime * 5f) * 0.1f;
            GUIStyle newRecordStyle = new GUIStyle(labelStyle);
            newRecordStyle.fontSize = Mathf.RoundToInt(Screen.height * 0.04f * pulse);
            newRecordStyle.normal.textColor = new Color(1, 0.8f, 0.2f, contentAlpha);
            newRecordStyle.fontStyle = FontStyle.Bold;
            
            Rect newRecordRect = new Rect(0, centerY + 10 + slideIn, Screen.width, 40);
            GUI.Label(newRecordRect, "★ NEW RECORD! ★", newRecordStyle);
        }
        
        // Buttons (only after animation completes)
        if (gameOverProgress >= 1f)
        {
            buttonStyle.normal.textColor = textColor;
            
            // Retry button
            Rect retryRect = new Rect(
                (Screen.width - buttonWidth) / 2,
                centerY + 80,
                buttonWidth,
                buttonHeight
            );
            
            // Pulse effect
            float pulse = 1f + Mathf.Sin(Time.unscaledTime * 3f) * 0.03f;
            retryRect.x -= (buttonWidth * pulse - buttonWidth) / 2;
            retryRect.width *= pulse;
            
            if (GUI.Button(retryRect, "↻ PLAY AGAIN", buttonStyle))
            {
                Time.timeScale = 1f;
                UnityEngine.SceneManagement.SceneManager.LoadScene(
                    UnityEngine.SceneManagement.SceneManager.GetActiveScene().name
                );
            }
        }
    }
    
    float EaseOutBack(float t)
    {
        float c1 = 1.70158f;
        float c3 = c1 + 1f;
        return 1f + c3 * Mathf.Pow(t - 1f, 3f) + c1 * Mathf.Pow(t - 1f, 2f);
    }
    
    void OnDestroy()
    {
        if (player != null)
        {
            player.OnScoreChanged -= OnScoreChanged;
            player.OnLivesChanged -= OnLivesChanged;
            player.OnNearMiss -= OnNearMiss;
            player.OnDeath -= OnDeath;
            player.OnCollect -= OnCollect;
        }
    }
}
