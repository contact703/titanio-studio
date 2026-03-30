using UnityEngine;
using System.Collections.Generic;

/// <summary>
/// INFINITE LEVEL GENERATOR - Procedural level with stages, pacing, and difficulty curve
/// Based on research: 1-2 problems at a time, natural pauses, visual journey
/// </summary>
public class InfiniteLevelGenerator : MonoBehaviour
{
    [Header("Track")]
    public float trackWidth = 6f;
    public float segmentLength = 20f;
    public int visibleSegments = 8;
    public Material trackMaterial;
    public Color trackColor1 = new Color(0.3f, 0.6f, 0.9f);
    public Color trackColor2 = new Color(0.2f, 0.5f, 0.8f);
    
    [Header("Collectibles")]
    public float collectibleSpawnChance = 0.4f;
    public float coinSpawnChance = 0.15f;
    public float collectibleHeight = 0.5f;
    public Color[] collectibleColors = new Color[] {
        new Color(1f, 0.8f, 0.2f),  // Gold
        new Color(0.3f, 1f, 0.4f),  // Green
        new Color(1f, 0.4f, 0.6f),  // Pink
        new Color(0.4f, 0.8f, 1f),  // Blue
    };
    
    [Header("Obstacles")]
    public float obstacleSpawnChance = 0.3f;
    public float obstacleHeight = 0.8f;
    public Color obstacleColor = new Color(0.9f, 0.2f, 0.2f);
    
    [Header("Gates")]
    public float gateSpawnChance = 0.15f;
    public float gateWidth = 2f;
    public float gateHeight = 3f;
    
    [Header("Difficulty")]
    public float baseDifficulty = 0.3f;
    public float maxDifficulty = 0.8f;
    public float difficultyIncreasePerSegment = 0.01f;
    
    [Header("Stages")]
    public int segmentsPerStage = 10;
    public float stageBreathingRoom = 2; // Empty segments between stages
    
    [Header("Environment")]
    public bool spawnClouds = true;
    public float cloudHeight = 8f;
    public float cloudSpawnChance = 0.3f;
    
    // Pool
    private List<GameObject> activeSegments = new List<GameObject>();
    private Queue<GameObject> segmentPool = new Queue<GameObject>();
    private Queue<GameObject> collectiblePool = new Queue<GameObject>();
    private Queue<GameObject> obstaclePool = new Queue<GameObject>();
    private Queue<GameObject> gatePool = new Queue<GameObject>();
    private Queue<GameObject> cloudPool = new Queue<GameObject>();
    
    private Transform player;
    private float lastSpawnZ = 0f;
    private int currentSegmentIndex = 0;
    private int currentStage = 1;
    private float currentDifficulty;
    
    void Start()
    {
        player = FindObjectOfType<SlimeController>()?.transform;
        if (player == null) player = Camera.main?.transform;
        
        currentDifficulty = baseDifficulty;
        
        // Initialize pools
        InitializePools();
        
        // Spawn initial segments
        for (int i = 0; i < visibleSegments; i++)
        {
            SpawnSegment(i * segmentLength);
        }
        lastSpawnZ = (visibleSegments - 1) * segmentLength;
    }
    
    void InitializePools()
    {
        // Pre-create objects for pooling
        for (int i = 0; i < 15; i++)
        {
            segmentPool.Enqueue(CreateTrackSegment());
        }
        
        for (int i = 0; i < 50; i++)
        {
            collectiblePool.Enqueue(CreateCollectible());
            obstaclePool.Enqueue(CreateObstacle());
        }
        
        for (int i = 0; i < 10; i++)
        {
            gatePool.Enqueue(CreateGate());
            cloudPool.Enqueue(CreateCloud());
        }
    }
    
    GameObject CreateTrackSegment()
    {
        GameObject segment = new GameObject("TrackSegment");
        segment.SetActive(false);
        
        // Main track
        GameObject track = GameObject.CreatePrimitive(PrimitiveType.Cube);
        track.name = "Track";
        track.transform.SetParent(segment.transform);
        track.transform.localScale = new Vector3(trackWidth, 0.5f, segmentLength);
        track.transform.localPosition = new Vector3(0, -0.25f, segmentLength / 2);
        
        Renderer rend = track.GetComponent<Renderer>();
        if (trackMaterial != null)
        {
            rend.material = trackMaterial;
        }
        else
        {
            rend.material = new Material(Shader.Find("Standard"));
            rend.material.color = trackColor1;
        }
        
        // Rails
        CreateRail(segment.transform, -trackWidth / 2 - 0.2f);
        CreateRail(segment.transform, trackWidth / 2 + 0.2f);
        
        return segment;
    }
    
    void CreateRail(Transform parent, float xPos)
    {
        GameObject rail = GameObject.CreatePrimitive(PrimitiveType.Cube);
        rail.name = "Rail";
        rail.transform.SetParent(parent);
        rail.transform.localScale = new Vector3(0.3f, 1f, segmentLength);
        rail.transform.localPosition = new Vector3(xPos, 0.25f, segmentLength / 2);
        
        Renderer rend = rail.GetComponent<Renderer>();
        rend.material = new Material(Shader.Find("Standard"));
        rend.material.color = new Color(0.4f, 0.4f, 0.5f);
        rend.material.SetFloat("_Metallic", 0.8f);
        rend.material.SetFloat("_Smoothness", 0.5f);
    }
    
    GameObject CreateCollectible()
    {
        GameObject collectible = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        collectible.name = "Collectible";
        collectible.tag = "Collectible";
        collectible.transform.localScale = Vector3.one * 0.6f;
        collectible.SetActive(false);
        
        Renderer rend = collectible.GetComponent<Renderer>();
        rend.material = new Material(Shader.Find("Standard"));
        rend.material.color = collectibleColors[0];
        rend.material.SetFloat("_Metallic", 0.3f);
        rend.material.SetFloat("_Smoothness", 0.8f);
        
        // Add slight glow
        rend.material.EnableKeyword("_EMISSION");
        rend.material.SetColor("_EmissionColor", collectibleColors[0] * 0.3f);
        
        // Make trigger
        collectible.GetComponent<Collider>().isTrigger = true;
        
        // Add rotation script
        collectible.AddComponent<RotateAndBob>();
        
        return collectible;
    }
    
    GameObject CreateObstacle()
    {
        GameObject obstacle = new GameObject("Obstacle");
        obstacle.tag = "Obstacle";
        obstacle.SetActive(false);
        
        // Random obstacle type
        GameObject visual;
        int type = Random.Range(0, 3);
        
        switch (type)
        {
            case 0: // Cube
                visual = GameObject.CreatePrimitive(PrimitiveType.Cube);
                visual.transform.localScale = new Vector3(1.2f, obstacleHeight, 1.2f);
                break;
            case 1: // Cylinder
                visual = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                visual.transform.localScale = new Vector3(0.8f, obstacleHeight / 2, 0.8f);
                break;
            default: // Spike (stretched cube)
                visual = GameObject.CreatePrimitive(PrimitiveType.Cube);
                visual.transform.localScale = new Vector3(0.5f, obstacleHeight * 1.5f, 0.5f);
                visual.transform.localRotation = Quaternion.Euler(0, 45, 0);
                break;
        }
        
        visual.transform.SetParent(obstacle.transform);
        visual.transform.localPosition = Vector3.up * obstacleHeight / 2;
        
        Renderer rend = visual.GetComponent<Renderer>();
        rend.material = new Material(Shader.Find("Standard"));
        rend.material.color = obstacleColor;
        rend.material.SetFloat("_Metallic", 0.2f);
        
        // Add collider to parent
        BoxCollider col = obstacle.AddComponent<BoxCollider>();
        col.size = new Vector3(1f, obstacleHeight, 1f);
        col.center = Vector3.up * obstacleHeight / 2;
        col.isTrigger = true;
        
        // Add near miss trigger (larger invisible collider)
        GameObject nearMissTrigger = new GameObject("NearMissTrigger");
        nearMissTrigger.transform.SetParent(obstacle.transform);
        nearMissTrigger.transform.localPosition = Vector3.zero;
        BoxCollider nearMissCol = nearMissTrigger.AddComponent<BoxCollider>();
        nearMissCol.size = new Vector3(2.5f, obstacleHeight, 2.5f);
        nearMissCol.center = Vector3.up * obstacleHeight / 2;
        nearMissCol.isTrigger = true;
        nearMissTrigger.AddComponent<NearMissTrigger>();
        
        return obstacle;
    }
    
    GameObject CreateGate()
    {
        GameObject gate = new GameObject("Gate");
        gate.tag = "Gate";
        gate.SetActive(false);
        
        // Left post
        GameObject leftPost = GameObject.CreatePrimitive(PrimitiveType.Cube);
        leftPost.transform.SetParent(gate.transform);
        leftPost.transform.localScale = new Vector3(0.3f, gateHeight, 0.3f);
        leftPost.transform.localPosition = new Vector3(-gateWidth / 2, gateHeight / 2, 0);
        
        // Right post
        GameObject rightPost = GameObject.CreatePrimitive(PrimitiveType.Cube);
        rightPost.transform.SetParent(gate.transform);
        rightPost.transform.localScale = new Vector3(0.3f, gateHeight, 0.3f);
        rightPost.transform.localPosition = new Vector3(gateWidth / 2, gateHeight / 2, 0);
        
        // Top bar
        GameObject topBar = GameObject.CreatePrimitive(PrimitiveType.Cube);
        topBar.transform.SetParent(gate.transform);
        topBar.transform.localScale = new Vector3(gateWidth + 0.3f, 0.3f, 0.3f);
        topBar.transform.localPosition = new Vector3(0, gateHeight, 0);
        
        // Collider
        BoxCollider col = gate.AddComponent<BoxCollider>();
        col.size = new Vector3(gateWidth, gateHeight, 1f);
        col.center = Vector3.up * gateHeight / 2;
        col.isTrigger = true;
        
        // Gate script
        gate.AddComponent<Gate>();
        
        return gate;
    }
    
    GameObject CreateCloud()
    {
        GameObject cloud = new GameObject("Cloud");
        cloud.SetActive(false);
        
        // Multiple spheres for fluffy look
        int sphereCount = Random.Range(3, 6);
        for (int i = 0; i < sphereCount; i++)
        {
            GameObject sphere = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            sphere.transform.SetParent(cloud.transform);
            
            float scale = Random.Range(1f, 2f);
            sphere.transform.localScale = Vector3.one * scale;
            sphere.transform.localPosition = new Vector3(
                Random.Range(-1f, 1f),
                Random.Range(-0.3f, 0.3f),
                Random.Range(-0.5f, 0.5f)
            );
            
            Destroy(sphere.GetComponent<Collider>());
            
            Renderer rend = sphere.GetComponent<Renderer>();
            rend.material = new Material(Shader.Find("Standard"));
            rend.material.color = Color.white;
            rend.material.SetFloat("_Smoothness", 0.3f);
        }
        
        return cloud;
    }
    
    void Update()
    {
        if (player == null) return;
        
        // Spawn new segments ahead
        while (lastSpawnZ < player.position.z + visibleSegments * segmentLength)
        {
            lastSpawnZ += segmentLength;
            SpawnSegment(lastSpawnZ);
        }
        
        // Remove old segments
        for (int i = activeSegments.Count - 1; i >= 0; i--)
        {
            if (activeSegments[i].transform.position.z < player.position.z - segmentLength * 2)
            {
                RecycleSegment(activeSegments[i]);
                activeSegments.RemoveAt(i);
            }
        }
    }
    
    void SpawnSegment(float zPos)
    {
        currentSegmentIndex++;
        
        // Check for stage transition
        bool isBreathingRoom = false;
        if (currentSegmentIndex % segmentsPerStage == 0)
        {
            currentStage++;
            currentDifficulty = Mathf.Min(
                baseDifficulty + currentStage * 0.05f,
                maxDifficulty
            );
        }
        
        // Breathing room at stage transitions
        int segmentInStage = currentSegmentIndex % segmentsPerStage;
        if (segmentInStage < stageBreathingRoom || segmentInStage >= segmentsPerStage - 1)
        {
            isBreathingRoom = true;
        }
        
        // Get segment from pool
        GameObject segment = GetFromPool(segmentPool, CreateTrackSegment);
        segment.transform.position = new Vector3(0, 0, zPos);
        segment.SetActive(true);
        activeSegments.Add(segment);
        
        // Alternate track colors
        Renderer trackRend = segment.GetComponentInChildren<Renderer>();
        if (trackRend != null)
        {
            trackRend.material.color = (currentSegmentIndex / 5) % 2 == 0 ? trackColor1 : trackColor2;
        }
        
        // Spawn content based on difficulty and breathing room
        if (!isBreathingRoom)
        {
            SpawnSegmentContent(zPos);
        }
        else
        {
            // Only collectibles in breathing room
            SpawnCollectiblePattern(zPos, "reward");
        }
        
        // Environment
        if (spawnClouds && Random.value < cloudSpawnChance)
        {
            SpawnCloud(zPos);
        }
    }
    
    void SpawnSegmentContent(float zPos)
    {
        // Decide pattern based on difficulty
        float roll = Random.value;
        
        if (roll < obstacleSpawnChance * currentDifficulty)
        {
            SpawnObstaclePattern(zPos);
        }
        
        if (roll < gateSpawnChance)
        {
            SpawnGate(zPos + segmentLength / 2);
        }
        
        if (Random.value < collectibleSpawnChance)
        {
            SpawnCollectiblePattern(zPos, "normal");
        }
    }
    
    void SpawnObstaclePattern(float zPos)
    {
        // Research: 1-2 problems at a time
        int obstacleCount = Random.value < 0.7f ? 1 : 2;
        
        List<float> usedPositions = new List<float>();
        
        for (int i = 0; i < obstacleCount; i++)
        {
            float xPos;
            int attempts = 0;
            do
            {
                xPos = Random.Range(-trackWidth / 2 + 1f, trackWidth / 2 - 1f);
                attempts++;
            } while (usedPositions.Exists(x => Mathf.Abs(x - xPos) < 2f) && attempts < 10);
            
            usedPositions.Add(xPos);
            
            GameObject obstacle = GetFromPool(obstaclePool, CreateObstacle);
            obstacle.transform.position = new Vector3(
                xPos,
                0,
                zPos + Random.Range(5f, segmentLength - 5f)
            );
            obstacle.transform.SetParent(activeSegments[activeSegments.Count - 1].transform);
            obstacle.SetActive(true);
        }
    }
    
    void SpawnCollectiblePattern(float zPos, string patternType)
    {
        int count = patternType == "reward" ? 8 : Random.Range(3, 6);
        
        // Pattern types
        switch (patternType)
        {
            case "reward":
                // Line of collectibles
                for (int i = 0; i < count; i++)
                {
                    SpawnSingleCollectible(
                        0,
                        zPos + 2f + i * 2f
                    );
                }
                break;
                
            case "normal":
            default:
                // Random or curved pattern
                float startX = Random.Range(-trackWidth / 3, trackWidth / 3);
                float curve = Random.Range(-0.3f, 0.3f);
                
                for (int i = 0; i < count; i++)
                {
                    SpawnSingleCollectible(
                        startX + curve * i,
                        zPos + 3f + i * 3f
                    );
                }
                break;
        }
    }
    
    void SpawnSingleCollectible(float xPos, float zPos)
    {
        bool isCoin = Random.value < coinSpawnChance;
        
        GameObject collectible = GetFromPool(collectiblePool, CreateCollectible);
        collectible.transform.position = new Vector3(
            Mathf.Clamp(xPos, -trackWidth / 2 + 0.5f, trackWidth / 2 - 0.5f),
            collectibleHeight,
            zPos
        );
        collectible.transform.SetParent(activeSegments[activeSegments.Count - 1].transform);
        collectible.tag = isCoin ? "Coin" : "Collectible";
        
        // Set color
        Renderer rend = collectible.GetComponent<Renderer>();
        if (rend != null)
        {
            Color c = isCoin ? Color.yellow : collectibleColors[Random.Range(0, collectibleColors.Length)];
            rend.material.color = c;
            rend.material.SetColor("_EmissionColor", c * 0.3f);
        }
        
        collectible.SetActive(true);
    }
    
    void SpawnGate(float zPos)
    {
        GameObject gate = GetFromPool(gatePool, CreateGate);
        
        // Random position (left or right side for choice)
        float xPos = Random.value > 0.5f ? -1.5f : 1.5f;
        
        gate.transform.position = new Vector3(xPos, 0, zPos);
        gate.transform.SetParent(activeSegments[activeSegments.Count - 1].transform);
        
        // Set multiplier
        Gate gateScript = gate.GetComponent<Gate>();
        if (gateScript != null)
        {
            gateScript.multiplier = Random.value > 0.3f ? 
                Random.Range(1.5f, 2.5f) : // Good gate
                Random.Range(0.3f, 0.7f);  // Bad gate
            gateScript.UpdateVisual();
        }
        
        gate.SetActive(true);
    }
    
    void SpawnCloud(float zPos)
    {
        GameObject cloud = GetFromPool(cloudPool, CreateCloud);
        
        float xPos = Random.Range(-15f, 15f);
        float yPos = cloudHeight + Random.Range(-2f, 2f);
        
        cloud.transform.position = new Vector3(xPos, yPos, zPos + Random.Range(0, segmentLength));
        cloud.transform.localScale = Vector3.one * Random.Range(1f, 2f);
        cloud.SetActive(true);
        
        // Add to active segments for cleanup
        cloud.transform.SetParent(activeSegments[activeSegments.Count - 1].transform);
    }
    
    void RecycleSegment(GameObject segment)
    {
        segment.SetActive(false);
        segmentPool.Enqueue(segment);
        
        // Recycle children
        foreach (Transform child in segment.transform)
        {
            if (child.CompareTag("Collectible") || child.CompareTag("Coin"))
            {
                child.gameObject.SetActive(false);
                child.SetParent(null);
                collectiblePool.Enqueue(child.gameObject);
            }
            else if (child.CompareTag("Obstacle"))
            {
                child.gameObject.SetActive(false);
                child.SetParent(null);
                obstaclePool.Enqueue(child.gameObject);
            }
            else if (child.CompareTag("Gate"))
            {
                child.gameObject.SetActive(false);
                child.SetParent(null);
                gatePool.Enqueue(child.gameObject);
            }
        }
    }
    
    T GetFromPool<T>(Queue<T> pool, System.Func<T> creator) where T : Object
    {
        if (pool.Count > 0)
        {
            return pool.Dequeue();
        }
        return creator();
    }
    
    // Public getters
    public int CurrentStage => currentStage;
    public float CurrentDifficulty => currentDifficulty;
}

/// <summary>
/// Simple rotation and bobbing for collectibles
/// </summary>
public class RotateAndBob : MonoBehaviour
{
    public float rotateSpeed = 90f;
    public float bobSpeed = 2f;
    public float bobAmount = 0.2f;
    
    private Vector3 startPos;
    
    void Start()
    {
        startPos = transform.position;
    }
    
    void Update()
    {
        transform.Rotate(Vector3.up, rotateSpeed * Time.deltaTime);
        
        Vector3 pos = startPos;
        pos.y += Mathf.Sin(Time.time * bobSpeed) * bobAmount;
        transform.position = pos;
    }
    
    void OnEnable()
    {
        startPos = transform.position;
    }
}

/// <summary>
/// Near miss detection trigger
/// </summary>
public class NearMissTrigger : MonoBehaviour
{
    private bool playerInside = false;
    private SlimeController player;
    
    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player") || other.GetComponent<SlimeController>() != null)
        {
            playerInside = true;
            player = other.GetComponent<SlimeController>();
        }
    }
    
    void OnTriggerExit(Collider other)
    {
        if (playerInside && (other.CompareTag("Player") || other.GetComponent<SlimeController>() != null))
        {
            // Player passed through near miss zone without hitting obstacle
            if (player != null && player.IsAlive)
            {
                player.TriggerNearMiss(transform.position);
                
                if (JuiceManager.Instance != null)
                {
                    JuiceManager.Instance.OnNearMiss(transform.position, 1);
                }
            }
            playerInside = false;
        }
    }
}
