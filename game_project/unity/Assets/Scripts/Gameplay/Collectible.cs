using UnityEngine;
using SlimeSurge.Player;
using SlimeSurge.Core;

namespace SlimeSurge.Gameplay
{
    public class Collectible : MonoBehaviour, ICollectible
    {
        [Header("Settings")]
        public CollectibleType Type = CollectibleType.Coin;
        public float SizeValue = 0.1f;
        public int CoinValue = 10;
        
        [Header("Visual")]
        public float RotationSpeed = 90f;
        public float BobSpeed = 2f;
        public float BobAmount = 0.1f;
        
        [Header("Effects")]
        public ParticleSystem CollectParticles;
        public AudioClip CollectSound;
        
        private Vector3 startPosition;
        private AudioSource audioSource;
        
        private void Start()
        {
            startPosition = transform.position;
            audioSource = GetComponent<AudioSource>();
        }
        
        private void Update()
        {
            // Rotate
            transform.Rotate(Vector3.up, RotationSpeed * Time.deltaTime);
            
            // Bob up and down
            Vector3 pos = startPosition;
            pos.y += Mathf.Sin(Time.time * BobSpeed) * BobAmount;
            transform.position = pos;
        }
        
        public void Collect(PlayerController player)
        {
            // Apply effect based on type
            switch (Type)
            {
                case CollectibleType.Coin:
                    GameManager.Instance?.AddCoins(CoinValue);
                    break;
                    
                case CollectibleType.SizeUp:
                    player.Absorb(SizeValue);
                    break;
                    
                case CollectibleType.Gem:
                    GameManager.Instance?.AddCoins(CoinValue);
                    player.Absorb(SizeValue);
                    break;
            }
            
            // Effects
            if (CollectParticles != null)
            {
                CollectParticles.transform.parent = null;
                CollectParticles.Play();
                Destroy(CollectParticles.gameObject, 2f);
            }
            
            if (audioSource != null && CollectSound != null)
            {
                AudioSource.PlayClipAtPoint(CollectSound, transform.position);
            }
            
            // Destroy
            Destroy(gameObject);
        }
    }
    
    public enum CollectibleType
    {
        Coin,
        SizeUp,
        Gem,
        Star,
        Fruit
    }
}
