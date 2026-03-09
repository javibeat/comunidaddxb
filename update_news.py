import urllib.request
import xml.etree.ElementTree as ET
import json
import datetime
import time

def fetch_rss(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            return response.read()
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def parse_news():
    # Google News RSS for Emiratos Arabes Unidos restricted strictly to official sources (WAM, NCEMA) in Spanish
    rss_url = "https://news.google.com/rss/search?q=site:wam.ae+OR+site:ncema.gov.ae+when:1d&hl=es-419&gl=US&ceid=US:es-419"
    xml_data = fetch_rss(rss_url)
    
    if not xml_data:
        return []

    try:
        root = ET.fromstring(xml_data)
    except Exception as e:
        print(f"Error parsing XML: {e}")
        return []

    news_items = []
    
    # We will also keep the fixed official news to maintain the priority ones if desired,
    # or just combine them. Actually, let's just create a list of news from the feed.
    for i, item in enumerate(root.findall('./channel/item')[:5]):
        title = item.find('title').text if item.find('title') is not None else ''
        link = item.find('link').text if item.find('link') is not None else ''
        pubDate = item.find('pubDate').text if item.find('pubDate') is not None else ''
        source = item.find('source').text if item.find('source') is not None else 'Noticias EAU'
        
        # Parse date
        # Example pubDate: Mon, 09 Mar 2026 05:01:00 GMT
        try:
            # Simple conversion to YYYY-MM-DD
            dt = datetime.datetime.strptime(pubDate, "%a, %d %b %Y %H:%M:%S %Z")
            date_str = dt.strftime("%Y-%m-%d")
        except:
            date_str = datetime.datetime.now().strftime("%Y-%m-%d")
            
        news_items.append({
            "id": i + 1,
            "source": source,
            "sourceUrl": link,
            "sourceIcon": "📰",
            "category": "noticias",
            "title": title,
            "summary": "Últimas noticias desde Emiratos Árabes Unidos.",
            "date": date_str,
            "link": link,
            "priority": "normal"
        })
        
    return news_items

if __name__ == "__main__":
    # Let's read the current static news if we want to keep some,
    # but the user said "aparece lo mismo siempre. Deberían actualizarse cada 24 por lo menos".
    # So replacing with fresh news is better. However, mixing some fixed emergency ones
    # might be useful. For now, let's just create fresh news + maybe 1 fixed NCEMA summary if empty.
    
    fresh_news = parse_news()
    
    if len(fresh_news) == 0:
        print("No fresh news found. Exiting.")
        exit(0)
        
    # Read existing to maybe keep the top priority ones or just rewrite all.
    # The prompt actually says: "no se están actualizando las noticias de la hero section, aparece lo mismo siempre."
    # So writing the fresh news to news.json.
    
    with open('news.json', 'w', encoding='utf-8') as f:
        json.dump(fresh_news, f, ensure_ascii=False, indent=4)
        
    print(f"Updated news.json with {len(fresh_news)} items.")
