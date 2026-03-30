using UnityEngine;
using System.Collections;
using System.Collections.Generic;

/// <summary>
/// JUICE MANAGER - All game feel effects based on "Juice it or Lose it" research
/// Screen shake, particles, slow-mo, haptics, color effects, sound variation
/// </summary>
public class JuiceManager : MonoBehaviour
{
    public static JuiceManager Instance { get; private set; }
    
    [Header("Screen Shake")]
    public float defaultShakeIntensity = 0.3f;
    public float shakeDuration = 0.2f;
    public float shakeFrequency = 25f;
    public AnimationCurve shakeFalloff;
    
    [Header("Time Effects")]
    public float slowMoScale = 0.2f;
    public float slowMoDuration = 0.3f;
    public float hitPauseDuration = 0.05f; // Frame freeze on impact
    
    [Header("Particles")]
    public GameObject collectParticlePrefab;
    public GameObject hitParticlePrefab;
    public GameObject nearMissParticlePrefab;
    public GameObject deathParticlePrefab;
    public int particlePoolSize = 20;
    
    [Header("Colors")]
    public Color collectFlashColor = new Color(1f, 0.9f, 0.3f);
    public Color hitFlashColor = new Color(1f, 0.2f, 0.2f);
    public Color nearMissColor = new Color(0.3f, 1f, 0.5f);
    
    [Header("Haptics")]
    public bool enableHaptics = true;
    [Range(0, 1)] public float collectVibration = 0.3f;
    [Range(0, 1)] public float hitVibration = 0.8f;
    [Range(0, 1)] public float deathVibration = 1f;
    
    // Internal
    private Camera mainCamera;
    private Vector3 originalCameraPos;
    private float currentShakeIntensity;
    private float shakeTimeRemaining;
    private Dictionary<string, Queue<GameObject>> particlePools;
    private bool isSlowMo = false;
    
    void Awake()
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
        
        mainCamera = Camera.main;
        if (mainCamera != null)
            originalCameraPos = mainCamera.transform.localPosition;
        
        // Setup shake falloff curve
        if (shakeFalloff == null || shakeFalloff.keys.Length == 0)
        {
            shakeFalloff = new AnimationCurve(
                new Keyframe(0, 1),
                new Keyframe(0.5f, 0.5f),
                new Keyframe(1, 0)
            );
        }
        
        InitializeParticlePools();
    }
    
    void InitializeParticlePools()
    {
        particlePools = new Dictionary<string, Queue<GameObject>>();
        
        // Create default particle systems if prefabs not assigned
        if (collectParticlePrefab == null)
            collectParticlePrefab = CreateDefaultParticle("CollectParticle", collectFlashColor, 0.5f);
        if (hitParticlePrefab == null)
            hitParticlePrefab = CreateDefaultParticle("HitParticle", hitFlashColor, 0.8f);
        if (nearMissParticlePrefab == null)
            nearMissParticlePrefab = CreateDefaultParticle("NearMissParticle", nearMissColor, 0.3f);
        if (deathParticlePrefab == null)
            deathParticlePrefab = CreateDefaultParticle("DeathParticle", Color.white, 1.5f);
        
        // Pre-pool particles
        PoolParticles("collect", collectParticlePrefab, particlePoolSize);
        PoolParticles("hit", hitParticlePrefab, particlePoolSize);
        PoolParticles("nearMiss", nearMissParticlePrefab, particlePoolSize);
        PoolParticles("death", deathParticlePrefab, 5);
    }
    
    GameObject CreateDefaultParticle(string name, Color color, float size)
    {
        GameObject obj = new GameObject(name);
        obj.SetActive(false);
        
        ParticleSystem ps = obj.AddComponent<ParticleSystem>();
        var main = ps.main;
        main.startColor = color;
        main.startSize = size;
        main.startLifetime = 0.5f;
        main.startSpeed = 5f;
        main.maxParticles = 30;
        main.simulationSpace = ParticleSystemSimulationSpace.World;
        
        var emission = ps.emission;
        emission.rateOverTime = 0;
        emission.SetBursts(new ParticleSystem.Burst[] {
            new ParticleSystem.Burst(0f, 15, 25)
        });
        
        var shape = ps.shape;
        shape.shapeType = ParticleSystemShapeType.Sphere;
        shape.radius = 0.3f;
        
        var colorOverLifetime = ps.colorOverLifetime;
        colorOverLifetime.enabled = true;
        Gradient grad = new Gradient();
        grad.SetKeys(
            new GradientColorKey[] { new GradientColorKey(color, 0), new GradientColorKey(color, 1) },
            new GradientAlphaKey[] { new GradientAlphaKey(1, 0), new GradientAlphaKey(0, 1) }
        );
        colorOverLifetime.color = grad;
        
        var sizeOverLifetime = ps.sizeOverLifetime;
        sizeOverLifetime.enabled = true;
        sizeOverLifetime.size = new ParticleSystem.MinMaxCurve(1f, new AnimationCurve(
            new Keyframe(0, 1), new Keyframe(1, 0)
        ));
        
        // Renderer
        var renderer = obj.GetComponent<ParticleSystemRenderer>();
        renderer.material = new Material(Shader.Find("Particles/Standard Unlit"));
        renderer.material.color = color;
        
        return obj;
    }
    
    void PoolParticles(string key, GameObject prefab, int count)
    {
        if (!particlePools.ContainsKey(key))
            particlePools[key] = new Queue<GameObject>();
        
        for (int i = 0; i < count; i++)
        {
            GameObject obj = Instantiate(prefab, transform);
            obj.SetActive(false);
            particlePools[key].Enqueue(obj);
        }
    }
    
    GameObject GetPooledParticle(string key)
    {
        if (!particlePools.ContainsKey(key) || particlePools[key].Count == 0)
            return null;
        
        GameObject obj = particlePools[key].Dequeue();
        particlePools[key].Enqueue(obj); // Re-add to end
        return obj;
    }
    
    void Update()
    {
        UpdateScreenShake();
    }
    
    void UpdateScreenShake()
    {
        if (shakeTimeRemaining > 0 && mainCamera != null)
        {
            shakeTimeRemaining -= Time.unscaledDeltaTime;
            float progress = 1f - (shakeTimeRemaining / shakeDuration);
            float intensity = currentShakeIntensity * shakeFalloff.Evaluate(progress);
            
            Vector3 shakeOffset = new Vector3(
                Mathf.PerlinNoise(Time.unscaledTime * shakeFrequency, 0) * 2 - 1,
                Mathf.PerlinNoise(0, Time.unscaledTime * shakeFrequency) * 2 - 1,
                0
            ) * intensity;
            
            mainCamera.transform.localPosition = originalCameraPos + shakeOffset;
        }
        else if (mainCamera != null)
        {
            mainCamera.transform.localPosition = Vector3.Lerp(
                mainCamera.transform.localPosition, 
                originalCameraPos, 
                Time.unscaledDeltaTime * 10f
            );
        }
    }
    
    // === PUBLIC JUICE METHODS ===
    
    public void ShakeScreen(float intensity = -1f, float duration = -1f)
    {
        if (intensity < 0) intensity = defaultShakeIntensity;
        if (duration < 0) duration = shakeDuration;
        
        currentShakeIntensity = Mathf.Max(currentShakeIntensity, intensity);
        shakeTimeRemaining = Mathf.Max(shakeTimeRemaining, duration);
    }
    
    public void SlowMotion(float scale = -1f, float duration = -1f)
    {
        if (scale < 0) scale = slowMoScale;
        if (duration < 0) duration = slowMoDuration;
        
        if (!isSlowMo)
        {
            StartCoroutine(DoSlowMotion(scale, duration));
        }
    }
    
    IEnumerator DoSlowMotion(float scale, float duration)
    {
        isSlowMo = true;
        Time.timeScale = scale;
        Time.fixedDeltaTime = 0.02f * scale;
        
        yield return new WaitForSecondsRealtime(duration);
        
        // Smooth return to normal
        float t = 0;
        while (t < 0.2f)
        {
            t += Time.unscaledDeltaTime;
            Time.timeScale = Mathf.Lerp(scale, 1f, t / 0.2f);
            Time.fixedDeltaTime = 0.02f * Time.timeScale;
            yield return null;
        }
        
        Time.timeScale = 1f;
        Time.fixedDeltaTime = 0.02f;
        isSlowMo = false;
    }
    
    public void HitPause()
    {
        StartCoroutine(DoHitPause());
    }
    
    IEnumerator DoHitPause()
    {
        Time.timeScale = 0f;
        yield return new WaitForSecondsRealtime(hitPauseDuration);
        if (!isSlowMo) Time.timeScale = 1f;
    }
    
    public void SpawnParticles(string type, Vector3 position, int count = -1)
    {
        GameObject particle = GetPooledParticle(type);
        if (particle == null) return;
        
        particle.transform.position = position;
        particle.SetActive(true);
        
        ParticleSystem ps = particle.GetComponent<ParticleSystem>();
        if (ps != null)
        {
            if (count > 0)
            {
                var emission = ps.emission;
                var bursts = new ParticleSystem.Burst[1];
                emission.GetBursts(bursts);
                bursts[0].count = count;
                emission.SetBursts(bursts);
            }
            ps.Play();
        }
        
        StartCoroutine(DeactivateAfter(particle, 1f));
    }
    
    IEnumerator DeactivateAfter(GameObject obj, float delay)
    {
        yield return new WaitForSeconds(delay);
        obj.SetActive(false);
    }
    
    public void Vibrate(float intensity)
    {
        if (!enableHaptics) return;
        
        #if UNITY_ANDROID && !UNITY_EDITOR
        try
        {
            long milliseconds = (long)(intensity * 100);
            using (AndroidJavaClass unityPlayer = new AndroidJavaClass("com.unity3d.player.UnityPlayer"))
            {
                AndroidJavaObject activity = unityPlayer.GetStatic<AndroidJavaObject>("currentActivity");
                AndroidJavaObject vibrator = activity.Call<AndroidJavaObject>("getSystemService", "vibrator");
                vibrator.Call("vibrate", milliseconds);
            }
        }
        catch { }
        #endif
        
        #if UNITY_IOS && !UNITY_EDITOR
        // iOS uses Taptic Engine
        Handheld.Vibrate();
        #endif
    }
    
    // Screen flash state (rendered via OnGUI)
    private Color flashColor = Color.clear;
    private float flashAlpha = 0f;
    
    public void FlashScreen(Color color, float duration = 0.1f)
    {
        StartCoroutine(DoScreenFlash(color, duration));
    }
    
    IEnumerator DoScreenFlash(Color color, float duration)
    {
        flashColor = color;
        flashAlpha = 1f;
        
        float t = 0;
        while (t < duration)
        {
            t += Time.unscaledDeltaTime;
            flashAlpha = 1f - (t / duration);
            yield return null;
        }
        flashAlpha = 0f;
    }
    
    // Draw screen flash using IMGUI (no UI assembly needed)
    void OnGUI()
    {
        if (flashAlpha > 0.01f)
        {
            Color c = flashColor;
            c.a = flashAlpha;
            GUI.color = c;
            GUI.DrawTexture(new Rect(0, 0, Screen.width, Screen.height), Texture2D.whiteTexture);
            GUI.color = Color.white;
        }
    }
    
    // === COMBO EFFECTS ===
    
    public void OnCollect(Vector3 position)
    {
        SpawnParticles("collect", position);
        Vibrate(collectVibration);
        // Small shake for satisfying feedback
        ShakeScreen(0.1f, 0.1f);
    }
    
    public void OnHit(Vector3 position)
    {
        SpawnParticles("hit", position);
        Vibrate(hitVibration);
        ShakeScreen(0.5f, 0.3f);
        HitPause();
        FlashScreen(hitFlashColor);
    }
    
    public void OnNearMiss(Vector3 position, int combo)
    {
        SpawnParticles("nearMiss", position, 10 + combo * 5);
        // Slight slow-mo for "bullet time" feel
        if (combo >= 2)
        {
            SlowMotion(0.5f, 0.15f);
        }
    }
    
    public void OnDeath(Vector3 position)
    {
        SpawnParticles("death", position, 50);
        Vibrate(deathVibration);
        ShakeScreen(1f, 0.5f);
        SlowMotion(0.1f, 1f);
        FlashScreen(Color.white, 0.3f);
    }
    
    public void OnGatePass(Vector3 position, float multiplier)
    {
        Color gateColor = multiplier > 1f ? Color.cyan : Color.magenta;
        SpawnParticles("collect", position, 30);
        ShakeScreen(0.3f, 0.2f);
        FlashScreen(gateColor, 0.15f);
        Vibrate(0.5f);
    }
}
