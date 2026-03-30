#!/bin/bash
cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/marica-mirror-complete

while IFS= read -r url; do
  # Criar caminho local
  path=$(echo "$url" | sed 's|https://maricafilmcommission.com||')
  if [ -z "$path" ] || [ "$path" = "/" ]; then
    path="/index.html"
  else
    path="${path%/}/index.html"
  fi
  
  dir=$(dirname "$path")
  mkdir -p ".$dir"
  
  echo "Baixando: $url -> .$path"
  curl -s --max-time 60 "$url" -o ".$path" 2>/dev/null
  sleep 0.5
done < /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/marica-pages.txt

echo "DONE"
