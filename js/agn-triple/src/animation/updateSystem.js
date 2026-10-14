import {playbackState,renderState} from './systemState.js';
export function updateSystem(objects,seconds,p,v) {
  const state=playbackState(seconds,p,v);
  const render=renderState(state,v);
  objects.binary.group.position.set(...render.center);
  objects.binary.bodies.forEach((body,j)=>body.position.set(...render.components[j].map((x,k)=>x-render.center[k])));
  objects.disk.update(seconds);
  objects.gw.update(seconds);
}
