export const pathUrl = (template: string, id: string): string =>
  template.replace(":id", encodeURIComponent(id));
