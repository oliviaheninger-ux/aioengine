export type Severity = "low" | "medium" | "high";
export type RiskLevel = "low" | "medium" | "high";

export type FormField = {
  name: string;
  type: string;
  required: boolean;
  source: string;
  placeholder?: string;
  id?: string;
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

const HIGH_RISK_LABELS = [
  "Authentication or secret data",
  "Payment or billing data",
  "Government identity data",
  "Health or medical data",
  "File upload",
];

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

function normalizeText(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .toLowerCase();
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

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function detectRisks(field: FormField) {
  const fieldText = normalizeText(
    [
      field.name,
      field.type,
      field.placeholder ?? "",
      field.id ?? "",
    ].join(" ")
  );

  const risks: string[] = [];

  if (
    field.type === "password" ||
    includesAny(fieldText, [
      "password",
      "passcode",
      "token",
      "secret",
      "api key",
      "apikey",
      "auth",
      "login",
      "credential",
    ])
  ) {
    risks.push("Authentication or secret data");
  }

  if (
    includesAny(fieldText, [
      "credit card",
      "card number",
      "card",
      "payment",
      "pay now",
      "cvv",
      "cvc",
      "billing",
      "checkout",
      "charge",
      "invoice",
    ])
  ) {
    risks.push("Payment or billing data");
  }

  if (
    includesAny(fieldText, [
      "sin",
      "ssn",
      "social insurance",
      "social security",
      "passport",
      "driver license",
      "driver licence",
      "government id",
      "tax id",
    ])
  ) {
    risks.push("Government identity data");
  }

  if (
    includesAny(fieldText, [
      "medical",
      "health",
      "diagnosis",
      "medication",
      "prescription",
      "symptom",
      "condition",
      "accessibility",
      "disability",
    ])
  ) {
    risks.push("Health or medical data");
  }

  if (
    field.type === "email" ||
    field.type === "tel" ||
    includesAny(fieldText, [
      "full name",
      "first name",
      "last name",
      "email",
      "phone",
      "mobile",
      "address",
      "street",
      "city",
      "postal",
      "zip",
      "birthday",
      "birth date",
      "dob",
    ]) ||
    field.name.toLowerCase() === "name"
  ) {
    risks.push("Personal contact data");
  }

  if (field.type === "file") {
    risks.push("File upload");
  }

  if (
    field.type === "textarea" ||
    includesAny(fieldText, [
      "message",
      "notes",
      "comments",
      "description",
      "details",
      "reason",
      "explain",
    ])
  ) {
    risks.push("Free-text user content");
  }

  return Array.from(new Set(risks));
}

function zodForField(field: FormField) {
  const name = normalizeText(field.name);
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
} else if (
  name.includes("cvv") ||
  name.includes("cvc")
) {
  validator = "z.string().trim().regex(/^\\d{3,4}$/)";
} else if (type === "password") {
  validator = "z.string().min(1).max(200)";  } else if (
    name.includes("credit card") ||
    name.includes("card number")
  ) {
    validator = "z.string().trim().min(12).max(19)";
  } else if (type === "tel" || name.includes("phone") || name.includes("mobile")) {
    validator = "z.string().trim().min(7).max(30)";
  } else if (
    type === "textarea" ||
    name.includes("message") ||
    name.includes("notes") ||
    name.includes("comments") ||
    name.includes("description")
  ) {
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
  const highRiskFields = fields.filter((field) =>
    field.risks.some((risk) => HIGH_RISK_LABELS.includes(risk))
  );

  return JSON.stringify(
    {
      name: "submit_form",
      description:
        "Submit this website form safely using validated structured input.",
      riskLevel,
      requiresHumanConfirmation: riskLevel !== "low",
      autonomousSubmissionAllowed: riskLevel === "low",
      fields: fields.map((field) => ({
        name: field.name,
        type: field.type,
        required: field.required,
        risks: field.risks,
      })),
      highRiskFields: highRiskFields.map((field) => field.name),
      safetyRules: [
        "Validate all fields before submission.",
        "Reject unexpected fields.",
        "Rate limit submissions.",
        "Block script-like or suspicious input.",
        "Require human confirmation for medium and high risk forms.",
        "Do not allow autonomous agent submission for payment, password, medical, government ID, or file upload fields.",
        "Avoid storing secrets, payment details, or sensitive health data unless the application has a compliant reason to do so.",
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
  // For medium/high risk forms, require human confirmation before automated submission.

  return Response.json({ ok: true });
}`;
}

function buildIssues(fields: FormField[]) {
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

    return issues;
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

  const highRiskFields = fields.filter((field) =>
    field.risks.some((risk) => HIGH_RISK_LABELS.includes(risk))
  );

  const personalOrFreeTextFields = fields.filter((field) =>
    field.risks.some((risk) =>
      ["Personal contact data", "Free-text user content"].includes(risk)
    )
  );

  if (highRiskFields.length > 0) {
    issues.push({
      severity: "high",
      title: "High-risk fields detected",
      detail:
        "This form appears to collect sensitive data such as payment details, secrets, medical information, government identity data, or file uploads.",
      suggestion:
        "Do not allow fully autonomous AI-agent submissions for this form. Require human confirmation, strict validation, rate limits, logging, and a clear data handling policy.",
    });
  }

  if (personalOrFreeTextFields.length > 0) {
    issues.push({
      severity: "medium",
      title: "Personal or free-text fields detected",
      detail:
        "This form may collect contact information or open-ended user text, which can include private or unexpected content.",
      suggestion:
        "Validate field lengths, reject unexpected fields, add spam protection, and avoid exposing personal data to unnecessary systems.",
    });
  }

  const requiredCount = fields.filter((field) => field.required).length;

  if (requiredCount === 0) {
    issues.push({
      severity: "low",
      title: "No required fields detected",
      detail:
        "The form may accept incomplete submissions if validation is not added elsewhere.",
      suggestion:
        "Mark important fields as required and enforce validation on the server.",
    });
  }

  return issues;
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
      placeholder: attrs.placeholder,
      id: attrs.id,
      risks: [],
    };

    field.risks = detectRisks(field);
    fields.push(field);
    index++;
  }

  const issues = buildIssues(fields);

  const hasHighRisk = fields.some((field) =>
    field.risks.some((risk) => HIGH_RISK_LABELS.includes(risk))
  );

  const hasMediumRisk = fields.some((field) =>
    field.risks.some((risk) =>
      ["Personal contact data", "Free-text user content"].includes(risk)
    )
  );

  const riskLevel: RiskLevel =
    fields.length === 0 || hasHighRisk
      ? "high"
      : hasMediumRisk
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
        "Confirm medium and high risk forms require human approval.",
        "Confirm payment, password, medical, government ID, and file upload fields cannot be submitted autonomously by an AI agent.",
      ],
    },
  };
}