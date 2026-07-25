/** 拖拽转镜头/缩放时，鼠标按下和松开之间允许的最大位移（像素）——超过这个距离就不算"点击" */
export const CLICK_DRAG_THRESHOLD_PX = 6;

export function isClickNotDrag(startX: number, startY: number, endX: number, endY: number): boolean {
  const dx = endX - startX;
  const dy = endY - startY;
  return dx * dx + dy * dy <= CLICK_DRAG_THRESHOLD_PX * CLICK_DRAG_THRESHOLD_PX;
}
