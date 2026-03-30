#!/usr/bin/env python3
import json
import urllib.request
import base64
import asyncio
import websockets

CDP_URL = "http://127.0.0.1:18800"

def get_pages():
    with urllib.request.urlopen(f"{CDP_URL}/json") as r:
        return json.loads(r.read())

async def investigate():
    print("=== INVESTIGAÇÃO PROFUNDA DO SITE ===\n")
    
    pages = get_pages()
    page = next((p for p in pages if p['type'] == 'page' and 'maricafilmcommission' in p.get('url', '')), None)
    
    if not page:
        print("Página não encontrada!")
        return
    
    print(f"Página: {page['url']}")
    print(f"Título: {page['title']}")
    
    ws_url = page['webSocketDebuggerUrl']
    
    async with websockets.connect(ws_url) as ws:
        msg_id = 1
        
        async def send_cmd(method, params=None):
            nonlocal msg_id
            cmd = {"id": msg_id, "method": method}
            if params:
                cmd["params"] = params
            await ws.send(json.dumps(cmd))
            msg_id += 1
            
            while True:
                response = json.loads(await ws.recv())
                if response.get("id") == msg_id - 1:
                    return response
        
        # 1. Verificar estado do DOM
        print("\n--- ESTADO DO DOM ---")
        result = await send_cmd("Runtime.evaluate", {
            "expression": """
                (function() {
                    return {
                        bodyLength: document.body.innerText.length,
                        bodyText: document.body.innerText.substring(0, 500),
                        linksCount: document.querySelectorAll('a').length,
                        scriptsTotal: document.querySelectorAll('script').length,
                        scriptsPending: document.querySelectorAll('script[type="litespeed/javascript"]').length,
                        imagesTotal: document.querySelectorAll('img').length,
                        imagesLoaded: Array.from(document.querySelectorAll('img')).filter(i => i.complete).length,
                        navMenu: document.querySelector('.elementor-nav-menu') ? 'encontrado' : 'não encontrado',
                        url: window.location.href
                    };
                })()
            """,
            "returnByValue": True
        })
        
        if result.get("result", {}).get("result", {}).get("value"):
            state = result["result"]["result"]["value"]
            print(f"Body length: {state.get('bodyLength')} chars")
            print(f"Links: {state.get('linksCount')}")
            print(f"Scripts total: {state.get('scriptsTotal')}")
            print(f"Scripts pendentes (litespeed): {state.get('scriptsPending')}")
            print(f"Imagens total/carregadas: {state.get('imagesTotal')}/{state.get('imagesLoaded')}")
            print(f"Menu nav: {state.get('navMenu')}")
            print(f"\nTexto inicial:\n{state.get('bodyText', '')[:300]}...")
        
        # 2. Capturar erros JavaScript
        print("\n--- ERROS JAVASCRIPT ---")
        result = await send_cmd("Runtime.evaluate", {
            "expression": """
                (function() {
                    // Verificar se há erros no window
                    var errors = [];
                    
                    // Verificar recursos que falharam
                    var failedResources = performance.getEntriesByType('resource')
                        .filter(r => r.transferSize === 0 && r.decodedBodySize === 0)
                        .map(r => r.name);
                    
                    return {
                        errors: errors,
                        failedResources: failedResources.slice(0, 10)
                    };
                })()
            """,
            "returnByValue": True
        })
        
        if result.get("result", {}).get("result", {}).get("value"):
            data = result["result"]["result"]["value"]
            print(f"Erros: {data.get('errors', [])}")
            print(f"Recursos falhados: {data.get('failedResources', [])}")
        
        # 3. Verificar se menu está clicável
        print("\n--- TESTANDO MENU ---")
        result = await send_cmd("Runtime.evaluate", {
            "expression": """
                (function() {
                    var menuItems = document.querySelectorAll('.elementor-nav-menu a, nav a, .menu a');
                    var items = [];
                    menuItems.forEach(function(a) {
                        var rect = a.getBoundingClientRect();
                        var style = window.getComputedStyle(a);
                        items.push({
                            text: a.textContent.trim().substring(0, 30),
                            href: a.href,
                            visible: rect.width > 0 && rect.height > 0,
                            display: style.display,
                            pointerEvents: style.pointerEvents
                        });
                    });
                    return items.slice(0, 10);
                })()
            """,
            "returnByValue": True
        })
        
        if result.get("result", {}).get("result", {}).get("value"):
            items = result["result"]["result"]["value"]
            for item in items:
                print(f"  - {item.get('text')}: visible={item.get('visible')}, display={item.get('display')}, pointerEvents={item.get('pointerEvents')}")
        
        # 4. Tirar screenshot
        print("\n--- SCREENSHOT ---")
        result = await send_cmd("Page.captureScreenshot", {"format": "png"})
        if result.get("result", {}).get("data"):
            img_data = base64.b64decode(result["result"]["data"])
            with open("/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/site-estado-atual.png", "wb") as f:
                f.write(img_data)
            print("Screenshot salvo: site-estado-atual.png")
        
        # 5. Verificar eventos de clique
        print("\n--- TESTANDO CLIQUE EM LOCATIONS ---")
        result = await send_cmd("Runtime.evaluate", {
            "expression": """
                (function() {
                    var links = Array.from(document.querySelectorAll('a'));
                    var locLink = links.find(a => 
                        a.textContent.toLowerCase().includes('location') ||
                        a.href.includes('/locations')
                    );
                    if (locLink) {
                        return {
                            found: true,
                            text: locLink.textContent.trim(),
                            href: locLink.href,
                            onclick: locLink.onclick ? 'has handler' : 'no handler',
                            listeners: typeof getEventListeners !== 'undefined' ? 'checking...' : 'unavailable'
                        };
                    }
                    return { found: false };
                })()
            """,
            "returnByValue": True
        })
        
        if result.get("result", {}).get("result", {}).get("value"):
            data = result["result"]["result"]["value"]
            print(f"Link locations: {data}")
        
        # 6. Tentar navegar clicando
        print("\n--- NAVEGANDO PARA LOCATIONS ---")
        
        # Primeiro, simular clique
        result = await send_cmd("Runtime.evaluate", {
            "expression": """
                (function() {
                    var links = Array.from(document.querySelectorAll('a'));
                    var locLink = links.find(a => 
                        a.textContent.toLowerCase().includes('location') ||
                        a.href.includes('/locations')
                    );
                    if (locLink) {
                        locLink.click();
                        return 'clicked: ' + locLink.href;
                    }
                    return 'link not found';
                })()
            """,
            "returnByValue": True
        })
        print(f"Resultado do clique: {result.get('result', {}).get('result', {}).get('value')}")
        
        # Esperar um pouco
        await asyncio.sleep(3)
        
        # Verificar se navegou
        result = await send_cmd("Runtime.evaluate", {
            "expression": "window.location.href",
            "returnByValue": True
        })
        print(f"URL após clique: {result.get('result', {}).get('result', {}).get('value')}")
        
        # Screenshot após tentativa de navegação
        result = await send_cmd("Page.captureScreenshot", {"format": "png"})
        if result.get("result", {}).get("data"):
            img_data = base64.b64decode(result["result"]["data"])
            with open("/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/site-apos-clique.png", "wb") as f:
                f.write(img_data)
            print("Screenshot após clique: site-apos-clique.png")
        
        print("\n=== FIM INVESTIGAÇÃO INICIAL ===")

if __name__ == "__main__":
    asyncio.run(investigate())
