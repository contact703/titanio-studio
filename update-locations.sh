#!/bin/bash
# Update location page descriptions from spreadsheet data via WP REST API

NONCE=$(curl -s -b /tmp/wp-cookies.txt "https://maricafilmcommission.com/wp-admin/admin-ajax.php?action=rest-nonce")
echo "Nonce: $NONCE"

update_page() {
    local PAGE_ID=$1
    local NEW_TEXT=$2
    local LABEL=$3
    
    # Get current elementor data
    curl -s -b /tmp/wp-cookies.txt -H "X-WP-Nonce: $NONCE" \
        "https://maricafilmcommission.com/wp-json/wp/v2/pages/${PAGE_ID}?context=edit&_fields=meta" \
        > /tmp/page_${PAGE_ID}.json 2>/dev/null
    
    # Update the heading text via Python
    python3 -c "
import json, sys
with open('/tmp/page_${PAGE_ID}.json', 'r') as f:
    d = json.loads(f.read(), strict=False)
edata = json.loads(d['meta']['_elementor_data'], strict=False)

updated = False
def walk(els):
    global updated
    for el in els:
        if el.get('widgetType') == 'heading' and len(el.get('settings', {}).get('title', '')) > 20:
            el['settings']['title'] = '''${NEW_TEXT}'''
            updated = True
            return True
        if 'elements' in el:
            if walk(el['elements']): return True
    return False

walk(edata)
if updated:
    print(json.dumps({'meta': {'_elementor_data': json.dumps(edata)}}))
else:
    print('SKIP', file=sys.stderr)
" > /tmp/page_${PAGE_ID}_update.json 2>/tmp/page_${PAGE_ID}_err.txt
    
    if [ -s /tmp/page_${PAGE_ID}_err.txt ]; then
        echo "  SKIP: $LABEL (page $PAGE_ID) - no heading found"
        return
    fi
    
    # POST the update
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -b /tmp/wp-cookies.txt \
        -H "X-WP-Nonce: $NONCE" \
        -H "Content-Type: application/json" \
        -X POST \
        -d @/tmp/page_${PAGE_ID}_update.json \
        "https://maricafilmcommission.com/wp-json/wp/v2/pages/${PAGE_ID}")
    
    echo "  $LABEL (page $PAGE_ID): HTTP $HTTP_CODE"
}

echo "--- Updating EN pages ---"
echo ""
