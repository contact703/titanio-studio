using UnityEngine;
using UnityEngine.UI;
using TMPro;
using SlimeSurge.Core;

namespace SlimeSurge.UI
{
    public class UIManager : MonoBehaviour
    {
        [Header("Panels")]
        public GameObject MenuPanel;
        public GameObject GameplayPanel;
        public GameObject PausePanel;
        public GameObject GameOverPanel;
        public GameObject WinPanel;
        
        [Header("Gameplay UI")]
        public TextMeshProUGUI LevelText;
        public TextMeshProUGUI CoinText;
        public Slider SizeBar;
        public TextMeshProUGUI SizeText;
        
        [Header("Win Panel")]
        public TextMeshProUGUI WinCoinsText;
        public TextMeshProUGUI WinSizeText;
        public GameObject[] Stars;
        
        [Header("Animation")]
        public float AnimationDuration = 0.3f;
        
        private void Start()
        {
            // Subscribe to events
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnGameStateChanged += OnGameStateChanged;
                GameManager.Instance.OnCoinCollected += OnCoinCollected;
            }
            
            UpdateCoinDisplay();
            UpdateLevelDisplay();
        }
        
        private void OnDestroy()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnGameStateChanged -= OnGameStateChanged;
                GameManager.Instance.OnCoinCollected -= OnCoinCollected;
            }
        }
        
        private void OnGameStateChanged(GameState newState)
        {
            HideAllPanels();
            
            switch (newState)
            {
                case GameState.Menu:
                    ShowPanel(MenuPanel);
                    break;
                case GameState.Playing:
                    ShowPanel(GameplayPanel);
                    break;
                case GameState.Paused:
                    ShowPanel(PausePanel);
                    break;
                case GameState.GameOver:
                    ShowPanel(GameOverPanel);
                    break;
                case GameState.Win:
                    ShowPanel(WinPanel);
                    break;
            }
        }
        
        private void HideAllPanels()
        {
            if (MenuPanel != null) MenuPanel.SetActive(false);
            if (GameplayPanel != null) GameplayPanel.SetActive(false);
            if (PausePanel != null) PausePanel.SetActive(false);
            if (GameOverPanel != null) GameOverPanel.SetActive(false);
            if (WinPanel != null) WinPanel.SetActive(false);
        }
        
        private void ShowPanel(GameObject panel)
        {
            if (panel != null)
            {
                panel.SetActive(true);
                // Could add animation here
            }
        }
        
        private void OnCoinCollected(int amount)
        {
            UpdateCoinDisplay();
            // Animate coin UI
            if (CoinText != null)
            {
                StartCoroutine(PunchScale(CoinText.transform));
            }
        }
        
        public void UpdateCoinDisplay()
        {
            if (CoinText != null && GameManager.Instance != null)
            {
                CoinText.text = GameManager.Instance.TotalCoins.ToString("N0");
            }
        }
        
        public void UpdateLevelDisplay()
        {
            if (LevelText != null && GameManager.Instance != null)
            {
                LevelText.text = "Level " + GameManager.Instance.CurrentLevel;
            }
        }
        
        public void UpdateSizeBar(float size, float maxSize)
        {
            if (SizeBar != null)
            {
                SizeBar.value = size / maxSize;
            }
            
            if (SizeText != null)
            {
                SizeText.text = size.ToString("F1") + "x";
            }
        }
        
        public void ShowGameOver()
        {
            // Animate game over
        }
        
        public void ShowWin()
        {
            if (WinCoinsText != null && GameManager.Instance != null)
            {
                WinCoinsText.text = "+" + 100; // Level completion coins
            }
            
            // Show stars based on performance
            // Could be based on size, time, etc.
        }
        
        // Button callbacks
        public void OnPlayButton()
        {
            GameManager.Instance?.StartGame();
        }
        
        public void OnPauseButton()
        {
            GameManager.Instance?.PauseGame();
        }
        
        public void OnResumeButton()
        {
            GameManager.Instance?.ResumeGame();
        }
        
        public void OnRestartButton()
        {
            GameManager.Instance?.RestartLevel();
        }
        
        public void OnNextLevelButton()
        {
            GameManager.Instance?.NextLevel();
        }
        
        public void OnMenuButton()
        {
            Time.timeScale = 1f;
            UnityEngine.SceneManagement.SceneManager.LoadScene(0);
        }
        
        private System.Collections.IEnumerator PunchScale(Transform target)
        {
            Vector3 originalScale = target.localScale;
            Vector3 punchScale = originalScale * 1.2f;
            
            float elapsed = 0f;
            float duration = 0.15f;
            
            // Scale up
            while (elapsed < duration)
            {
                elapsed += Time.unscaledDeltaTime;
                float t = elapsed / duration;
                target.localScale = Vector3.Lerp(originalScale, punchScale, t);
                yield return null;
            }
            
            // Scale down
            elapsed = 0f;
            while (elapsed < duration)
            {
                elapsed += Time.unscaledDeltaTime;
                float t = elapsed / duration;
                target.localScale = Vector3.Lerp(punchScale, originalScale, t);
                yield return null;
            }
            
            target.localScale = originalScale;
        }
    }
}
