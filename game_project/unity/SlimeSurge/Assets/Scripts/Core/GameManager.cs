using UnityEngine;
using UnityEngine.SceneManagement;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }
    
    [Header("Game Settings")]
    public int MaxLives = 3;
    public int CurrentLives = 3;
    public int Score = 0;
    public int HighScore = 0;
    public int Coins = 0;
    public float Distance = 0f;
    
    [Header("Game State")]
    public bool IsPlaying = false;
    public bool IsGameOver = false;
    public bool IsPaused = false;
    
    [Header("References")]
    public PlayerController Player;
    
    // Events
    public System.Action OnGameStart;
    public System.Action OnGameOver;
    public System.Action OnLiveLost;
    public System.Action<int> OnScoreChanged;
    public System.Action<int> OnCoinCollected;
    
    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
        }
        else
        {
            Destroy(gameObject);
            return;
        }
        
        LoadData();
    }
    
    private void Start()
    {
        // Auto-start for testing
        StartGame();
    }
    
    private void Update()
    {
        if (IsPlaying && Player != null)
        {
            Distance = Player.transform.position.z;
            Score = Mathf.RoundToInt(Distance);
        }
        
        // Restart with R key
        if (IsGameOver && Input.GetKeyDown(KeyCode.R))
        {
            RestartGame();
        }
    }
    
    public void StartGame()
    {
        IsPlaying = true;
        IsGameOver = false;
        CurrentLives = MaxLives;
        Score = 0;
        Distance = 0f;
        
        if (Player != null)
        {
            Player.StartRunning();
        }
        
        OnGameStart?.Invoke();
        Debug.Log("🎮 Game Started!");
    }
    
    public void LoseLife()
    {
        CurrentLives--;
        OnLiveLost?.Invoke();
        
        Debug.Log($"💔 Lives: {CurrentLives}");
        
        if (CurrentLives <= 0)
        {
            GameOver();
        }
    }
    
    public void GameOver()
    {
        IsPlaying = false;
        IsGameOver = true;
        
        if (Score > HighScore)
        {
            HighScore = Score;
            SaveData();
        }
        
        if (Player != null)
        {
            Player.Die();
        }
        
        OnGameOver?.Invoke();
        Debug.Log($"💀 GAME OVER! Score: {Score} | High Score: {HighScore}");
    }
    
    public void AddScore(int points)
    {
        Score += points;
        OnScoreChanged?.Invoke(Score);
    }
    
    public void AddCoin(int amount = 1)
    {
        Coins += amount;
        OnCoinCollected?.Invoke(Coins);
        SaveData();
    }
    
    public void RestartGame()
    {
        Time.timeScale = 1f;
        SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
    }
    
    public void PauseGame()
    {
        IsPaused = true;
        Time.timeScale = 0f;
    }
    
    public void ResumeGame()
    {
        IsPaused = false;
        Time.timeScale = 1f;
    }
    
    private void LoadData()
    {
        HighScore = PlayerPrefs.GetInt("HighScore", 0);
        Coins = PlayerPrefs.GetInt("Coins", 0);
    }
    
    private void SaveData()
    {
        PlayerPrefs.SetInt("HighScore", HighScore);
        PlayerPrefs.SetInt("Coins", Coins);
        PlayerPrefs.Save();
    }
}
