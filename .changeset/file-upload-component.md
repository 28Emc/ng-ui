---
'@emc-dev/ng-ui': minor
---

New `ui-file-upload` component: drag & drop or click-to-browse dropzone with type/size/count validation (`accept`, `maxSize`, `maxFiles`), image previews via object URLs, reorderable file list (reuses `ui-drag-drop-list`), per-file progress (`ui-progress`), `upload`/`rejected`/`fileRemoved` outputs, and rejection toasts via `ToastService`. New public helpers: `validateUploadFiles`, `matchesAccept`, `fileSizeLabel`, `buildUploadFile`.
