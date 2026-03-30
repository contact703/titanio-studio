using UnityEngine;
using SlimeSurge.Core;

namespace SlimeSurge.Player
{
    public class PlayerController : MonoBehaviour
    {
        [Header("Movement")]
        public float ForwardSpeed = 8f;
        public float HorizontalSpeed = 10f;
        public float LaneWidth = 2f;
        
        [Header("Size")]
        public float CurrentSize = 1f;
        public float MinSize = 0.3f;
        public float MaxSize = 5f;
        public float SizeChangeSpeed = 5f;
        
        [Header("Visual")]
        public Transform SlimeVisual;
        public ParticleSystem AbsorbParticles;
        public ParticleSystem DamageParticles;
        
        [Header("Audio")]
        public AudioClip AbsorbSound;
        public AudioClip DamageSound;
        public AudioClip GrowSound;
        
        private Rigidbody rb;
        private AudioSource audioSource;
        private bool isRunning = false;
        private float targetXPosition = 0f;
        private float targetSize = 1f;
        
        // Events
        public delegate void SizeChanged(float newSize);
        public event SizeChanged OnSizeChanged;
        
        private void Awake()
        {
            rb = GetComponent<Rigidbody>();
            audioSource = GetComponent<AudioSource>();
            
            if (audioSource == null)
            {
                audioSource = gameObject.AddComponent<AudioSource>();
            }
        }
        
        private void Start()
        {
            UpdateVisualSize();
        }
        
        private void Update()
        {
            if (!isRunning) return;
            
            HandleInput();
            UpdateSize();
            UpdateVisualBounce();
        }
        
        private void FixedUpdate()
        {
            if (!isRunning) return;
            
            MoveForward();
            MoveHorizontal();
        }
        
        public void StartRunning()
        {
            isRunning = true;
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
                float screenX = touch.position.x / Screen.width;
                targetXPosition = Mathf.Lerp(-LaneWidth, LaneWidth, screenX);
            }
            // Mouse input (for PC/Editor)
            else if (Input.GetMouseButton(0))
            {
                float screenX = Input.mousePosition.x / Screen.width;
                targetXPosition = Mathf.Lerp(-LaneWidth, LaneWidth, screenX);
            }
            // Keyboard input
            else
            {
                float horizontal = Input.GetAxis("Horizontal");
                if (Mathf.Abs(horizontal) > 0.1f)
                {
                    targetXPosition += horizontal * HorizontalSpeed * Time.deltaTime;
                    targetXPosition = Mathf.Clamp(targetXPosition, -LaneWidth, LaneWidth);
                }
            }
        }
        
        private void MoveForward()
        {
            Vector3 velocity = rb.linearVelocity;
            velocity.z = ForwardSpeed;
            rb.linearVelocity = velocity;
        }
        
        private void MoveHorizontal()
        {
            Vector3 position = rb.position;
            position.x = Mathf.Lerp(position.x, targetXPosition, HorizontalSpeed * Time.fixedDeltaTime);
            position.x = Mathf.Clamp(position.x, -LaneWidth, LaneWidth);
            rb.MovePosition(position);
        }
        
        private void UpdateSize()
        {
            // Smooth size transition
            if (Mathf.Abs(CurrentSize - targetSize) > 0.01f)
            {
                CurrentSize = Mathf.Lerp(CurrentSize, targetSize, SizeChangeSpeed * Time.deltaTime);
                UpdateVisualSize();
                OnSizeChanged?.Invoke(CurrentSize);
            }
        }
        
        private void UpdateVisualSize()
        {
            if (SlimeVisual != null)
            {
                SlimeVisual.localScale = Vector3.one * CurrentSize;
            }
        }
        
        private void UpdateVisualBounce()
        {
            // Subtle bounce animation
            if (SlimeVisual != null)
            {
                float bounce = 1f + Mathf.Sin(Time.time * 8f) * 0.03f;
                Vector3 scale = SlimeVisual.localScale;
                scale.y = CurrentSize * bounce;
                scale.x = CurrentSize * (2f - bounce);
                scale.z = CurrentSize * (2f - bounce);
                SlimeVisual.localScale = scale;
            }
        }
        
        public void Absorb(float sizeIncrease)
        {
            targetSize = Mathf.Min(CurrentSize + sizeIncrease, MaxSize);
            
            // Effects
            if (AbsorbParticles != null)
            {
                AbsorbParticles.Play();
            }
            
            PlaySound(AbsorbSound);
            
            // Squash and stretch
            StartCoroutine(SquashStretch());
        }
        
        public void TakeDamage(float sizeLoss)
        {
            targetSize = Mathf.Max(CurrentSize - sizeLoss, 0);
            
            // Effects
            if (DamageParticles != null)
            {
                DamageParticles.Play();
            }
            
            PlaySound(DamageSound);
            
            // Check death
            if (targetSize <= MinSize)
            {
                Die();
            }
        }
        
        public void MultiplySize(float multiplier)
        {
            targetSize = Mathf.Clamp(CurrentSize * multiplier, MinSize, MaxSize);
            PlaySound(GrowSound);
            StartCoroutine(SquashStretch());
        }
        
        public void AddSize(float amount)
        {
            targetSize = Mathf.Clamp(CurrentSize + amount, MinSize, MaxSize);
            PlaySound(amount > 0 ? GrowSound : DamageSound);
        }
        
        private void Die()
        {
            isRunning = false;
            GameManager.Instance?.GameOver();
        }
        
        private void PlaySound(AudioClip clip)
        {
            if (audioSource != null && clip != null)
            {
                audioSource.PlayOneShot(clip);
            }
        }
        
        private System.Collections.IEnumerator SquashStretch()
        {
            // Quick squash and stretch effect
            float duration = 0.15f;
            float elapsed = 0f;
            
            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / duration;
                
                // Squash then stretch
                float squash = 1f + Mathf.Sin(t * Mathf.PI) * 0.2f;
                
                if (SlimeVisual != null)
                {
                    Vector3 scale = Vector3.one * CurrentSize;
                    scale.y *= squash;
                    scale.x *= (2f - squash);
                    scale.z *= (2f - squash);
                    SlimeVisual.localScale = scale;
                }
                
                yield return null;
            }
        }
        
        private void OnTriggerEnter(Collider other)
        {
            // Handle collisions with collectibles, obstacles, gates
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
}
