using UnityEngine;

public class CameraFollow : MonoBehaviour
{
    [Header("Target")]
    public Transform Target;
    
    [Header("Offset")]
    public Vector3 Offset = new Vector3(0, 12, -18);
    public Vector3 LookOffset = new Vector3(0, 0, 10);
    
    [Header("Smoothing")]
    public float SmoothSpeed = 5f;
    public float LookSmoothSpeed = 10f;
    
    [Header("Dynamic Camera")]
    public bool DynamicZoom = true;
    public float MinFOV = 55f;
    public float MaxFOV = 75f;
    public float SpeedFOVMultiplier = 0.5f;
    
    private Vector3 currentVelocity;
    private Camera cam;
    private float baseFOV;
    
    private void Start()
    {
        cam = GetComponent<Camera>();
        if (cam != null)
        {
            baseFOV = cam.fieldOfView;
        }
        
        // Find player if not assigned
        if (Target == null)
        {
            var player = FindObjectOfType<PlayerController>();
            if (player != null) Target = player.transform;
        }
    }
    
    private void LateUpdate()
    {
        if (Target == null) return;
        
        // Calculate desired position
        Vector3 desiredPosition = Target.position + Offset;
        
        // Smooth follow
        Vector3 smoothedPosition = Vector3.SmoothDamp(
            transform.position, 
            desiredPosition, 
            ref currentVelocity, 
            1f / SmoothSpeed
        );
        
        transform.position = smoothedPosition;
        
        // Look at player (slightly ahead)
        Vector3 lookTarget = Target.position + LookOffset;
        Quaternion targetRotation = Quaternion.LookRotation(lookTarget - transform.position);
        transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, LookSmoothSpeed * Time.deltaTime);
        
        // Dynamic FOV based on speed
        if (DynamicZoom && cam != null)
        {
            var player = Target.GetComponent<PlayerController>();
            if (player != null)
            {
                float speedFactor = player.ForwardSpeed * SpeedFOVMultiplier * 0.1f;
                float targetFOV = Mathf.Clamp(baseFOV + speedFactor, MinFOV, MaxFOV);
                cam.fieldOfView = Mathf.Lerp(cam.fieldOfView, targetFOV, Time.deltaTime * 2f);
            }
        }
    }
    
    // Camera shake effect
    public void Shake(float duration, float magnitude)
    {
        StartCoroutine(ShakeCoroutine(duration, magnitude));
    }
    
    private System.Collections.IEnumerator ShakeCoroutine(float duration, float magnitude)
    {
        float elapsed = 0f;
        
        while (elapsed < duration)
        {
            float x = Random.Range(-1f, 1f) * magnitude;
            float y = Random.Range(-1f, 1f) * magnitude;
            
            Offset += new Vector3(x, y, 0);
            
            elapsed += Time.deltaTime;
            magnitude *= 0.9f; // Decay
            
            yield return null;
        }
    }
}
