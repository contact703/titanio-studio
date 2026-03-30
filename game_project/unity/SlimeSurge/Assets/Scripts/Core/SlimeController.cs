using UnityEngine;
using System.Collections;

/// <summary>
/// SLIME CONTROLLER - Complete player controller with full juice
/// Based on research: Swerve mechanics, squash/stretch, near-miss feedback
/// </summary>
public class SlimeController : MonoBehaviour
{
    [Header("Movement")]
    public float forwardSpeed = 8f;
    public float maxForwardSpeed = 20f;
    public float speedIncreaseRate = 0.1f;
    public float horizontalSpeed = 12f;
    public float laneWidth = 3f;
    public float inputSmoothing = 0.08f; // Responsive but smooth
    
    [Header("Growth System")]
    public float baseScale = 1f;
    public float maxScale = 3f;
    public float scalePerCollect = 0.05f;
    public float shrinkOnHit = 0.3f;
    
    [Header("Squash & Stretch")]
    public float squashAmount = 0.3f;
    public float stretchAmount = 0.2f;
    public float squashSpeed = 15f;
    public AnimationCurve bounceCurve;
    
    [Header("Visual")]
    public Color baseColor = new Color(0.2f, 0.8f, 0.3f);
    public Color hitColor = Color.red;
    public Color collectColor = Color.yellow;
    public float colorFlashDuration = 0.15f;
    
    [Header("Eyes")]
    public Transform leftEye;
    public Transform rightEye;
    public float eyeFollowSpeed = 5f;
    public float maxEyeOffset = 0.15f;
    
    [Header("Trail")]
    public TrailRenderer trail;
    public float trailWidthMultiplier = 0.5f;
    
    // State
    private float currentScale;
    private float targetScale;
    private float currentX;
    private float targetX;
    private float currentSpeed;
    private Vector3 originalScale;
    private Vector3 currentSquash;
    private bool isAlive = true;
    private bool isInvincible = false;
    private int score = 0;
    private int coins = 0;
    private int lives = 3;
    private int highScore = 0;
    
    // Components
    private Renderer rend;
    private Material mat;
    private Rigidbody rb;
    
    // Near miss
    private float lastNearMissTime;
    private int nearMissCombo = 0;
    
    // Events
    public System.Action<int> OnScoreChanged;
    public System.Action<int> OnCoinsChanged;
    public System.Action<int> OnLivesChanged;
    public System.Action<int, Vector3> OnNearMiss; // combo, position
    public System.Action OnDeath;
    public System.Action<float> OnCollect; // scale multiplier
    public System.Action OnHit;
    
    void Start()
    {
        rb = GetComponent<Rigidbody>();
        if (rb == null) rb = gameObject.AddComponent<Rigidbody>();
        rb.useGravity = false;
        rb.constraints = RigidbodyConstraints.FreezeRotation | RigidbodyConstraints.FreezePositionY;
        rb.interpolation = RigidbodyInterpolation.Interpolate;
        
        rend = GetComponentInChildren<Renderer>();
        if (rend != null)
        {
            mat = rend.material;
            mat.color = baseColor;
        }
        
        originalScale = transform.localScale;
        currentScale = baseScale;
        targetScale = baseScale;
        currentSpeed = forwardSpeed;
        currentX = transform.position.x;
        targetX = currentX;
        
        // Setup bounce curve if not set
        if (bounceCurve == null || bounceCurve.keys.Length == 0)
        {
            bounceCurve = new AnimationCurve(
                new Keyframe(0, 0),
                new Keyframe(0.3f, 1.2f),
                new Keyframe(0.5f, 0.9f),
                new Keyframe(0.7f, 1.05f),
                new Keyframe(1f, 1f)
            );
        }
        
        highScore = PlayerPrefs.GetInt("HighScore", 0);
        
        // Create eyes if not assigned
        if (leftEye == null) CreateEyes();
        
        // Setup trail
        if (trail == null)
        {
            trail = gameObject.AddComponent<TrailRenderer>();
            trail.time = 0.3f;
            trail.startWidth = 0.5f;
            trail.endWidth = 0f;
            trail.material = new Material(Shader.Find("Sprites/Default"));
            trail.startColor = new Color(baseColor.r, baseColor.g, baseColor.b, 0.5f);
            trail.endColor = new Color(baseColor.r, baseColor.g, baseColor.b, 0f);
        }
    }
    
    void CreateEyes()
    {
        // Left eye
        GameObject leftEyeObj = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        leftEyeObj.name = "LeftEye";
        leftEyeObj.transform.SetParent(transform);
        leftEyeObj.transform.localPosition = new Vector3(-0.2f, 0.3f, 0.4f);
        leftEyeObj.transform.localScale = Vector3.one * 0.25f;
        leftEyeObj.GetComponent<Renderer>().material.color = Color.white;
        Destroy(leftEyeObj.GetComponent<Collider>());
        leftEye = leftEyeObj.transform;
        
        // Left pupil
        GameObject leftPupil = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        leftPupil.name = "LeftPupil";
        leftPupil.transform.SetParent(leftEyeObj.transform);
        leftPupil.transform.localPosition = new Vector3(0, 0, 0.4f);
        leftPupil.transform.localScale = Vector3.one * 0.5f;
        leftPupil.GetComponent<Renderer>().material.color = Color.black;
        Destroy(leftPupil.GetComponent<Collider>());
        
        // Right eye
        GameObject rightEyeObj = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        rightEyeObj.name = "RightEye";
        rightEyeObj.transform.SetParent(transform);
        rightEyeObj.transform.localPosition = new Vector3(0.2f, 0.3f, 0.4f);
        rightEyeObj.transform.localScale = Vector3.one * 0.25f;
        rightEyeObj.GetComponent<Renderer>().material.color = Color.white;
        Destroy(rightEyeObj.GetComponent<Collider>());
        rightEye = rightEyeObj.transform;
        
        // Right pupil
        GameObject rightPupil = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        rightPupil.name = "RightPupil";
        rightPupil.transform.SetParent(rightEyeObj.transform);
        rightPupil.transform.localPosition = new Vector3(0, 0, 0.4f);
        rightPupil.transform.localScale = Vector3.one * 0.5f;
        rightPupil.GetComponent<Renderer>().material.color = Color.black;
        Destroy(rightPupil.GetComponent<Collider>());
    }
    
    void Update()
    {
        if (!isAlive) return;
        
        HandleInput();
        UpdateMovement();
        UpdateScale();
        UpdateSquashStretch();
        UpdateEyes();
        UpdateTrail();
        UpdateScore();
        
        // Increase speed over time
        currentSpeed = Mathf.Min(currentSpeed + speedIncreaseRate * Time.deltaTime, maxForwardSpeed);
    }
    
    void HandleInput()
    {
        float input = 0f;
        
        // Keyboard
        if (Input.GetKey(KeyCode.A) || Input.GetKey(KeyCode.LeftArrow))
            input = -1f;
        else if (Input.GetKey(KeyCode.D) || Input.GetKey(KeyCode.RightArrow))
            input = 1f;
        
        // Mouse/Touch drag
        if (Input.GetMouseButton(0))
        {
            float screenCenter = Screen.width / 2f;
            float mouseX = Input.mousePosition.x;
            input = (mouseX - screenCenter) / screenCenter;
        }
        
        // Touch
        if (Input.touchCount > 0)
        {
            Touch touch = Input.GetTouch(0);
            float screenCenter = Screen.width / 2f;
            input = (touch.position.x - screenCenter) / screenCenter;
        }
        
        targetX = Mathf.Clamp(input * laneWidth, -laneWidth, laneWidth);
    }
    
    void UpdateMovement()
    {
        // Smooth horizontal movement
        currentX = Mathf.Lerp(currentX, targetX, inputSmoothing * 60f * Time.deltaTime);
        
        // Apply movement
        Vector3 newPos = transform.position;
        newPos.x = currentX;
        newPos.z += currentSpeed * Time.deltaTime;
        
        rb.MovePosition(newPos);
    }
    
    void UpdateScale()
    {
        // Smooth scale transition with bounce
        currentScale = Mathf.Lerp(currentScale, targetScale, Time.deltaTime * 8f);
        
        // Apply scale with squash/stretch
        Vector3 newScale = originalScale * currentScale;
        newScale.x *= currentSquash.x;
        newScale.y *= currentSquash.y;
        newScale.z *= currentSquash.z;
        
        transform.localScale = newScale;
    }
    
    void UpdateSquashStretch()
    {
        // Return to normal
        currentSquash = Vector3.Lerp(currentSquash, Vector3.one, Time.deltaTime * squashSpeed);
        
        // Stretch based on movement direction
        float horizontalVel = Mathf.Abs(targetX - currentX);
        if (horizontalVel > 0.1f)
        {
            float stretchX = 1f + stretchAmount * Mathf.Clamp01(horizontalVel);
            float squashY = 1f - stretchAmount * 0.3f * Mathf.Clamp01(horizontalVel);
            currentSquash = new Vector3(stretchX, squashY, 1f);
        }
    }
    
    void UpdateEyes()
    {
        if (leftEye == null || rightEye == null) return;
        
        // Eyes look in movement direction
        Vector3 lookDir = new Vector3(targetX - currentX, 0, 1f).normalized;
        float eyeOffsetX = lookDir.x * maxEyeOffset;
        float eyeOffsetZ = lookDir.z * maxEyeOffset * 0.5f;
        
        Vector3 targetOffset = new Vector3(eyeOffsetX, 0, eyeOffsetZ);
        
        // Animate pupils (children of eyes)
        if (leftEye.childCount > 0)
        {
            Transform leftPupil = leftEye.GetChild(0);
            leftPupil.localPosition = Vector3.Lerp(leftPupil.localPosition, 
                new Vector3(0, 0, 0.4f) + targetOffset, Time.deltaTime * eyeFollowSpeed);
        }
        if (rightEye.childCount > 0)
        {
            Transform rightPupil = rightEye.GetChild(0);
            rightPupil.localPosition = Vector3.Lerp(rightPupil.localPosition, 
                new Vector3(0, 0, 0.4f) + targetOffset, Time.deltaTime * eyeFollowSpeed);
        }
    }
    
    void UpdateTrail()
    {
        if (trail == null) return;
        trail.startWidth = currentScale * trailWidthMultiplier;
    }
    
    void UpdateScore()
    {
        // Score based on distance
        int newScore = Mathf.FloorToInt(transform.position.z);
        if (newScore > score)
        {
            score = newScore;
            OnScoreChanged?.Invoke(score);
        }
    }
    
    // Called when passing close to obstacle without hitting
    public void TriggerNearMiss(Vector3 obstaclePos)
    {
        if (Time.time - lastNearMissTime < 0.5f)
        {
            nearMissCombo++;
        }
        else
        {
            nearMissCombo = 1;
        }
        lastNearMissTime = Time.time;
        
        OnNearMiss?.Invoke(nearMissCombo, obstaclePos);
        
        // Bonus points for near miss
        score += 10 * nearMissCombo;
        OnScoreChanged?.Invoke(score);
    }
    
    public void Collect(float value, bool isCoin = false)
    {
        if (!isAlive) return;
        
        // Grow
        targetScale = Mathf.Min(targetScale + scalePerCollect * value, maxScale);
        
        // Squash effect (compress then bounce back)
        currentSquash = new Vector3(0.8f, 1.3f, 0.8f);
        
        // Color flash
        StartCoroutine(ColorFlash(collectColor));
        
        // Score
        if (isCoin)
        {
            coins += Mathf.RoundToInt(value);
            OnCoinsChanged?.Invoke(coins);
        }
        else
        {
            score += Mathf.RoundToInt(value * 10);
            OnScoreChanged?.Invoke(score);
        }
        
        OnCollect?.Invoke(value);
    }
    
    public void ApplyMultiplier(float multiplier)
    {
        targetScale = Mathf.Clamp(targetScale * multiplier, 0.5f, maxScale);
        
        // Big squash for multiplier
        if (multiplier > 1f)
        {
            currentSquash = new Vector3(0.6f, 1.5f, 0.6f);
            StartCoroutine(ColorFlash(Color.cyan));
        }
        else
        {
            currentSquash = new Vector3(1.3f, 0.7f, 1.3f);
            StartCoroutine(ColorFlash(Color.magenta));
        }
    }
    
    public void TakeDamage()
    {
        if (!isAlive || isInvincible) return;
        
        lives--;
        OnLivesChanged?.Invoke(lives);
        OnHit?.Invoke();
        
        // Shrink
        targetScale = Mathf.Max(targetScale - shrinkOnHit, 0.5f);
        
        // Impact squash
        currentSquash = new Vector3(1.5f, 0.5f, 1.5f);
        
        // Color flash
        StartCoroutine(ColorFlash(hitColor));
        
        // Brief invincibility
        StartCoroutine(InvincibilityFrames());
        
        if (lives <= 0)
        {
            Die();
        }
    }
    
    void Die()
    {
        isAlive = false;
        
        // Save high score
        if (score > highScore)
        {
            highScore = score;
            PlayerPrefs.SetInt("HighScore", highScore);
            PlayerPrefs.Save();
        }
        
        // Death animation
        StartCoroutine(DeathAnimation());
        
        OnDeath?.Invoke();
    }
    
    IEnumerator DeathAnimation()
    {
        // Expand
        float t = 0;
        Vector3 startScale = transform.localScale;
        while (t < 0.3f)
        {
            t += Time.deltaTime;
            float scale = 1f + Mathf.Sin(t / 0.3f * Mathf.PI) * 0.5f;
            transform.localScale = startScale * scale;
            if (mat != null) mat.color = Color.Lerp(baseColor, hitColor, t / 0.3f);
            yield return null;
        }
        
        // Shrink and fade
        t = 0;
        while (t < 0.5f)
        {
            t += Time.deltaTime;
            float scale = 1f - t / 0.5f;
            transform.localScale = startScale * 1.5f * scale;
            if (mat != null)
            {
                Color c = mat.color;
                c.a = 1f - t / 0.5f;
                mat.color = c;
            }
            yield return null;
        }
        
        gameObject.SetActive(false);
    }
    
    IEnumerator ColorFlash(Color flashColor)
    {
        if (mat == null) yield break;
        
        mat.color = flashColor;
        yield return new WaitForSeconds(colorFlashDuration);
        
        float t = 0;
        while (t < colorFlashDuration)
        {
            t += Time.deltaTime;
            mat.color = Color.Lerp(flashColor, baseColor, t / colorFlashDuration);
            yield return null;
        }
        mat.color = baseColor;
    }
    
    IEnumerator InvincibilityFrames()
    {
        isInvincible = true;
        
        // Blink effect
        float duration = 1.5f;
        float blinkRate = 0.1f;
        float t = 0;
        
        while (t < duration)
        {
            if (rend != null)
                rend.enabled = !rend.enabled;
            yield return new WaitForSeconds(blinkRate);
            t += blinkRate;
        }
        
        if (rend != null)
            rend.enabled = true;
        isInvincible = false;
    }
    
    void OnTriggerEnter(Collider other)
    {
        if (!isAlive) return;
        
        // Check tag
        switch (other.tag)
        {
            case "Collectible":
                Collect(1f);
                Destroy(other.gameObject);
                break;
            case "Coin":
                Collect(1f, true);
                Destroy(other.gameObject);
                break;
            case "Obstacle":
                TakeDamage();
                break;
            case "Gate":
                Gate gate = other.GetComponent<Gate>();
                if (gate != null)
                    ApplyMultiplier(gate.multiplier);
                break;
        }
    }
    
    // Public getters
    public int Score => score;
    public int Coins => coins;
    public int Lives => lives;
    public int HighScore => highScore;
    public float CurrentScale => currentScale;
    public float CurrentSpeed => currentSpeed;
    public bool IsAlive => isAlive;
}
