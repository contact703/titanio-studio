using UnityEngine;

/// <summary>
/// SMOOTH CAMERA - Polished camera follow with juice effects
/// Based on research: Camera effects, zoom, look-ahead
/// </summary>
public class SmoothCamera : MonoBehaviour
{
    [Header("Target")]
    public Transform target;
    public Vector3 baseOffset = new Vector3(0, 8, -10);
    public Vector3 baseLookOffset = new Vector3(0, 0, 5);
    
    [Header("Follow")]
    public float followSpeed = 5f;
    public float rotationSpeed = 3f;
    
    [Header("Look Ahead")]
    public float lookAheadDistance = 3f;
    public float lookAheadSpeed = 2f;
    
    [Header("Dynamic FOV")]
    public float baseFOV = 60f;
    public float maxFOV = 75f;
    public float fovChangeSpeed = 2f;
    
    [Header("Zoom Effects")]
    public float collectZoomAmount = 5f;
    public float collectZoomDuration = 0.3f;
    public float hitZoomAmount = -10f;
    public float hitZoomDuration = 0.5f;
    
    [Header("Tilt")]
    public float tiltAmount = 5f;
    public float tiltSpeed = 3f;
    
    // Internal
    private Camera cam;
    private Vector3 currentVelocity;
    private Vector3 lookAheadOffset;
    private float currentFOV;
    private float targetFOV;
    private float fovZoomOffset = 0f;
    private float currentTilt = 0f;
    private float targetTilt = 0f;
    private SlimeController player;
    
    void Start()
    {
        cam = GetComponent<Camera>();
        if (cam == null) cam = Camera.main;
        
        if (target == null)
        {
            player = FindObjectOfType<SlimeController>();
            if (player != null) target = player.transform;
        }
        else
        {
            player = target.GetComponent<SlimeController>();
        }
        
        currentFOV = baseFOV;
        targetFOV = baseFOV;
        
        if (player != null)
        {
            player.OnCollect += OnPlayerCollect;
            player.OnHit += OnPlayerHit;
        }
        
        // Initial position
        if (target != null)
        {
            transform.position = target.position + baseOffset;
            transform.LookAt(target.position + baseLookOffset);
        }
    }
    
    void LateUpdate()
    {
        if (target == null) return;
        
        UpdateLookAhead();
        UpdatePosition();
        UpdateRotation();
        UpdateFOV();
        UpdateTilt();
    }
    
    void UpdateLookAhead()
    {
        if (player == null) return;
        
        // Look ahead based on player speed
        float speedRatio = player.CurrentSpeed / player.maxForwardSpeed;
        Vector3 targetLookAhead = Vector3.forward * lookAheadDistance * speedRatio;
        
        // Also look towards horizontal movement
        float horizontalInput = 0f;
        if (Input.GetKey(KeyCode.A) || Input.GetKey(KeyCode.LeftArrow)) horizontalInput = -1f;
        else if (Input.GetKey(KeyCode.D) || Input.GetKey(KeyCode.RightArrow)) horizontalInput = 1f;
        
        targetLookAhead += Vector3.right * horizontalInput * lookAheadDistance * 0.5f;
        
        lookAheadOffset = Vector3.Lerp(lookAheadOffset, targetLookAhead, Time.deltaTime * lookAheadSpeed);
    }
    
    void UpdatePosition()
    {
        // Scale-adjusted offset (camera moves back as player grows)
        float scaleMultiplier = 1f;
        if (player != null)
        {
            scaleMultiplier = 1f + (player.CurrentScale - 1f) * 0.3f;
        }
        
        Vector3 targetPos = target.position + baseOffset * scaleMultiplier + lookAheadOffset;
        
        // Smooth follow
        transform.position = Vector3.SmoothDamp(
            transform.position,
            targetPos,
            ref currentVelocity,
            1f / followSpeed
        );
    }
    
    void UpdateRotation()
    {
        Vector3 lookTarget = target.position + baseLookOffset + lookAheadOffset;
        Quaternion targetRotation = Quaternion.LookRotation(lookTarget - transform.position);
        
        // Add tilt
        targetRotation *= Quaternion.Euler(0, 0, currentTilt);
        
        transform.rotation = Quaternion.Slerp(
            transform.rotation,
            targetRotation,
            Time.deltaTime * rotationSpeed
        );
    }
    
    void UpdateFOV()
    {
        if (cam == null) return;
        
        // Base FOV changes with speed
        float speedRatio = 0f;
        if (player != null)
        {
            speedRatio = (player.CurrentSpeed - player.forwardSpeed) / 
                         (player.maxForwardSpeed - player.forwardSpeed);
        }
        
        targetFOV = Mathf.Lerp(baseFOV, maxFOV, speedRatio);
        
        // Apply zoom offset
        float finalFOV = targetFOV + fovZoomOffset;
        
        // Smooth transition
        currentFOV = Mathf.Lerp(currentFOV, finalFOV, Time.deltaTime * fovChangeSpeed);
        cam.fieldOfView = currentFOV;
        
        // Decay zoom offset
        fovZoomOffset = Mathf.Lerp(fovZoomOffset, 0, Time.deltaTime * 5f);
    }
    
    void UpdateTilt()
    {
        // Tilt based on horizontal movement
        float horizontalInput = 0f;
        if (Input.GetKey(KeyCode.A) || Input.GetKey(KeyCode.LeftArrow)) horizontalInput = -1f;
        else if (Input.GetKey(KeyCode.D) || Input.GetKey(KeyCode.RightArrow)) horizontalInput = 1f;
        
        if (Input.GetMouseButton(0))
        {
            float screenCenter = Screen.width / 2f;
            horizontalInput = (Input.mousePosition.x - screenCenter) / screenCenter;
        }
        
        targetTilt = -horizontalInput * tiltAmount;
        currentTilt = Mathf.Lerp(currentTilt, targetTilt, Time.deltaTime * tiltSpeed);
    }
    
    void OnPlayerCollect(float value)
    {
        // Slight zoom in
        fovZoomOffset -= collectZoomAmount;
    }
    
    void OnPlayerHit()
    {
        // Zoom out on hit
        fovZoomOffset -= hitZoomAmount;
    }
    
    // Public methods for effects
    public void ZoomPulse(float amount, float duration)
    {
        fovZoomOffset += amount;
    }
    
    public void SetTarget(Transform newTarget)
    {
        target = newTarget;
        player = target?.GetComponent<SlimeController>();
        
        if (player != null)
        {
            player.OnCollect += OnPlayerCollect;
            player.OnHit += OnPlayerHit;
        }
    }
    
    void OnDestroy()
    {
        if (player != null)
        {
            player.OnCollect -= OnPlayerCollect;
            player.OnHit -= OnPlayerHit;
        }
    }
}
