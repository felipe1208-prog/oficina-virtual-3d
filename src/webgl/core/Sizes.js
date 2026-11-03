export class Sizes extends EventTarget {
  constructor(container) {
    super();
    this.container = container;
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);

    this.resizeHandler = this.onResize.bind(this);
    window.addEventListener("resize", this.resizeHandler);
  }

  onResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.dispatchEvent(new CustomEvent("resize"));
  }

  destroy() {
    window.removeEventListener("resize", this.resizeHandler);
  }
}
