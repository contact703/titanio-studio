using UnityEngine;

public class Obstacle : MonoBehaviour, ICollectible
{
    [Header("Settings")]
    public float DamageAmount = 0.3f;
    public bool CanBeAbsorbed = true;
    public float AbsorbSizeThreshold = 2f;
    
    private bool hasHit = false;
    
    public void Collect(PlayerController player)
    {
        if (hasHit) return;
        hasHit = true;
        
        // If player is big enough, absorb the obstacle
        if (CanBeAbsorbed && player.CurrentSize >= AbsorbSizeThreshold)
        {
            player.Absorb(DamageAmount * 0.3f);
            StartCoroutine(DestroyAnimation());
        }
        else
        {
            // Take damage
            player.TakeDamage(DamageAmount);
            StartCoroutine(HitAnimation());
        }
    }
    
    private System.Collections.IEnumerator DestroyAnimation()
    {
        float duration = 0.2f;
        float elapsed = 0f;
        Vector3 startScale = transform.localScale;
        
        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            float t = elapsed / duration;
            transform.localScale = startScale * (1f - t);
            yield return null;
        }
        
        Destroy(gameObject);
    }
    
    private System.Collections.IEnumerator HitAnimation()
    {
        // Flash and shake
        Renderer rend = GetComponent<Renderer>();
        Color originalColor = rend != null ? rend.material.color : Color.white;
        
        float duration = 0.3f;
        float elapsed = 0f;
        Vector3 originalPos = transform.position;
        
        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            float t = elapsed / duration;
            
            // Shake
            transform.position = originalPos + Random.insideUnitSphere * 0.1f * (1f - t);
            
            // Flash white
            if (rend != null)
            {
                rend.material.color = Color.Lerp(Color.white, originalColor, t);
            }
            
            yield return null;
        }
        
        transform.position = originalPos;
        if (rend != null) rend.material.color = originalColor;
    }
}
