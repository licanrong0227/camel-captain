export interface DialogRequest {
  /** 目录点击的弹窗标识，空字符串表示只打开页面并关闭已打开弹窗。 */
  dialog: string;
  /** 每次目录点击都递增，保证同一弹窗可重复打开。 */
  token: number;
}
