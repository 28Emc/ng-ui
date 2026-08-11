---
'@emc-dev/ng-ui': minor
---

Container queries: `ui-card` and `ui-table` now act as query containers (`container-type: inline-size`). `ui-card-header`/`ui-card-body` stack and tighten padding below 24rem and expand above it (`@sm:` variants); `ui-table` cells scale with `@narrow`/`@wide` tokens (new `--container-narrow: 22.5rem` and `--container-wide: 44rem`), the table text compacts under 22.5rem, and the pagination bar stacks on narrow containers and lays out inline above 44rem. New `Responsive` stories demonstrate both behaviors.
