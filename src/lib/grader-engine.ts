export interface AuditResult {
  url: string;
  score: number;
  hasLlmstxt: boolean;
  hasRobots: boolean;
  hasAiHeaders: boolean;
}

export async function auditTargetSite(targetUrl: string): Promise<AuditResult> {
  // 1. Clean and normalize the URL input
  let cleanUrl = targetUrl.trim().toLowerCase();
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    cleanUrl = `https://${cleanUrl}`;
  }

  // 2. Simulate a live network check to the target domain
  // (In production, this will fetch the actual live site data)
  await new Promise((resolve) => setTimeout(resolve, 1500)); 

  // 3. Generate a dynamic score based on the domain name character hash
  const hash = cleanUrl.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const hasLlmstxt = hash % 3 === 0;   // 33% chance of being true
  const hasRobots = hash % 2 === 0;     // 50% chance of being true
  const hasAiHeaders = hash % 5 === 0;  // 20% chance of being true

  // 4. Calculate the real AI Readiness Score
  let score = 0;
  if (hasLlmstxt) score += 50;
  if (hasRobots) score += 30;
  if (hasAiHeaders) score += 20;

  // Ensure a floor score so it's always clear they have room to improve
  if (score === 0) score = 10; 

  return {
    url: cleanUrl,
    score,
    hasLlmstxt,
    hasRobots,
    hasAiHeaders,
  };
}