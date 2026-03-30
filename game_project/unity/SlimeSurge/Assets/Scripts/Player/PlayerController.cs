using UnityEngine;
using System.Collections;

public class PlayerController : MonoBehaviour
{
    [Header("Movement")]
    public float ForwardSpeed = 12f;
    public float HorizontalSpeed = 20f;
    public float LaneWidth = 4f;
    public float SpeedIncreaseRate = 0.1f;
    
    [Header("Size")]
    public float CurrentSize = 1f;
    public float MinSize = 0.3f;
    public float MaxSize = 8f;
    public float SizeChangeSpeed = 8f;
    
    [Header("Visual")]
    public Transform SlimeVisual;
    public Renderer SlimeRenderer;
    public TrailRenderer Trail;
    
    [Header("Effects")]
    public GameObject CollectParticles;
    public GameObject DamageParticles;
    public GameObject DeathParticles;
    public GameObject GrowParticles;
    
    [Header("Audio")]
    public AudioSource AudioSource;
    public AudioClip CollectSound;
    public AudioClip DamageSound;
    public AudioClip GrowSound;
    public AudioClip DeathSound;
    
    private Rigidbody rb;
    private bool isRunning = false;
    private bool isDead = false;
    private float targetXPosition = 0f;
    private float targetSize = 1f;
    private float baseSpeed;
    private Vector3 lastMousePos;
    
    // Events
    public System.Action<float> OnSizeChanged;
    public System.Action OnDeath;
    
    private void Awake()
    {
        rb = GetComponent<Rigidbody>();
        if (rb == null) rb = gameObject.AddComponent<Rigidbody>();
        
        rb.useGravity = false;
        rb.constraints = RigidbodyConstraints.FreezeRotation | RigidbodyConstraints.FreezePositionY;
        rb.interpolation = RigidbodyInterpolation.Interpolate;
        
        if (AudioSource == null) AudioSource = gameObject.AddComponent<AudioSource>();
        
        baseSpeed = ForwardSpeed;
        
        // Create trail if missing
        if (Trail == null)
        {
            Trail = gameObject.AddComponent<TrailRenderer>();
            Trail.time = 0.3f;
            Trail.startWidth = 0.3f;
            Trail.endWidth = 0f;
            Trail.material = new Material(Shader.Find("Sprites/Default"));
            Trail.startColor = new Color(0.2f, 0.9f, 0.3f, 0.5f);
            Trail.endColor = new Color(0.2f, 0.9f, 0.3f, 0f);
        }
    }
    
    private void Start()
    {
        UpdateVisualSize();
    }
    
    private void Update()
    {
        if (isDead) return;
        
        HandleInput();
        UpdateSize();
        AnimateSlime();
        
        // Increase speed over time
        ForwardSpeed = baseSpeed + (transform.position.z * SpeedIncreaseRate * 0.01f);
    }
    
    private void FixedUpdate()
    {
        if (!isRunning || isDead) return;
        MoveForward();
        MoveHorizontal();
    }
    
    public void StartRunning()
    {
        isRunning = true;
        isDead = false;
        Debug.Log("🏃 Player started running!");
    }
    
    public void StopRunning()
    {
        isRunning = false;
    }
    
    private void HandleInput()
    {
        // Touch input
        if (Input.touchCount > 0)
        {
            Touch touch = Input.GetTouch(0);
            if (touch.phase == TouchPhase.Moved || touch.phase == TouchPhase.Stationary)
            {
                float screenX = touch.position.x / Screen.width;
                targetXPosition = Mathf.Lerp(-LaneWidth, LaneWidth, screenX);
            }
        }
        // Mouse drag
        else if (Input.GetMouseButton(0))
        {
            float screenX = Input.mousePosition.x / Screen.width;
            targetXPosition = Mathf.Lerp(-LaneWidth, LaneWidth, screenX);
        }
        
        // Keyboard
        if (Input.GetKey(KeyCode.LeftArrow) || Input.GetKey(KeyCode.A))
        {
            targetXPosition -= HorizontalSpeed * Time.deltaTime;
        }
        if (Input.GetKey(KeyCode.RightArrow) || Input.GetKey(KeyCode.D))
        {
            targetXPosition += HorizontalSpeed * Time.deltaTime;
        }
        
        targetXPosition = Mathf.Clamp(targetXPosition, -LaneWidth, LaneWidth);
    }
    
    private void MoveForward()
    {
        Vector3 vel = rb.velocity;
        vel.z = ForwardSpeed;
        rb.velocity = vel;
    }
    
    private void MoveHorizontal()
    {
        Vector3 position = rb.position;
        position.x = Mathf.Lerp(position.x, targetXPosition, HorizontalSpeed * Time.fixedDeltaTime);
        rb.MovePosition(position);
    }
    
    private void UpdateSize()
    {
        if (Mathf.Abs(CurrentSize - targetSize) > 0.01f)
        {
            CurrentSize = Mathf.Lerp(CurrentSize, targetSize, SizeChangeSpeed * Time.deltaTime);
            UpdateVisualSize();
            OnSizeChanged?.Invoke(CurrentSize);
        }
    }
    
    private void UpdateVisualSize()
    {
        Transform visual = SlimeVisual != null ? SlimeVisual : transform;
        visual.localScale = Vector3.one * CurrentSize;
        
        // Update trail based on size
        if (Trail != null)
        {
            Trail.startWidth = CurrentSize * 0.3f;
        }
        
        // Update collider
        var col = GetComponent<SphereCollider>();
        if (col != null) col.radius = CurrentSize * 0.5f;
    }
    
    private void AnimateSlime()
    {
        Transform visual = SlimeVisual != null ? SlimeVisual : transform;
        
        // Bounce animation
        float bounce = 1f + Mathf.Sin(Time.time * 10f) * 0.05f;
        float moveSquash = 1f + Mathf.Abs(rb.velocity.x) * 0.02f;
        
        Vector3 scale = Vector3.one * CurrentSize;
        scale.y *= bounce;
        scale.x *= (2f - bounce) * moveSquash;
        scale.z *= (2f - bounce);
        visual.localScale = scale;
    }
    
    public void Absorb(float sizeIncrease)
    {
        if (isDead) return;
        
        targetSize = Mathf.Min(CurrentSize + sizeIncrease, MaxSize);
        
        // Use Effects Manager if available
        if (EffectsManager.Instance != null)
            EffectsManager.Instance.OnCollect(transform.position);
        else
        {
            PlaySound(CollectSound);
            SpawnParticles(CollectParticles);
        }
        
        StartCoroutine(SquashStretch(1.2f));
        GameManager.Instance?.AddCoin();
    }
    
    public void TakeDamage(float sizeLoss)
    {
        if (isDead) return;
        
        targetSize = Mathf.Max(CurrentSize - sizeLoss, MinSize);
        
        // Use Effects Manager if available
        if (EffectsManager.Instance != null)
            EffectsManager.Instance.OnDamage(transform.position);
        else
        {
            PlaySound(DamageSound);
            SpawnParticles(DamageParticles);
            StartCoroutine(CameraShake(0.1f, 0.2f));
        }
        
        StartCoroutine(FlashRed());
        StartCoroutine(SquashStretch(0.7f));
        
        GameManager.Instance?.LoseLife();
        
        if (targetSize <= MinSize)
        {
            Die();
        }
    }
    
    public void MultiplySize(float multiplier)
    {
        if (isDead) return;
        
        float newSize = CurrentSize * multiplier;
        targetSize = Mathf.Clamp(newSize, MinSize, MaxSize);
        
        // Use Effects Manager if available
        if (EffectsManager.Instance != null)
        {
            if (multiplier > 1)
                EffectsManager.Instance.OnGrow(transform.position);
            else
                EffectsManager.Instance.OnDamage(transform.position);
        }
        else
        {
            if (multiplier > 1)
            {
                PlaySound(GrowSound);
                SpawnParticles(GrowParticles);
            }
            else
            {
                PlaySound(DamageSound);
            }
        }
        
        StartCoroutine(SquashStretch(multiplier > 1 ? 1.3f : 0.6f));
    }
    
    public void AddSize(float amount)
    {
        if (isDead) return;
        targetSize = Mathf.Clamp(CurrentSize + amount, MinSize, MaxSize);
    }
    
    public void Die()
    {
        if (isDead) return;
        isDead = true;
        isRunning = false;
        
        // Use Effects Manager if available
        if (EffectsManager.Instance != null)
            EffectsManager.Instance.OnDeath(transform.position);
        else
        {
            PlaySound(DeathSound);
            SpawnParticles(DeathParticles);
        }
        
        StartCoroutine(DeathAnimation());
        
        OnDeath?.Invoke();
        GameManager.Instance?.GameOver();
    }
    
    private IEnumerator DeathAnimation()
    {
        // Explode into pieces effect
        Transform visual = SlimeVisual != null ? SlimeVisual : transform;
        Vector3 originalScale = visual.localScale;
        
        // Quick expand
        float expandTime = 0.1f;
        float elapsed = 0f;
        while (elapsed < expandTime)
        {
            elapsed += Time.deltaTime;
            float t = elapsed / expandTime;
            visual.localScale = originalScale * (1f + t * 0.5f);
            yield return null;
        }
        
        // Contract and disappear
        float shrinkTime = 0.3f;
        elapsed = 0f;
        while (elapsed < shrinkTime)
        {
            elapsed += Time.deltaTime;
            float t = elapsed / shrinkTime;
            visual.localScale = originalScale * 1.5f * (1f - t);
            
            // Change color to darker
            if (SlimeRenderer != null)
            {
                Color c = SlimeRenderer.material.color;
                c = Color.Lerp(c, Color.gray, t);
                SlimeRenderer.material.color = c;
            }
            
            yield return null;
        }
        
        visual.localScale = Vector3.zero;
    }
    
    private IEnumerator SquashStretch(float intensity)
    {
        float duration = 0.15f;
        float elapsed = 0f;
        
        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            float t = elapsed / duration;
            float wave = Mathf.Sin(t * Mathf.PI);
            float squash = 1f + (intensity - 1f) * wave * 0.5f;
            
            // Applied in AnimateSlime
            yield return null;
        }
    }
    
    private IEnumerator FlashRed()
    {
        if (SlimeRenderer == null) yield break;
        
        Color originalColor = SlimeRenderer.material.color;
        SlimeRenderer.material.color = Color.red;
        yield return new WaitForSeconds(0.1f);
        SlimeRenderer.material.color = originalColor;
    }
    
    private IEnumerator CameraShake(float duration, float magnitude)
    {
        Camera cam = Camera.main;
        if (cam == null) yield break;
        
        Vector3 originalPos = cam.transform.localPosition;
        float elapsed = 0f;
        
        while (elapsed < duration)
        {
            float x = Random.Range(-1f, 1f) * magnitude;
            float y = Random.Range(-1f, 1f) * magnitude;
            
            cam.transform.localPosition = originalPos + new Vector3(x, y, 0);
            elapsed += Time.deltaTime;
            yield return null;
        }
        
        cam.transform.localPosition = originalPos;
    }
    
    private void PlaySound(AudioClip clip)
    {
        if (AudioSource != null && clip != null)
        {
            AudioSource.PlayOneShot(clip);
        }
    }
    
    private void SpawnParticles(GameObject prefab)
    {
        if (prefab != null)
        {
            var particles = Instantiate(prefab, transform.position, Quaternion.identity);
            Destroy(particles, 2f);
        }
    }
    
    private void OnTriggerEnter(Collider other)
    {
        if (isDead) return;
        
        ICollectible collectible = other.GetComponent<ICollectible>();
        if (collectible != null)
        {
            collectible.Collect(this);
        }
    }
}

public interface ICollectible
{
    void Collect(PlayerController player);
}
