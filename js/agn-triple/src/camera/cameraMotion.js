export function updateCamera(camera,seconds,v) {
  const [x,y,z]=v.cameraPosition;
  const radius=Math.hypot(x,y);
  const angle=Math.atan2(y,x)+v.cameraDrift*Math.sin(seconds*2*Math.PI/v.cameraDriftPeriod);
  camera.position.set(radius*Math.cos(angle),radius*Math.sin(angle),z);
  camera.up.set(0,0,1);
  camera.lookAt(0,0,0);
}
