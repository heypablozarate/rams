export type ClassValue = string | false | null | undefined;

export function cx(...classes: ClassValue[]): string {
  return classes.filter((value): value is string => Boolean(value)).join(" ");
}
