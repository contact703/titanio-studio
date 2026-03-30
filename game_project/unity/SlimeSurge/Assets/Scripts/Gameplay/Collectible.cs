using UnityEngine;

public class Collectible : MonoBehaviour, ICollectible
{
    [Header("Settings")]
    public float SizeValue = 0.1f;
    public int CoinValue = 1;
    
    [Header("Effects")]
    public bool DestroyOnCollect = true;
    
    private bool collected = false;
    
    public void Collect(PlayerController player)
    {
        if (collected) return;
        collected = true;
        
        // Give size boost
        player.Absorb(SizeValue);
        
        // Destroy with effect
        if (DestroyOnCollect)
        {
            // Quick scale down
            StartCoroutine(CollectAnimation());
        }
    }
    
    private System.Collections.IEnumerator CollectAnimation()
    {
        float duration = 0.15f;
        float elapsed = 0f;
        Vector3 startScale = transform.localScale;
        Vector3 startPos = transform.position;
        
        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            float t = elapsed / duration;
            
            // Scale down and move up
            transform.localScale = startScale * (1f - t);
            transform.position = startPos + Vector3.up * t * 0.5f;
            
            yield return null;
        }
        
        Destroy(gameObject);
    }
}
