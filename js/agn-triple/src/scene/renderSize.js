// 在 CSS 4:3 容器内提高小组件的清晰度，同时限制移动端倍率和最大 GPU 像素开销。
// 静态导出保留同一运行时代码；目标尺寸与预算都在各动画的 params.js 中。
export function renderPixelRatio(width,height,deviceRatio,v) {
  if(!(width>0&&height>0)) return 1;
  return Math.min(v.maxPixelRatio,Math.max(deviceRatio||1,v.canvasWidth*v.renderScale/width),
    Math.sqrt(v.maxRenderPixels/(width*height)));
}
