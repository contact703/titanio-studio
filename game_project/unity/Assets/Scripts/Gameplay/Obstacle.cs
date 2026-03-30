using UnityEngine;
using SlimeSurge.Player;

namespace SlimeSurge.Gameplay
{
    public class Obstacle : MonoBehaviour, ICollectible
    {
        [Header("Settings")]
        public float DamageAmount = 0.3f;
        public bool DestroyOnHit = false;
        
        [Header("Visual")]
        public float ScaleMultiplier = 1f;
        
        [Header("Effects")]
        public ParticleSystem HitParticles;
        public AudioClip HitSound;
        
        private bool hasHit = false;
        
        public void Collect(PlayerController player)
        {
            if (hasHit) return;
            
            // Compare sizes - if player is bigger, absorb obstacle
            float obstacleSize = transform.localScale.magnitude * ScaleMultiplier;
            
            if (player.CurrentSize > obstacleSize * 1.5f)
            {
                // Player absorbs obstacle
                player.Absorb(DamageAmount * 0.5f);
                DestroyObstacle();
            }
            else
            {
                // Obstacle damages player
                hasHit = true;
                player.TakeDamage(DamageAmount);
                
                if (HitParticles != null)
                {
                    HitParticles.Play();
                }
                
                if (HitSound != null)
                {
                    AudioSource.PlayClipAtPoint(HitSound, transform.position);
                }
                
                if (DestroyOnHit)
                {
                    DestroyObstacle();
                }
            }
        }
        
        private void DestroyObstacle()
        {
            if (HitParticles != null)
            {
                HitParticles.transform.parent = null;
                HitParticles.Play();
                Destroy(HitParticles.gameObject, 2f);
            }
            
            Destroy(gameObject);
        }
    }
}
