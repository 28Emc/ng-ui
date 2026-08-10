export interface UiBreadcrumbItem {
  label: string;
  href?: string;
  routerLink?: string | unknown[];
  onClick?: (event: MouseEvent) => void;
  disabled?: boolean;
  ariaLabel?: string;
}
