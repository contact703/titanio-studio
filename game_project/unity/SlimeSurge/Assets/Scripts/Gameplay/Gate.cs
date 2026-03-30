using UnityEngine;

/// <summary>
/// GATE - Multiplier gate that changes player size
/// Good gates (green) multiply size, bad gates (red) divide
/// </summary>
public class Gate : MonoBehaviour
{
    public float multiplier = 2f;
    
    [Header("Visual")]
    public Color goodColor = new Color(0.2f, 0.9f, 0.4f);
    public Color badColor = new Color(0.9f, 0.3f, 0.3f);
    public Color neutralColor = new Color(0.5f, 0.5f, 0.5f);
    
    // References
    private Renderer[] renderers;
    private TextMesh textMesh;
    
    void Start()
    {
        UpdateVisual();
        CreateMultiplierText();
    }
    
    void CreateMultiplierText()
    {
        // Create 3D text to show multiplier
        GameObject textObj = new GameObject("MultiplierText");
        textObj.transform.SetParent(transform);
        textObj.transform.localPosition = new Vector3(0, 2f, 0);
        textObj.transform.localRotation = Quaternion.identity;
        
        textMesh = textObj.AddComponent<TextMesh>();
        textMesh.anchor = TextAnchor.MiddleCenter;
        textMesh.alignment = TextAlignment.Center;
        textMesh.fontSize = 48;
        textMesh.characterSize = 0.1f;
        textMesh.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        
        UpdateText();
    }
    
    void UpdateText()
    {
        if (textMesh == null) return;
        
        if (multiplier > 1f)
        {
            textMesh.text = "x" + multiplier.ToString("F1");
            textMesh.color = goodColor;
        }
        else if (multiplier < 1f)
        {
            textMesh.text = "÷" + (1f / multiplier).ToString("F1");
            textMesh.color = badColor;
        }
        else
        {
            textMesh.text = "x1";
            textMesh.color = neutralColor;
        }
    }
    
    public void UpdateVisual()
    {
        renderers = GetComponentsInChildren<Renderer>();
        
        Color gateColor = multiplier > 1f ? goodColor : (multiplier < 1f ? badColor : neutralColor);
        
        foreach (Renderer rend in renderers)
        {
            if (rend.GetComponent<TextMesh>() != null) continue;
            
            if (rend.material == null)
            {
                rend.material = new Material(Shader.Find("Standard"));
            }
            
            rend.material.color = gateColor;
            rend.material.SetFloat("_Metallic", 0.3f);
            rend.material.SetFloat("_Smoothness", 0.7f);
            
            // Add emission for glow
            rend.material.EnableKeyword("_EMISSION");
            rend.material.SetColor("_EmissionColor", gateColor * 0.3f);
        }
        
        UpdateText();
    }
    
    void OnTriggerEnter(Collider other)
    {
        SlimeController player = other.GetComponent<SlimeController>();
        if (player == null) player = other.GetComponentInParent<SlimeController>();
        
        if (player != null)
        {
            player.ApplyMultiplier(multiplier);
            
            // Trigger juice effect
            if (JuiceManager.Instance != null)
            {
                JuiceManager.Instance.OnGatePass(transform.position, multiplier);
            }
            
            // Animate gate
            StartCoroutine(GatePassAnimation());
        }
    }
    
    System.Collections.IEnumerator GatePassAnimation()
    {
        Vector3 originalScale = transform.localScale;
        float t = 0;
        
        // Expand briefly
        while (t < 0.2f)
        {
            t += Time.deltaTime;
            float scale = 1f + Mathf.Sin(t / 0.2f * Mathf.PI) * 0.3f;
            transform.localScale = originalScale * scale;
            yield return null;
        }
        
        transform.localScale = originalScale;
    }
}
