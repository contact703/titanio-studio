using UnityEngine;
using UnityEngine.SceneManagement;

namespace SlimeSurge.Core
{
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }
        
        [Header("Game State")]
        public GameState CurrentState = GameState.Menu;
        public int CurrentLevel = 1;
        public int TotalCoins = 0;
        
        [Header("References")]
        public PlayerController Player;
        public UIManager UI;
        
        // Events
        public delegate void GameStateChanged(GameState newState);
        public event GameStateChanged OnGameStateChanged;
        
        public delegate void CoinCollected(int amount);
        public event CoinCollected OnCoinCollected;
        
        private void Awake()
        {
            // Singleton
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
                LoadProgress();
            }
            else
            {
                Destroy(gameObject);
            }
        }
        
        private void Start()
        {
            SetState(GameState.Menu);
        }
        
        public void SetState(GameState newState)
        {
            CurrentState = newState;
            OnGameStateChanged?.Invoke(newState);
            
            switch (newState)
            {
                case GameState.Menu:
                    Time.timeScale = 1f;
                    break;
                case GameState.Playing:
                    Time.timeScale = 1f;
                    break;
                case GameState.Paused:
                    Time.timeScale = 0f;
                    break;
                case GameState.GameOver:
                    Time.timeScale = 0f;
                    break;
                case GameState.Win:
                    Time.timeScale = 1f;
                    break;
            }
        }
        
        public void StartGame()
        {
            SetState(GameState.Playing);
            if (Player != null)
            {
                Player.StartRunning();
            }
        }
        
        public void PauseGame()
        {
            if (CurrentState == GameState.Playing)
            {
                SetState(GameState.Paused);
            }
        }
        
        public void ResumeGame()
        {
            if (CurrentState == GameState.Paused)
            {
                SetState(GameState.Playing);
            }
        }
        
        public void GameOver()
        {
            SetState(GameState.GameOver);
            UI?.ShowGameOver();
        }
        
        public void Win()
        {
            SetState(GameState.Win);
            CurrentLevel++;
            SaveProgress();
            UI?.ShowWin();
        }
        
        public void RestartLevel()
        {
            Time.timeScale = 1f;
            SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
        }
        
        public void NextLevel()
        {
            Time.timeScale = 1f;
            // For now, just restart - in full game, load next level
            SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
        }
        
        public void AddCoins(int amount)
        {
            TotalCoins += amount;
            OnCoinCollected?.Invoke(amount);
            SaveProgress();
        }
        
        public void LoadProgress()
        {
            CurrentLevel = PlayerPrefs.GetInt("CurrentLevel", 1);
            TotalCoins = PlayerPrefs.GetInt("TotalCoins", 0);
        }
        
        public void SaveProgress()
        {
            PlayerPrefs.SetInt("CurrentLevel", CurrentLevel);
            PlayerPrefs.SetInt("TotalCoins", TotalCoins);
            PlayerPrefs.Save();
        }
    }
    
    public enum GameState
    {
        Menu,
        Playing,
        Paused,
        GameOver,
        Win
    }
}
