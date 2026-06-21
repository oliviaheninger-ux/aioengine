import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const baseUrl = url.startsWith('http') ? url : `https://${url}`;

    // 1. Check for standard AI/Crawler files
    const checkFile = async (path: string) => {
      try {
        const res = await fetch(`${baseUrl}${path}`, { 
          method: 'HEAD',
          headers: { 'User-Agent': 'aioengine-diagnostic-bot' }
        });
        return res.ok;
      } catch {
        return false;
      }
    };

    const [hasRobots, hasLlms] = await Promise.all([
      checkFile('/robots.txt'),
      checkFile('/llms.txt')
    ]);

    // 2. Scrape the homepage for LocalBusiness/Organization Schema
    let hasSchema = false;
    try {
      const htmlRes = await fetch(baseUrl, { 
        headers: { 'User-Agent': 'aioengine-diagnostic-bot' } 
      });
      if (htmlRes.ok) {
        const html = await htmlRes.text();
        const $ = cheerio.load(html);
        
        $('script[type="application/ld+json"]').each((_, el) => {
          const content = $(el).html();
          if (content && (content.includes('LocalBusiness') || content.includes('Organization'))) {
            hasSchema = true;
          }
        });
      }
    } catch (e) {
      console.log("Schema scrape failed, continuing.");
    }

    // 3. Calculate AI-Ready Score
    let score = 0;
    if (hasRobots) score += 20;
    if (hasLlms) score += 40;
    if (hasSchema) score += 40;

    return NextResponse.json({ 
      success: true, 
      data: { 
        score,
        robotsTxt: hasRobots,
        llmsTxt: hasLlms,
        schema: hasSchema
      } 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Audit failed' }, { status: 500 });
  }
}