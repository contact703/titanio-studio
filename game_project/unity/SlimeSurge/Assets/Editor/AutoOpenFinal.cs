using UnityEditor;
using UnityEditor.SceneManagement;

[InitializeOnLoad]
public static class AutoOpenFinal
{
    static AutoOpenFinal()
    {
        EditorApplication.delayCall += () =>
        {
            if (!EditorApplication.isPlaying && !EditorApplication.isCompiling)
            {
                string scenePath = "Assets/Scenes/SlimeSurgeFinal.unity";
                if (System.IO.File.Exists(scenePath))
                {
                    EditorSceneManager.OpenScene(scenePath);
                    UnityEngine.Debug.Log("🎮 SLIME SURGE FINAL loaded! Press PLAY ▶️");
                }
            }
        };
    }
}
