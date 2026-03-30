#!/usr/bin/env python3
import json
import urllib.request
import asyncio
import websockets

async def debug_site():
    print("=== DEBUG DO SITE VIA CDP ===\n")
    
    # Get page info
    with urllib.request.urlopen("http://127.0.0.1:18800/json") as r:
        pages = json.loads(r.read())
    
    page = next((p for p in pages if 'maricafilmcommission' in p.get('url', '')), None)
    if not page:
        print("Página não encontrada!")
        return
    
    print(f"Página: {page['url']}")
    print(f"Título: {page['title']}")
    
    ws_url = page['webSocketDebuggerUrl']
    
    async with websockets.connect(ws_url, ping_timeout=30) as ws:
        msg_id = 1
        
        async def send_cmd(method, params=None):
            nonlocal msg_id
            cmd = {"id": msg_id, "method": method}
            if params:
                cmd["params"] = params
            await ws.send(json.dumps(cmd))
            msg_id += 1
            
            while True:
                try:
                    response = json.loads(await asyncio.wait_for(ws.recv(), timeout=10))
                    if response.get("id") == msg_id - 1:
                        return response
                except asyncio.TimeoutError:
                    print("Timeout esperando resposta")
                    return None
        
        # Habilitar Console
        await send_cmd("Console.enable")
        await send_cmd("Runtime.enable")
        
        # Verificar estado do documento
        print("\n--- ESTADO DO DOCUMENTO ---")
        result = await send_cmd("Runtime.evaluate", {
            "expression": """
                JSON.stringify({
                    readyState: document.readyState,
                    title: document.title,
                    bodyLength: document.body ? document.body.innerText.length : 0,
                    url: window.location.href,
                    scripts: document.querySelectorAll('script').length,
                    pendingScripts: document.querySelectorAll('script[type="litespeed/javascript"]').length,
                    errors: window.__pageErrors || []
                })
            """,
            "returnByValue": True
        })
        
        if result and result.get("result", {}).get("result", {}).get("value"):
            state = json.loads(result["result"]["result"]["value"])
            print(f"readyState: {state.get('readyState')}")
            print(f"title: {state.get('title')}")
            print(f"bodyLength: {state.get('bodyLength')} chars")
            print(f"scripts: {state.get('scripts')} total, {state.get('pendingScripts')} pendentes")
        
        # Verificar se há erros
        print("\n--- ERROS NO CONSOLE ---")
        result = await send_cmd("Runtime.evaluate", {
            "expression": """
                (function() {
                    var errors = [];
                    // Verificar recursos que falharam
                    var resources = performance.getEntriesByType('resource');
                    var failed = resources.filter(r => r.transferSize === 0 && r.duration > 0);
                    return {
                        failedResources: failed.slice(0, 5).map(r => r.name),
                        totalResources: resources.length,
                        failedCount: failed.length
                    };
                })()
            """,
            "returnByValue": True
        })
        
        if result and result.get("result", {}).get("result", {}).get("value"):
            data = result["result"]["result"]["value"]
            print(f"Total recursos: {data.get('totalResources')}")
            print(f"Recursos falhados: {data.get('failedCount')}")
            if data.get('failedResources'):
                for r in data['failedResources']:
                    print(f"  - {r[:80]}")
        
        # Verificar se a página está interativa
        print("\n--- TESTE DE INTERATIVIDADE ---")
        result = await send_cmd("Runtime.evaluate", {
            "expression": """
                (function() {
                    var links = document.querySelectorAll('a');
                    var clickable = 0;
                    for (var i = 0; i < Math.min(links.length, 20); i++) {
                        var rect = links[i].getBoundingClientRect();
                        var style = window.getComputedStyle(links[i]);
                        if (rect.width > 0 && rect.height > 0 && 
                            style.display !== 'none' && 
                            style.visibility !== 'hidden' &&
                            style.pointerEvents !== 'none') {
                            clickable++;
                        }
                    }
                    return {
                        totalLinks: links.length,
                        clickableLinks: clickable,
                        bodyScrollHeight: document.body.scrollHeight,
                        viewportHeight: window.innerHeight
                    };
                })()
            """,
            "returnByValue": True
        })
        
        if result and result.get("result", {}).get("result", {}).get("value"):
            data = result["result"]["result"]["value"]
            print(f"Links totais: {data.get('totalLinks')}")
            print(f"Links clicáveis: {data.get('clickableLinks')}")
            print(f"Altura da página: {data.get('bodyScrollHeight')}px")
            print(f"Viewport: {data.get('viewportHeight')}px")
        
        # Verificar se há overlays bloqueando
        print("\n--- VERIFICANDO OVERLAYS ---")
        result = await send_cmd("Runtime.evaluate", {
            "expression": """
                (function() {
                    var overlays = [];
                    var allElements = document.querySelectorAll('*');
                    for (var i = 0; i < allElements.length; i++) {
                        var el = allElements[i];
                        var style = window.getComputedStyle(el);
                        if (style.position === 'fixed' && 
                            parseInt(style.zIndex) > 100 &&
                            el.offsetWidth > window.innerWidth * 0.5) {
                            overlays.push({
                                tag: el.tagName,
                                class: el.className.substring(0, 50),
                                zIndex: style.zIndex
                            });
                        }
                    }
                    return overlays.slice(0, 5);
                })()
            """,
            "returnByValue": True
        })
        
        if result and result.get("result", {}).get("result", {}).get("value"):
            overlays = result["result"]["result"]["value"]
            if overlays:
                print("Overlays encontrados:")
                for o in overlays:
                    print(f"  - {o['tag']}.{o['class']} (z-index: {o['zIndex']})")
            else:
                print("Nenhum overlay bloqueando")
        
        print("\n=== FIM DEBUG ===")

if __name__ == "__main__":
    asyncio.run(debug_site())
