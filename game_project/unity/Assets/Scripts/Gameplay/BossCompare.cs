using UnityEngine;
using SlimeSurge.Player;
using SlimeSurge.Core;

namespace SlimeSurge.Gameplay
{
    public class BossCompare : MonoBehaviour
    {
        [Header("Boss Settings")]
        public float BossSize = 3f;
        public Transform BossVisual;
        public Transform ComparePosition;
        
        [Header("Animation")]
        public float ComparisonDuration = 2f;
        public float ScaleAnimationSpeed = 2f;
        
        [Header("Effects")]
        public ParticleSystem WinParticles;
        public ParticleSystem LoseParticles;
        public AudioClip WinSound;
        public AudioClip LoseSound;
        
        private bool hasTriggered = false;
        private PlayerController player;
        
        private void OnTriggerEnter(Collider other)
        {
            if (hasTriggered) return;
            
            player = other.GetComponent<PlayerController>();
            if (player != null)
            {
                hasTriggered = true;
                StartCoroutine(ComparisonSequence());
            }
        }
        
        private System.Collections.IEnumerator ComparisonSequence()
        {
            // Stop player movement
            player.StopRunning();
            
            // Move player to compare position
            if (ComparePosition != null)
            {
                float moveTime = 0.5f;
                float elapsed = 0f;
                Vector3 startPos = player.transform.position;
                
                while (elapsed < moveTime)
                {
                    elapsed += Time.deltaTime;
                    float t = elapsed / moveTime;
                    player.transform.position = Vector3.Lerp(startPos, ComparePosition.position, t);
                    yield return null;
                }
            }
            
            // Animate comparison
            yield return new WaitForSeconds(0.5f);
            
            // Scale animation - both grow to show comparison
            float animTime = 0f;
            float targetPlayerScale = player.CurrentSize;
            float targetBossScale = BossSize;
            
            // Dramatic scale up
            while (animTime < 1f)
            {
                animTime += Time.deltaTime * ScaleAnimationSpeed;
                float t = Mathf.Sin(animTime * Mathf.PI * 0.5f); // Ease out
                
                if (BossVisual != null)
                {
                    BossVisual.localScale = Vector3.one * Mathf.Lerp(0, targetBossScale, t);
                }
                
                yield return null;
            }
            
            yield return new WaitForSeconds(0.5f);
            
            // Determine winner
            bool playerWins = player.CurrentSize >= BossSize;
            
            if (playerWins)
            {
                // Player wins!
                if (WinParticles != null) WinParticles.Play();
                if (WinSound != null) AudioSource.PlayClipAtPoint(WinSound, transform.position);
                
                // Shrink boss dramatically
                yield return ShrinkObject(BossVisual, 0.5f);
                
                yield return new WaitForSeconds(0.5f);
                
                GameManager.Instance?.Win();
            }
            else
            {
                // Player loses
                if (LoseParticles != null) LoseParticles.Play();
                if (LoseSound != null) AudioSource.PlayClipAtPoint(LoseSound, transform.position);
                
                // Shrink player
                yield return ShrinkObject(player.SlimeVisual, 0.5f);
                
                yield return new WaitForSeconds(0.5f);
                
                GameManager.Instance?.GameOver();
            }
        }
        
        private System.Collections.IEnumerator ShrinkObject(Transform obj, float duration)
        {
            if (obj == null) yield break;
            
            Vector3 startScale = obj.localScale;
            float elapsed = 0f;
            
            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / duration;
                obj.localScale = Vector3.Lerp(startScale, Vector3.zero, t);
                yield return null;
            }
        }
    }
}
