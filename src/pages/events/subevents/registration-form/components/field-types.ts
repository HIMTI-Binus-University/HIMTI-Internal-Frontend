import {
  CalendarDays,
  CheckSquare,
  CircleDot,
  FileUp,
  Hash,
  ListFilter,
  MessageSquareText,
  Type,
} from "lucide-react";
import type { FormFieldType } from "@/types/events";

export const fieldTypes: Array<{
  value: FormFieldType;
  label: string;
  description: string;
  icon: typeof Type;
}> = [
  { value: "TEXT", label: "Short text", description: "One-line answer", icon: Type },
  { value: "TEXTAREA", label: "Long text", description: "Multi-line answer", icon: MessageSquareText },
  { value: "NUMBER", label: "Number", description: "Numeric answer", icon: Hash },
  { value: "DATE", label: "Date", description: "Date picker", icon: CalendarDays },
  { value: "SELECT", label: "Dropdown", description: "Choose one option", icon: ListFilter },
  { value: "RADIO", label: "Multiple choice", description: "Choose one option", icon: CircleDot },
  { value: "CHECKBOX", label: "Checkboxes", description: "Choose many options", icon: CheckSquare },
  { value: "FILE", label: "File upload", description: "Upload an attachment", icon: FileUp },
];

export const optionFieldTypes: FormFieldType[] = ["SELECT", "RADIO", "CHECKBOX"];

export const getFieldType = (value: FormFieldType) =>
  fieldTypes.find((fieldType) => fieldType.value === value) ?? fieldTypes[0];
