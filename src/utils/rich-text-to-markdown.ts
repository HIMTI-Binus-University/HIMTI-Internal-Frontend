import { getSafeHttpUrl } from "@/utils/http-url";

const inline = (node: Node): string => {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
  if (!(node instanceof HTMLElement)) return "";

  const content = () => Array.from(node.childNodes, inline).join("");
  switch (node.tagName) {
    case "BR":
      return "\n";
    case "B":
    case "STRONG":
      return `**${content()}**`;
    case "I":
    case "EM":
      return `*${content()}*`;
    case "S":
    case "STRIKE":
    case "DEL":
      return `~~${content()}~~`;
    case "A": {
      const href = getSafeHttpUrl(node.getAttribute("href"));
      return href ? `[${content()}](${href})` : content();
    }
    case "LI":
      return `${node.parentElement?.tagName === "OL" ? "1." : "-"} ${content().trim()}\n`;
    case "P":
    case "DIV":
      return `${content().trim()}\n\n`;
    case "BLOCKQUOTE":
      return `${content()
        .trim()
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n")}\n\n`;
    case "CODE":
      return `\`${content()}\``;
    default:
      return content();
  }
};

export const richTextToMarkdown = (html: string) => {
  const document = new DOMParser().parseFromString(html, "text/html");
  return Array.from(document.body.childNodes, inline)
    .join("")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};
