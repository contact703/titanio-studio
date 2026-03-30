using UnityEngine;

namespace SlimeSurge.Camera
{
    public class CameraFollow : MonoBehaviour
    {
        [Header("Target")]
        public Transform Target;
        
        [Header("Offset")]
        public Vector3 Offset = new Vector3(0, 5, -8);
        public Vector3 LookOffset = new Vector3(0, 0, 5);
        
        [Header("Smoothing")]
        public float SmoothSpeed = 5f;
        public float RotationSmoothSpeed = 3f;
        
        [Header("Shake")]
        public float ShakeIntensity = 0.1f;
        public float ShakeDuration = 0.1f;
        
        private Vector3 currentVelocity;
        private float shakeTimer = 0f;
        private Vector3 shakeOffset;
        
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
            
            // Apply shake
            if (shakeTimer > 0)
            {
                shakeTimer -= Time.deltaTime;
                shakeOffset = Random.insideUnitSphere * ShakeIntensity;
            }
            else
            {
                shakeOffset = Vector3.Lerp(shakeOffset, Vector3.zero, Time.deltaTime * 10f);
            }
            
            transform.position = smoothedPosition + shakeOffset;
            
            // Look at target
            Vector3 lookTarget = Target.position + LookOffset;
            Quaternion targetRotation = Quaternion.LookRotation(lookTarget - transform.position);
            transform.rotation = Quaternion.Slerp(
                transform.rotation, 
                targetRotation, 
                RotationSmoothSpeed * Time.deltaTime
            );
        }
        
        public void Shake()
        {
            shakeTimer = ShakeDuration;
        }
        
        public void Shake(float intensity, float duration)
        {
            ShakeIntensity = intensity;
            ShakeDuration = duration;
            shakeTimer = duration;
        }
    }
}
