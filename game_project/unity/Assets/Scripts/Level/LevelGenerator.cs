using UnityEngine;
using System.Collections.Generic;

namespace SlimeSurge.Level
{
    public class LevelGenerator : MonoBehaviour
    {
        [Header("Prefabs")]
        public GameObject PlatformPrefab;
        public GameObject[] CollectiblePrefabs;
        public GameObject[] ObstaclePrefabs;
        public GameObject[] GatePrefabs;
        public GameObject BossPrefab;
        
        [Header("Level Settings")]
        public float PlatformLength = 10f;
        public int TotalPlatforms = 20;
        public float LaneWidth = 1.5f;
        public int LanesCount = 3;
        
        [Header("Spawn Settings")]
        public float CollectibleChance = 0.3f;
        public float ObstacleChance = 0.15f;
        public float GateInterval = 5f; // Every N platforms
        
        [Header("Difficulty")]
        public float DifficultyMultiplier = 1f;
        public float DifficultyIncreasePerLevel = 0.1f;
        
        private List<GameObject> spawnedObjects = new List<GameObject>();
        
        private void Start()
        {
            GenerateLevel();
        }
        
        public void GenerateLevel()
        {
            ClearLevel();
            
            float currentZ = 0f;
            
            for (int i = 0; i < TotalPlatforms; i++)
            {
                // Spawn platform
                if (PlatformPrefab != null)
                {
                    GameObject platform = Instantiate(
                        PlatformPrefab, 
                        new Vector3(0, 0, currentZ), 
                        Quaternion.identity
                    );
                    platform.transform.parent = transform;
                    spawnedObjects.Add(platform);
                }
                
                // Spawn content on platform (skip first few)
                if (i > 2)
                {
                    SpawnPlatformContent(currentZ, i);
                }
                
                currentZ += PlatformLength;
            }
            
            // Spawn boss at end
            if (BossPrefab != null)
            {
                GameObject boss = Instantiate(
                    BossPrefab,
                    new Vector3(0, 0, currentZ + 5f),
                    Quaternion.identity
                );
                boss.transform.parent = transform;
                spawnedObjects.Add(boss);
            }
        }
        
        private void SpawnPlatformContent(float z, int platformIndex)
        {
            // Check if this is a gate platform
            if (platformIndex % (int)GateInterval == 0 && GatePrefabs.Length > 0)
            {
                SpawnGate(z);
                return; // Don't spawn other stuff on gate platforms
            }
            
            // Spawn collectibles and obstacles
            for (int lane = 0; lane < LanesCount; lane++)
            {
                float x = GetLanePosition(lane);
                
                float random = Random.value;
                
                if (random < CollectibleChance && CollectiblePrefabs.Length > 0)
                {
                    SpawnCollectible(x, z);
                }
                else if (random < CollectibleChance + ObstacleChance * DifficultyMultiplier 
                         && ObstaclePrefabs.Length > 0)
                {
                    SpawnObstacle(x, z);
                }
            }
        }
        
        private void SpawnCollectible(float x, float z)
        {
            GameObject prefab = CollectiblePrefabs[Random.Range(0, CollectiblePrefabs.Length)];
            Vector3 position = new Vector3(x, 0.5f, z + Random.Range(0f, PlatformLength * 0.8f));
            
            GameObject obj = Instantiate(prefab, position, Quaternion.identity);
            obj.transform.parent = transform;
            spawnedObjects.Add(obj);
        }
        
        private void SpawnObstacle(float x, float z)
        {
            GameObject prefab = ObstaclePrefabs[Random.Range(0, ObstaclePrefabs.Length)];
            Vector3 position = new Vector3(x, 0.3f, z + Random.Range(2f, PlatformLength - 2f));
            
            GameObject obj = Instantiate(prefab, position, Quaternion.identity);
            obj.transform.parent = transform;
            spawnedObjects.Add(obj);
        }
        
        private void SpawnGate(float z)
        {
            // Spawn two gates side by side - one good, one bad
            float[] lanePositions = { -LaneWidth * 0.75f, LaneWidth * 0.75f };
            
            for (int i = 0; i < 2; i++)
            {
                GameObject prefab = GatePrefabs[Random.Range(0, GatePrefabs.Length)];
                Vector3 position = new Vector3(lanePositions[i], 0, z + PlatformLength * 0.5f);
                
                GameObject obj = Instantiate(prefab, position, Quaternion.identity);
                obj.transform.parent = transform;
                
                // Configure gate (randomize values)
                Gameplay.Gate gate = obj.GetComponent<Gameplay.Gate>();
                if (gate != null)
                {
                    if (i == 0) // Good gate
                    {
                        gate.Operation = Gameplay.GateOperation.Multiply;
                        gate.Value = Random.Range(1.5f, 3f);
                    }
                    else // Bad gate
                    {
                        gate.Operation = Gameplay.GateOperation.Divide;
                        gate.Value = Random.Range(1.5f, 2.5f);
                    }
                }
                
                spawnedObjects.Add(obj);
            }
        }
        
        private float GetLanePosition(int lane)
        {
            float laneOffset = LaneWidth * 2f / (LanesCount - 1);
            return -LaneWidth + lane * laneOffset;
        }
        
        public void ClearLevel()
        {
            foreach (GameObject obj in spawnedObjects)
            {
                if (obj != null)
                {
                    Destroy(obj);
                }
            }
            spawnedObjects.Clear();
        }
        
        public void SetDifficulty(int level)
        {
            DifficultyMultiplier = 1f + (level - 1) * DifficultyIncreasePerLevel;
        }
    }
}
