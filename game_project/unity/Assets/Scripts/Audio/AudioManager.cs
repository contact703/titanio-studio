using UnityEngine;

namespace SlimeSurge.Audio
{
    public class AudioManager : MonoBehaviour
    {
        public static AudioManager Instance { get; private set; }
        
        [Header("Audio Sources")]
        public AudioSource MusicSource;
        public AudioSource SFXSource;
        
        [Header("Music")]
        public AudioClip MenuMusic;
        public AudioClip GameplayMusic;
        public AudioClip WinMusic;
        
        [Header("SFX")]
        public AudioClip ButtonClick;
        public AudioClip Collect;
        public AudioClip Absorb;
        public AudioClip Damage;
        public AudioClip Gate;
        public AudioClip Win;
        public AudioClip Lose;
        
        [Header("Settings")]
        [Range(0, 1)] public float MusicVolume = 0.7f;
        [Range(0, 1)] public float SFXVolume = 1f;
        public bool IsMusicMuted = false;
        public bool IsSFXMuted = false;
        
        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
                LoadSettings();
            }
            else
            {
                Destroy(gameObject);
            }
        }
        
        private void Start()
        {
            ApplySettings();
        }
        
        public void PlayMusic(AudioClip clip)
        {
            if (MusicSource == null || clip == null) return;
            
            MusicSource.clip = clip;
            MusicSource.loop = true;
            MusicSource.Play();
        }
        
        public void PlayMenuMusic() => PlayMusic(MenuMusic);
        public void PlayGameplayMusic() => PlayMusic(GameplayMusic);
        public void PlayWinMusic() => PlayMusic(WinMusic);
        
        public void StopMusic()
        {
            if (MusicSource != null)
            {
                MusicSource.Stop();
            }
        }
        
        public void PlaySFX(AudioClip clip)
        {
            if (SFXSource == null || clip == null || IsSFXMuted) return;
            SFXSource.PlayOneShot(clip, SFXVolume);
        }
        
        public void PlayButtonClick() => PlaySFX(ButtonClick);
        public void PlayCollect() => PlaySFX(Collect);
        public void PlayAbsorb() => PlaySFX(Absorb);
        public void PlayDamage() => PlaySFX(Damage);
        public void PlayGate() => PlaySFX(Gate);
        public void PlayWin() => PlaySFX(Win);
        public void PlayLose() => PlaySFX(Lose);
        
        public void SetMusicVolume(float volume)
        {
            MusicVolume = Mathf.Clamp01(volume);
            ApplySettings();
            SaveSettings();
        }
        
        public void SetSFXVolume(float volume)
        {
            SFXVolume = Mathf.Clamp01(volume);
            ApplySettings();
            SaveSettings();
        }
        
        public void ToggleMusic()
        {
            IsMusicMuted = !IsMusicMuted;
            ApplySettings();
            SaveSettings();
        }
        
        public void ToggleSFX()
        {
            IsSFXMuted = !IsSFXMuted;
            SaveSettings();
        }
        
        private void ApplySettings()
        {
            if (MusicSource != null)
            {
                MusicSource.volume = IsMusicMuted ? 0 : MusicVolume;
            }
            
            if (SFXSource != null)
            {
                SFXSource.volume = IsSFXMuted ? 0 : SFXVolume;
            }
        }
        
        private void SaveSettings()
        {
            PlayerPrefs.SetFloat("MusicVolume", MusicVolume);
            PlayerPrefs.SetFloat("SFXVolume", SFXVolume);
            PlayerPrefs.SetInt("MusicMuted", IsMusicMuted ? 1 : 0);
            PlayerPrefs.SetInt("SFXMuted", IsSFXMuted ? 1 : 0);
            PlayerPrefs.Save();
        }
        
        private void LoadSettings()
        {
            MusicVolume = PlayerPrefs.GetFloat("MusicVolume", 0.7f);
            SFXVolume = PlayerPrefs.GetFloat("SFXVolume", 1f);
            IsMusicMuted = PlayerPrefs.GetInt("MusicMuted", 0) == 1;
            IsSFXMuted = PlayerPrefs.GetInt("SFXMuted", 0) == 1;
        }
    }
}
