export function remove_styles_from_dom(): void {
  const head: HTMLHeadElement = document.getElementsByTagName('head')[0];
  if ((typeof head !== 'undefined') && (head !== null)) {
    const styles: HTMLCollectionOf<HTMLStyleElement> | [] = head.getElementsByTagName('style');
    for (let i = 0; i < styles.length; i++) {
      head.removeChild(styles[i]);
    }
  }
}
