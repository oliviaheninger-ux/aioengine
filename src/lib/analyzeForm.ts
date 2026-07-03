export type Severity = "low" | "medium" | "high";
export type RiskLevel = "low" | "medium" | "high";

export type FormField = {
  name: string;
  type: string;
  required: boolean;
  source: string;
  risks: string[];
};

export type FormIssue = {
  severity: Severity;
  title: string;
  detail: string;
  suggestion: string;
};

export type FormReport = {
  riskLevel: RiskLevel;
  confidence: number;
  summary: string;
  fields: FormField[];
  issues: FormIssue[];
  generated: {
    zodSchema: string;
    actionManifest: string;
    routeHandler: string;
    testIdeas: string[];
  };
};

function readAttributes(tag: string) {
  const cleaned = tag
    .replace(/^<\s*(input|textarea|select)\b/i, "")
    .replace(/\/?>$/i, "");

  const attrs: Record<string, string> = {};
  const attrRegex =
    /([a-zA-Z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

  let match: RegExpExecArray | null;

  while ((match = attrRegex.exec(cleaned)) !== null) {
    const key = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "true";
    attrs[key] = value;
  }

  return attrs;
}

function toIdentifier(value: string) {
  const cleaned = value
    .trim()
    .replace(/[^a-zA-Z0-9_$]/g, "_")
    .replace(/_+/g, "_");

  if (!cleaned) return "unnamedField";
  if (/^[0-9]/.test(cleaned)) return `field_${cleaned}`;

  return cleaned;
}

function detectRisks(field: FormField) {
  const text = `${field.name} ${field.type} ${field.source}`.toLowerCase();
  const risks: string[] = [];

  if (
    text.includes("password") ||
    text.includes("token") ||
    text.includes("secret")
  ) {
    risks.push("Authentication or secret data");
  }

  if (
    text.includes("credit") ||
    text.includes("card") ||
    text.includes("payment") ||
    text.includes("cvv") ||
    text.includes("billing")
  ) {
    risks.push("Payment or billing data");
  }

  if (
    text.includes("sin") ||
    text.includes("ssn") ||
    text.includes("social insurance")
  ) {
    risks.push("Government identity data");
  }

  if (
    text.includes("medical") ||
    text.includes("health") ||
    text.includes("diagnosis") ||
    text.includes("medication")
  ) {
    risks.push("Health or medical data");
  }

  if (
    text.includes("email") ||
    text.includes("phone") ||
    text.includes("name") ||
    text.includes("address") ||
    text.includes("birthday") ||
    text.includes("dob")
  ) {
    risks.push("Personal contact data");
  }

  if (field.type === "file") {
    risks.push("File upload");
  }

  if (field.type === "textarea" || text.includes("message")) {
    risks.push("Free-text user content");
  }

  return risks;
}

function zodForField(field: FormField) {
  const name = field.name.toLowerCase();
  const type = field.type.toLowerCase();

  let validator = "z.string().trim()";

  if (type === "email" || name.includes("email")) {
    validator = "z.string().trim().email().max(254)";
  } else if (type === "number") {
    validator = "z.coerce.number()";
  } else if (type === "checkbox") {
    validator = "z.boolean()";
  } else if (type === "file") {
    validator = "z.any()";
  } else if (type === "tel" || name.includes("phone")) {
    validator = "z.string().trim().min(7).max(30)";
  } else if (type === "textarea" || name.includes("message")) {
    validator = "z.string().trim().min(1).max(2000)";
  } else {
    validator = "z.string().trim().max(500)";
  }

  if (!field.required && type !== "checkbox") {
    validator += ".optional()";
  }

  return validator;
}

function buildZodSchema(fields: FormField[]) {
  const lines = fields.map((field) => {
    const key = toIdentifier(field.name);
    return `  ${key}: ${zodForField(field)},`;
  });

  return `import { z } from "zod";

export const formSchema = z.object({
${lines.join("\n")}
});

export type FormInput = z.infer<typeof formSchema>;`;
}

function buildActionManifest(fields: FormField[], riskLevel: RiskLevel) {
  return JSON.stringify(
    {
      name: "submit_form",
      description:
        "Submit this website form safely using validated structured input.",
      riskLevel,
      requiresHumanConfirmation: riskLevel !== "low",
      fields: fields.map((field) => ({
        name: field.name,
        type: field.type,
        required: field.required,
        risks: field.risks,
      })),
      safetyRules: [
        "Validate all fields before submission.",
        "Reject unexpected fields.",
        "Require human confirmation for sensitive data.",
        "Log submissions without storing secrets unnecessarily.",
      ],
    },
    null,
    2
  );
}

function buildRouteHandler() {
  return `import { formSchema } from "@/lib/formSchema";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = formSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid form input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // TODO: Send email, save lead, or trigger workflow here.
  return Response.json({ ok: true });
}`;
}

export function analyzeForm(source: string): FormReport {
  const input = source.trim();
  const fields: FormField[] = [];

  const elementRegex = /<(input|textarea|select)\b[^>]*>/gi;
  let match: RegExpExecArray | null;
  let index = 1;

  while ((match = elementRegex.exec(input)) !== null) {
    const tagName = match[1].toLowerCase();
    const fullTag = match[0];
    const attrs = readAttributes(fullTag);

    const type =
      tagName === "textarea" || tagName === "select"
        ? tagName
        : attrs.type?.toLowerCase() || "text";

    const name =
      attrs.name ||
      attrs.id ||
      attrs.placeholder ||
      attrs["aria-label"] ||
      `field_${index}`;

    const field: FormField = {
      name,
      type,
      required: "required" in attrs,
      source: fullTag,
      risks: [],
    };

    field.risks = detectRisks(field);
    fields.push(field);
    index++;
  }

  const issues: FormIssue[] = [];

  if (fields.length === 0) {
    issues.push({
      severity: "high",
      title: "No form fields detected",
      detail:
        "aioengine could not detect input, textarea, or select fields in the pasted code.",
      suggestion:
        "Paste the full form code, including the input fields and submit button.",
    });
  }

  const unnamedFields = fields.filter((field) =>
    field.name.startsWith("field_")
  );

  if (unnamedFields.length > 0) {
    issues.push({
      severity: "medium",
      title: "Some fields are missing clear names",
      detail:
        "AI agents need stable field names to understand what they are allowed to submit.",
      suggestion:
        "Add clear name or id attributes, such as name='email' or name='message'.",
    });
  }

  const sensitiveFields = fields.filter((field) => field.risks.length > 0);

  if (sensitiveFields.length > 0) {
    issues.push({
      severity: "medium",
      title: "Sensitive or risky fields detected",
      detail:
        "Some fields may contain personal, sensitive, free-text, file, payment, or authentication data.",
      suggestion:
        "Use validation, rate limits, spam protection, and human confirmation before allowing AI-agent submissions.",
    });
  }

  const requiredCount = fields.filter((field) => field.required).length;

  if (fields.length > 0 && requiredCount === 0) {
    issues.push({
      severity: "low",
      title: "No required fields detected",
      detail:
        "The form may accept incomplete submissions if validation is not added elsewhere.",
      suggestion:
        "Mark important fields as required and enforce validation on the server.",
    });
  }

  const hasHighRisk = sensitiveFields.some((field) =>
    field.risks.some((risk) =>
      [
        "Authentication or secret data",
        "Payment or billing data",
        "Government identity data",
        "Health or medical data",
        "File upload",
      ].includes(risk)
    )
  );

  const riskLevel: RiskLevel =
    fields.length === 0 || hasHighRisk
      ? "high"
      : sensitiveFields.length > 0
        ? "medium"
        : "low";

  const confidence =
    fields.length === 0
      ? 0.2
      : Math.min(0.95, 0.55 + fields.length * 0.08);

  return {
    riskLevel,
    confidence,
    summary:
      fields.length === 0
        ? "No usable form fields were detected yet."
        : `Detected ${fields.length} field${
            fields.length === 1 ? "" : "s"
          }. Risk level is ${riskLevel}.`,
    fields,
    issues,
    generated: {
      zodSchema: buildZodSchema(fields),
      actionManifest: buildActionManifest(fields, riskLevel),
      routeHandler: buildRouteHandler(),
      testIdeas: [
        "Submit with all required fields present.",
        "Submit with missing required fields.",
        "Submit with unexpected extra fields.",
        "Submit very long text values.",
        "Submit suspicious script-like input.",
        "Confirm sensitive forms require human approval.",
      ],
    },
  };
}