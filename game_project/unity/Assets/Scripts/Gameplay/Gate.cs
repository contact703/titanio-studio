using UnityEngine;
using TMPro;
using SlimeSurge.Player;

namespace SlimeSurge.Gameplay
{
    public class Gate : MonoBehaviour, ICollectible
    {
        [Header("Gate Settings")]
        public GateOperation Operation = GateOperation.Multiply;
        public float Value = 2f;
        
        [Header("Visual")]
        public TextMeshPro DisplayText;
        public Renderer GateRenderer;
        public Color PositiveColor = new Color(0.2f, 0.9f, 0.4f);
        public Color NegativeColor = new Color(0.9f, 0.3f, 0.3f);
        
        [Header("Effects")]
        public ParticleSystem PassParticles;
        public AudioClip PassSound;
        
        private bool hasBeenUsed = false;
        
        private void Start()
        {
            UpdateVisual();
        }
        
        private void UpdateVisual()
        {
            // Update text
            if (DisplayText != null)
            {
                string prefix = "";
                switch (Operation)
                {
                    case GateOperation.Multiply:
                        prefix = "×";
                        break;
                    case GateOperation.Divide:
                        prefix = "÷";
                        break;
                    case GateOperation.Add:
                        prefix = "+";
                        break;
                    case GateOperation.Subtract:
                        prefix = "-";
                        break;
                }
                DisplayText.text = prefix + Value.ToString("0.#");
            }
            
            // Update color
            if (GateRenderer != null)
            {
                bool isPositive = (Operation == GateOperation.Multiply && Value > 1) ||
                                  (Operation == GateOperation.Divide && Value < 1) ||
                                  (Operation == GateOperation.Add) ||
                                  (Operation == GateOperation.Subtract && Value < 0);
                
                Material mat = GateRenderer.material;
                mat.color = isPositive ? PositiveColor : NegativeColor;
            }
        }
        
        public void Collect(PlayerController player)
        {
            if (hasBeenUsed) return;
            hasBeenUsed = true;
            
            // Apply gate effect
            switch (Operation)
            {
                case GateOperation.Multiply:
                    player.MultiplySize(Value);
                    break;
                case GateOperation.Divide:
                    player.MultiplySize(1f / Value);
                    break;
                case GateOperation.Add:
                    player.AddSize(Value);
                    break;
                case GateOperation.Subtract:
                    player.AddSize(-Value);
                    break;
            }
            
            // Effects
            if (PassParticles != null)
            {
                PassParticles.Play();
            }
            
            if (PassSound != null)
            {
                AudioSource.PlayClipAtPoint(PassSound, transform.position);
            }
            
            // Visual feedback - make gate transparent
            if (GateRenderer != null)
            {
                Color c = GateRenderer.material.color;
                c.a = 0.3f;
                GateRenderer.material.color = c;
            }
        }
    }
    
    public enum GateOperation
    {
        Multiply,
        Divide,
        Add,
        Subtract
    }
}
