using UnityEngine;
using System.Collections;

/// <summary>
/// Game "Juice" Effects Manager
/// Based on "Juice it or lose it" principles:
/// - Screen shake
/// - Particles
/// - Time slow
/// - Flash effects
/// - Sound triggers
/// </summary>
public class EffectsManager : MonoBehaviour
{
    public static EffectsManager Instance { get; private set; }
    
    [Header("Screen Shake")]
    public float DefaultShakeDuration = 0.2f;
    public float DefaultShakeMagnitude = 0.3f;
    public AnimationCurve ShakeDecayCurve;
    
    [Header("Time Effects")]
    public float HitStopDuration = 0.05f;
    public float SlowMoDuration = 0.3f;
    public float SlowMoScale = 0.3f;
    
    [Header("Particle Prefabs")]
    public GameObject CollectParticlePrefab;
    public GameObject DamageParticlePrefab;
    public GameObject DeathParticlePrefab;
    public GameObject GrowParticlePrefab;
    public GameObject TrailParticlePrefab;
    
    [Header("Audio")]
    public AudioSource SFXSource;
    public AudioClip CollectSound;
    public AudioClip DamageSound;
    public AudioClip DeathSound;
    public AudioClip GrowSound;
    public AudioClip ButtonSound;
    public AudioClip WinSound;
    
    [Header("Settings")]
    public bool SoundEnabled = true;
    public bool VibrationEnabled = true;
    public bool ScreenShakeEnabled = true;
    
    private Camera mainCamera;
    private Vector3 originalCamPos;
    private bool isShaking = false;
    
    private void Awake()
    {
        Instance = this;
        mainCamera = Camera.main;
        
        if (ShakeDecayCurve == null || ShakeDecayCurve.length == 0)
        {
            ShakeDecayCurve = AnimationCurve.EaseInOut(0, 1, 1, 0);
        }
        
        if (SFXSource == null)
        {
            SFXSource = gameObject.AddComponent<AudioSource>();
        }
    }
    
    // === SCREEN SHAKE ===
    
    public void ShakeScreen(float duration = -1, float magnitude = -1)
    {
        if (!ScreenShakeEnabled) return;
        
        if (duration < 0) duration = DefaultShakeDuration;
        if (magnitude < 0) magnitude = DefaultShakeMagnitude;
        
        StartCoroutine(DoScreenShake(duration, magnitude));
    }
    
    private IEnumerator DoScreenShake(float duration, float magnitude)
    {
        if (mainCamera == null) yield break;
        if (isShaking) yield break;
        
        isShaking = true;
        float elapsed = 0f;
        
        var camFollow = mainCamera.GetComponent<CameraFollow>();
        Vector3 shakeOffset = Vector3.zero;
        
        while (elapsed < duration)
        {
            elapsed += Time.unscaledDeltaTime;
            float t = elapsed / duration;
            float currentMagnitude = magnitude * ShakeDecayCurve.Evaluate(t);
            
            shakeOffset = new Vector3(
                Random.Range(-1f, 1f) * currentMagnitude,
                Random.Range(-1f, 1f) * currentMagnitude,
                0
            );
            
            if (camFollow != null)
            {
                // Offset the camera follow
                camFollow.Offset += shakeOffset * Time.unscaledDeltaTime;
            }
            
            yield return null;
        }
        
        isShaking = false;
    }
    
    // === TIME EFFECTS ===
    
    public void HitStop()
    {
        StartCoroutine(DoHitStop());
    }
    
    private IEnumerator DoHitStop()
    {
        Time.timeScale = 0f;
        yield return new WaitForSecondsRealtime(HitStopDuration);
        Time.timeScale = 1f;
    }
    
    public void SlowMotion()
    {
        StartCoroutine(DoSlowMotion());
    }
    
    private IEnumerator DoSlowMotion()
    {
        Time.timeScale = SlowMoScale;
        Time.fixedDeltaTime = 0.02f * Time.timeScale;
        
        yield return new WaitForSecondsRealtime(SlowMoDuration);
        
        Time.timeScale = 1f;
        Time.fixedDeltaTime = 0.02f;
    }
    
    // === PARTICLES ===
    
    public void SpawnCollectParticles(Vector3 position)
    {
        SpawnParticles(CollectParticlePrefab, position, Color.yellow);
    }
    
    public void SpawnDamageParticles(Vector3 position)
    {
        SpawnParticles(DamageParticlePrefab, position, Color.red);
    }
    
    public void SpawnDeathParticles(Vector3 position)
    {
        SpawnParticles(DeathParticlePrefab, position, Color.white);
    }
    
    public void SpawnGrowParticles(Vector3 position)
    {
        SpawnParticles(GrowParticlePrefab, position, Color.green);
    }
    
    private void SpawnParticles(GameObject prefab, Vector3 position, Color fallbackColor)
    {
        if (prefab != null)
        {
            var go = Instantiate(prefab, position, Quaternion.identity);
            Destroy(go, 3f);
        }
        else
        {
            // Create simple particle burst if no prefab
            CreateSimpleParticleBurst(position, fallbackColor);
        }
    }
    
    private void CreateSimpleParticleBurst(Vector3 position, Color color)
    {
        GameObject particleObj = new GameObject("ParticleBurst");
        particleObj.transform.position = position;
        
        var ps = particleObj.AddComponent<ParticleSystem>();
        var main = ps.main;
        main.startColor = color;
        main.startSize = 0.2f;
        main.startSpeed = 5f;
        main.startLifetime = 0.5f;
        main.simulationSpace = ParticleSystemSimulationSpace.World;
        
        var emission = ps.emission;
        emission.enabled = false;
        
        var shape = ps.shape;
        shape.shapeType = ParticleSystemShapeType.Sphere;
        shape.radius = 0.1f;
        
        // Burst
        ps.Emit(15);
        
        Destroy(particleObj, 2f);
    }
    
    // === AUDIO ===
    
    public void PlayCollectSound()
    {
        PlaySound(CollectSound);
    }
    
    public void PlayDamageSound()
    {
        PlaySound(DamageSound);
    }
    
    public void PlayDeathSound()
    {
        PlaySound(DeathSound);
    }
    
    public void PlayGrowSound()
    {
        PlaySound(GrowSound);
    }
    
    public void PlayButtonSound()
    {
        PlaySound(ButtonSound);
    }
    
    public void PlayWinSound()
    {
        PlaySound(WinSound);
    }
    
    private void PlaySound(AudioClip clip)
    {
        if (!SoundEnabled || SFXSource == null || clip == null) return;
        SFXSource.PlayOneShot(clip);
    }
    
    // === VIBRATION ===
    
    public void Vibrate(long milliseconds = 50)
    {
        if (!VibrationEnabled) return;
        
        #if UNITY_ANDROID && !UNITY_EDITOR
        using (AndroidJavaClass unityPlayer = new AndroidJavaClass("com.unity3d.player.UnityPlayer"))
        {
            AndroidJavaObject currentActivity = unityPlayer.GetStatic<AndroidJavaObject>("currentActivity");
            AndroidJavaObject vibrator = currentActivity.Call<AndroidJavaObject>("getSystemService", "vibrator");
            vibrator.Call("vibrate", milliseconds);
        }
        #endif
        
        #if UNITY_IOS && !UNITY_EDITOR
        Handheld.Vibrate();
        #endif
    }
    
    // === COMBINED EFFECTS ===
    
    public void OnCollect(Vector3 position)
    {
        SpawnCollectParticles(position);
        PlayCollectSound();
    }
    
    public void OnDamage(Vector3 position)
    {
        SpawnDamageParticles(position);
        PlayDamageSound();
        ShakeScreen(0.15f, 0.2f);
        Vibrate(30);
    }
    
    public void OnGrow(Vector3 position)
    {
        SpawnGrowParticles(position);
        PlayGrowSound();
        ShakeScreen(0.1f, 0.1f);
    }
    
    public void OnDeath(Vector3 position)
    {
        SpawnDeathParticles(position);
        PlayDeathSound();
        ShakeScreen(0.4f, 0.5f);
        SlowMotion();
        Vibrate(100);
    }
    
    public void OnWin(Vector3 position)
    {
        PlayWinSound();
        SlowMotion();
        Vibrate(200);
    }
}
