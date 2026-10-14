import * as THREE from '../../../vendor/three/three.module.js';

export function createBlackHole(radius,v,role='central') {
  const group=new THREE.Group(),small=role==='binary';
  const silhouette=new THREE.Mesh(new THREE.SphereGeometry(radius,small?32:48,small?20:32),
    new THREE.MeshBasicMaterial({color:0x000000,transparent:small,opacity:1}));
  if(small) silhouette.renderOrder=v.binaryOverlayRenderOrder;
  group.add(silhouette);
  // 只有一层轮廓 halo：投影半径处达到峰值，向外 Gaussian 衰减。
  // 无叠加的 Fresnel 球壳、独立宽环或照亮本体的透明层。
  const size=small?v.smallHaloSize:v.centralHaloSize;
  const halo=new THREE.Mesh(new THREE.PlaneGeometry(radius*size,radius*size),new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,
    uniforms:{uColor:{value:new THREE.Vector3(...(small?v.smallHaloColor:v.centralHaloColor))},
      uStrength:{value:small?v.smallHaloStrength:v.centralHaloStrength},uPeak:{value:2/size},
      uWidth:{value:small?v.smallHaloWidth:v.centralHaloWidth},
      uMinPixelWidth:{value:v.haloMinPixelWidth},
      uClipDisk:{value:!small&&v.haloClipDisk?1:0},
      uDiskInner:{value:v.diskInnerRadius||0},uDiskOuter:{value:v.diskOuterRadius||0},
      uView:{value:new THREE.Vector3(...(v.cameraPosition||[0,-8,5.5])).normalize()}},
    vertexShader:`varying vec2 vUv;varying vec3 vWorld;
      void main(){vUv=uv;vWorld=(modelMatrix*vec4(position,1.0)).xyz;
        gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.0);}`,
    fragmentShader:`uniform vec3 uColor;uniform float uStrength;uniform float uPeak;uniform float uWidth;uniform float uMinPixelWidth;
      uniform float uClipDisk;uniform float uDiskInner;uniform float uDiskOuter;uniform vec3 uView;
      varying vec2 vUv;varying vec3 vWorld;
      void main(){float r=length(vUv-0.5)*2.0;float d=r-uPeak;
        float width=max(uWidth,uMinPixelWidth*fwidth(r));
        float a=exp(-pow(max(d,0.0)/width,2.0))*smoothstep(-0.012,0.008,d)*uStrength;
        a*=1.0-smoothstep(0.90,1.0,r);
        if(uClipDisk>0.5&&vWorld.z<0.0&&uView.z>0.00001){
          vec2 hit=vWorld.xy-vWorld.z*uView.xy/uView.z;
          float foreground=smoothstep(uDiskInner*0.95,uDiskInner*1.17,length(hit))
            *(1.0-smoothstep(uDiskOuter*0.70,uDiskOuter,length(hit)));
          a*=1.0-foreground;
        }
        if(a<0.0002)discard;
        gl_FragColor=vec4(uColor,a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  }));
  halo.userData.billboard=true;
  halo.renderOrder=small?v.binaryOverlayRenderOrder+1:v.centralHaloRenderOrder;
  group.add(halo);
  return group;
}
