using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine.SceneManagement;

/// <summary>
/// POLISHED GAME SETUP - Creates complete, market-ready game scene
/// All juice effects, beautiful visuals, professional polish
/// </summary>
public class PolishedGameSetup : EditorWindow
{
    [MenuItem("Slime Surge/🎮 Create POLISHED Game", false, 0)]
    public static void CreatePolishedGame()
    {
        // Create new scene
        Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        
        Debug.Log("🎮 Creating SLIME SURGE - Polished Edition...");
        
        // === LIGHTING ===
        CreateLighting();
        
        // === PLAYER ===
        GameObject player = CreatePolishedPlayer();
        
        // === CAMERA ===
        Camera cam = CreatePolishedCamera(player.transform);
        
        // === MANAGERS ===
        CreateManagers(player);
        
        // === ENVIRONMENT ===
        CreateEnvironment();
        
        // === LEVEL GENERATOR ===
        CreateLevelGenerator();
        
        // Save scene
        string scenePath = "Assets/Scenes/SlimeSurgePolished.unity";
        System.IO.Directory.CreateDirectory(System.IO.Path.GetDirectoryName(Application.dataPath + "/../" + scenePath));
        EditorSceneManager.SaveScene(scene, scenePath);
        
        Debug.Log("✅ POLISHED GAME CREATED! Scene saved to: " + scenePath);
        Debug.Log("▶️ Press PLAY to test!");
    }
    
    static void CreateLighting()
    {
        // Directional light (sun)
        GameObject sun = new GameObject("Sun");
        Light sunLight = sun.AddComponent<Light>();
        sunLight.type = LightType.Directional;
        sunLight.color = new Color(1f, 0.95f, 0.85f);
        sunLight.intensity = 1.2f;
        sunLight.shadows = LightShadows.Soft;
        sun.transform.rotation = Quaternion.Euler(50, -30, 0);
        
        // Ambient lighting
        RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Trilight;
        RenderSettings.ambientSkyColor = new Color(0.6f, 0.8f, 1f);
        RenderSettings.ambientEquatorColor = new Color(0.4f, 0.6f, 0.8f);
        RenderSettings.ambientGroundColor = new Color(0.3f, 0.4f, 0.5f);
        
        // Fog for depth
        RenderSettings.fog = true;
        RenderSettings.fogMode = FogMode.Linear;
        RenderSettings.fogColor = new Color(0.7f, 0.85f, 1f);
        RenderSettings.fogStartDistance = 30f;
        RenderSettings.fogEndDistance = 100f;
        
        // Skybox color
        Camera.main?.gameObject.AddComponent<Camera>(); // Ensure camera exists
        RenderSettings.skybox = null;
        Camera tempCam = Camera.main;
        if (tempCam != null)
        {
            tempCam.clearFlags = CameraClearFlags.SolidColor;
            tempCam.backgroundColor = new Color(0.5f, 0.75f, 1f);
        }
    }
    
    static GameObject CreatePolishedPlayer()
    {
        // Main slime body
        GameObject player = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        player.name = "Slime";
        player.tag = "Player";
        player.transform.position = new Vector3(0, 1, 0);
        
        // Material
        Renderer rend = player.GetComponent<Renderer>();
        Material slimeMat = new Material(Shader.Find("Standard"));
        slimeMat.color = new Color(0.2f, 0.9f, 0.4f);
        slimeMat.SetFloat("_Metallic", 0.1f);
        slimeMat.SetFloat("_Smoothness", 0.9f);
        
        // Emission for glow
        slimeMat.EnableKeyword("_EMISSION");
        slimeMat.SetColor("_EmissionColor", new Color(0.1f, 0.4f, 0.15f));
        
        rend.material = slimeMat;
        rend.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.On;
        rend.receiveShadows = true;
        
        // Controller
        SlimeController controller = player.AddComponent<SlimeController>();
        controller.baseColor = new Color(0.2f, 0.9f, 0.4f);
        
        // Rigidbody
        Rigidbody rb = player.GetComponent<Rigidbody>();
        if (rb == null) rb = player.AddComponent<Rigidbody>();
        rb.useGravity = false;
        rb.constraints = RigidbodyConstraints.FreezeRotation | RigidbodyConstraints.FreezePositionY;
        rb.interpolation = RigidbodyInterpolation.Interpolate;
        
        // Shadow blob beneath
        GameObject shadow = GameObject.CreatePrimitive(PrimitiveType.Quad);
        shadow.name = "Shadow";
        shadow.transform.SetParent(player.transform);
        shadow.transform.localPosition = new Vector3(0, -0.9f, 0);
        shadow.transform.localRotation = Quaternion.Euler(90, 0, 0);
        shadow.transform.localScale = Vector3.one * 1.5f;
        Destroy(shadow.GetComponent<Collider>());
        
        Material shadowMat = new Material(Shader.Find("Sprites/Default"));
        shadowMat.color = new Color(0, 0, 0, 0.3f);
        shadow.GetComponent<Renderer>().material = shadowMat;
        
        return player;
    }
    
    static Camera CreatePolishedCamera(Transform target)
    {
        GameObject camObj = new GameObject("Main Camera");
        camObj.tag = "MainCamera";
        
        Camera cam = camObj.AddComponent<Camera>();
        cam.clearFlags = CameraClearFlags.SolidColor;
        cam.backgroundColor = new Color(0.5f, 0.75f, 1f);
        cam.fieldOfView = 60f;
        cam.nearClipPlane = 0.1f;
        cam.farClipPlane = 200f;
        
        camObj.AddComponent<AudioListener>();
        
        // Position
        camObj.transform.position = target.position + new Vector3(0, 8, -10);
        camObj.transform.LookAt(target.position + Vector3.forward * 5f);
        
        // Smooth camera controller
        SmoothCamera smoothCam = camObj.AddComponent<SmoothCamera>();
        smoothCam.target = target;
        
        return cam;
    }
    
    static void CreateManagers(GameObject player)
    {
        // Game Managers object
        GameObject managers = new GameObject("Managers");
        
        // Juice Manager
        JuiceManager juice = managers.AddComponent<JuiceManager>();
        
        // UI
        PolishedUI ui = managers.AddComponent<PolishedUI>();
        ui.player = player.GetComponent<SlimeController>();
    }
    
    static void CreateEnvironment()
    {
        // Starting platform
        GameObject startPlatform = GameObject.CreatePrimitive(PrimitiveType.Cube);
        startPlatform.name = "StartPlatform";
        startPlatform.transform.position = new Vector3(0, -0.25f, -5f);
        startPlatform.transform.localScale = new Vector3(6f, 0.5f, 15f);
        
        Material platformMat = new Material(Shader.Find("Standard"));
        platformMat.color = new Color(0.3f, 0.6f, 0.9f);
        startPlatform.GetComponent<Renderer>().material = platformMat;
        
        // Side rails
        CreateRail(-3.2f, -5f, 15f);
        CreateRail(3.2f, -5f, 15f);
    }
    
    static void CreateRail(float xPos, float zPos, float length)
    {
        GameObject rail = GameObject.CreatePrimitive(PrimitiveType.Cube);
        rail.name = "Rail";
        rail.transform.position = new Vector3(xPos, 0.25f, zPos + length / 2);
        rail.transform.localScale = new Vector3(0.3f, 1f, length);
        
        Material railMat = new Material(Shader.Find("Standard"));
        railMat.color = new Color(0.4f, 0.4f, 0.5f);
        railMat.SetFloat("_Metallic", 0.8f);
        railMat.SetFloat("_Smoothness", 0.5f);
        rail.GetComponent<Renderer>().material = railMat;
    }
    
    static void CreateLevelGenerator()
    {
        GameObject levelGen = new GameObject("LevelGenerator");
        InfiniteLevelGenerator gen = levelGen.AddComponent<InfiniteLevelGenerator>();
        
        // Beautiful track colors
        gen.trackColor1 = new Color(0.3f, 0.55f, 0.85f);
        gen.trackColor2 = new Color(0.25f, 0.5f, 0.8f);
        
        // Collectible colors (vibrant)
        gen.collectibleColors = new Color[] {
            new Color(1f, 0.85f, 0.2f),   // Gold
            new Color(0.3f, 1f, 0.5f),    // Green
            new Color(1f, 0.4f, 0.7f),    // Pink
            new Color(0.4f, 0.85f, 1f),   // Cyan
            new Color(1f, 0.5f, 0.2f),    // Orange
        };
    }
    
    [MenuItem("Slime Surge/📱 Build Android APK", false, 10)]
    public static void BuildAndroid()
    {
        // Ensure scene is saved
        EditorSceneManager.SaveOpenScenes();
        
        // Build settings
        BuildPlayerOptions buildOptions = new BuildPlayerOptions();
        buildOptions.scenes = new[] { "Assets/Scenes/SlimeSurgePolished.unity" };
        buildOptions.locationPathName = "Builds/SlimeSurge.apk";
        buildOptions.target = BuildTarget.Android;
        buildOptions.options = BuildOptions.None;
        
        // Ensure builds folder exists
        System.IO.Directory.CreateDirectory(Application.dataPath + "/../Builds");
        
        // Build
        Debug.Log("📱 Building Android APK...");
        var report = BuildPipeline.BuildPlayer(buildOptions);
        
        if (report.summary.result == UnityEditor.Build.Reporting.BuildResult.Succeeded)
        {
            Debug.Log("✅ APK built successfully: Builds/SlimeSurge.apk");
            EditorUtility.RevealInFinder(Application.dataPath + "/../Builds/SlimeSurge.apk");
        }
        else
        {
            Debug.LogError("❌ Build failed: " + report.summary.totalErrors + " errors");
        }
    }
    
    [MenuItem("Slime Surge/💻 Build PC (Windows)", false, 11)]
    public static void BuildWindows()
    {
        EditorSceneManager.SaveOpenScenes();
        
        BuildPlayerOptions buildOptions = new BuildPlayerOptions();
        buildOptions.scenes = new[] { "Assets/Scenes/SlimeSurgePolished.unity" };
        buildOptions.locationPathName = "Builds/Windows/SlimeSurge.exe";
        buildOptions.target = BuildTarget.StandaloneWindows64;
        buildOptions.options = BuildOptions.None;
        
        System.IO.Directory.CreateDirectory(Application.dataPath + "/../Builds/Windows");
        
        Debug.Log("💻 Building Windows build...");
        var report = BuildPipeline.BuildPlayer(buildOptions);
        
        if (report.summary.result == UnityEditor.Build.Reporting.BuildResult.Succeeded)
        {
            Debug.Log("✅ Windows build created: Builds/Windows/SlimeSurge.exe");
            EditorUtility.RevealInFinder(Application.dataPath + "/../Builds/Windows/SlimeSurge.exe");
        }
        else
        {
            Debug.LogError("❌ Build failed: " + report.summary.totalErrors + " errors");
        }
    }
    
    [MenuItem("Slime Surge/🍎 Build macOS", false, 12)]
    public static void BuildMac()
    {
        EditorSceneManager.SaveOpenScenes();
        
        BuildPlayerOptions buildOptions = new BuildPlayerOptions();
        buildOptions.scenes = new[] { "Assets/Scenes/SlimeSurgePolished.unity" };
        buildOptions.locationPathName = "Builds/macOS/SlimeSurge.app";
        buildOptions.target = BuildTarget.StandaloneOSX;
        buildOptions.options = BuildOptions.None;
        
        System.IO.Directory.CreateDirectory(Application.dataPath + "/../Builds/macOS");
        
        Debug.Log("🍎 Building macOS build...");
        var report = BuildPipeline.BuildPlayer(buildOptions);
        
        if (report.summary.result == UnityEditor.Build.Reporting.BuildResult.Succeeded)
        {
            Debug.Log("✅ macOS build created: Builds/macOS/SlimeSurge.app");
            EditorUtility.RevealInFinder(Application.dataPath + "/../Builds/macOS/SlimeSurge.app");
        }
        else
        {
            Debug.LogError("❌ Build failed: " + report.summary.totalErrors + " errors");
        }
    }
}
