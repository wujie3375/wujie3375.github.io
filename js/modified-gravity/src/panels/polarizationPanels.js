import {polarizationModes,axisNames,ringPoint,modeStrain} from '../polarizations/polarizationModes.js';

export function createPolarizationPanels(v){
  if(v.panelGridRows*v.panelGridCols!==polarizationModes.length)throw new RangeError('Six polarization panels are required');
  let cells=[],scale=1;
  const labelMode=(ctx,mode,x,y)=>{
    const font=Math.max(v.minModeLabelFontSize,v.labelFontSize*scale);
    ctx.fillStyle=v[mode.family+'Color'];ctx.font=`italic ${font}px "Times New Roman",serif`;
    ctx.fillText('h',x,y);const advance=ctx.measureText('h').width;
    ctx.font=`${/^[a-z]$/.test(mode.symbol)?'italic ':''}${font*0.68}px "Times New Roman",serif`;
    ctx.fillText(mode.symbol,x+advance,y+font*0.25);
  };
  const arrow=(ctx,x1,y1,x2,y2)=>{
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    const angle=Math.atan2(y2-y1,x2-x1),size=Math.max(v.minAxisArrowSize,v.axisArrowSize*scale);
    ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-size*Math.cos(angle-v.axisArrowHalfAngle),y2-size*Math.sin(angle-v.axisArrowHalfAngle));
    ctx.moveTo(x2,y2);ctx.lineTo(x2-size*Math.cos(angle+v.axisArrowHalfAngle),y2-size*Math.sin(angle+v.axisArrowHalfAngle));ctx.stroke();
  };
  return {get cells(){return cells;},resize(width,height){
    scale=width/v.canvasWidth;
    const left=width*v.panelGridLeft,right=width*v.panelGridRight;
    const top=Math.max(v.minGridTopPixels,height*v.panelGridTop),bottom=height*v.panelGridBottom;
    const cw=(right-left)/v.panelGridCols,ch=(bottom-top)/v.panelGridRows;
    if(ch<=0)throw new RangeError('Canvas is too small for polarization panels');
    cells=polarizationModes.map((mode,j)=>{
      const x=left+(j%v.panelGridCols)*cw,y=top+Math.floor(j/v.panelGridCols)*ch;
      return {mode,x,y,width:cw,height:ch,cx:x+cw/2,cy:y+ch*v.ringCenterY,
        radius:Math.min(cw,ch)*v.ringRadiusFraction};
    });
  },drawStatic(ctx){
    ctx.save();
    ctx.textBaseline='alphabetic';ctx.textAlign='left';
    const axisFont=Math.max(v.minAxisLabelFontSize,v.axisLabelFontSize*scale);
    cells.forEach(({mode,x,y,width,height,cx,cy,radius})=>{
      const pad=v.panelSpacing*scale/2;
      ctx.fillStyle=v.panelFill;ctx.strokeStyle=v.panelBorder;ctx.lineWidth=v.panelBorderLineWidth;
      ctx.beginPath();ctx.roundRect(x+pad,y+pad,width-2*pad,height-2*pad,v.panelCornerRadius*scale);ctx.fill();ctx.stroke();
      labelMode(ctx,mode,x+Math.max(9,18*scale),y+Math.max(v.minModeLabelOffsetY,v.modeLabelOffsetY*scale));
      ctx.strokeStyle=v.referenceColor;ctx.globalAlpha=v.referenceCircleAlpha;
      ctx.lineWidth=Math.max(v.minReferenceLineWidth,v.referenceLineWidth*scale);
      ctx.setLineDash(v.referenceDash.map((q,j)=>Math.max(v.minReferenceDash[j],q*scale)));
      ctx.beginPath();ctx.arc(cx,cy,radius,0,2*Math.PI);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
      const length=radius*v.axisLength;
      ctx.strokeStyle=v.axisColor;ctx.fillStyle=v.axisColor;ctx.lineWidth=Math.max(v.minAxisLineWidth,v.axisLineWidth*scale);
      arrow(ctx,cx-mode.horizontalSign*length,cy,cx+mode.horizontalSign*length,cy);
      arrow(ctx,cx,cy+length,cx,cy-length);
      ctx.font=`italic ${axisFont}px "Times New Roman",serif`;
      const labelOffset=Math.max(v.minAxisLabelOffsetPixels,v.axisLabelOffsetPixels*scale);
      ctx.textAlign=mode.horizontalSign===1?'left':'right';
      ctx.fillText(axisNames[mode.axes[0]],cx+mode.horizontalSign*(length+labelOffset),cy+axisFont*0.3);
      ctx.textAlign='left';ctx.fillText(axisNames[mode.axes[1]],cx+4*scale,Math.max(y+axisFont,cy-length-labelOffset));
      // 三维轴约定：⊙ 朝向观察者、⊗ 背离观察者；z 始终为传播方向。
      const ox=x+width-Math.max(16,26*scale),oy=y+Math.max(15,24*scale),r=Math.max(3,4*scale);
      ctx.beginPath();ctx.arc(ox,oy,r,0,2*Math.PI);ctx.stroke();
      if(mode.outTowards){ctx.beginPath();ctx.arc(ox,oy,Math.max(0.9,scale),0,2*Math.PI);ctx.fill();}
      else{ctx.beginPath();ctx.moveTo(ox-r*0.6,oy-r*0.6);ctx.lineTo(ox+r*0.6,oy+r*0.6);
        ctx.moveTo(ox-r*0.6,oy+r*0.6);ctx.lineTo(ox+r*0.6,oy-r*0.6);ctx.stroke();}
      ctx.fillText(axisNames[mode.outAxis],ox+r+3*scale,oy+axisFont*0.3);
    });
    // 列标题最后绘制，以实际字体下降部确定基线；文字下缘与面板保持可测量净空。
    ctx.globalAlpha=1;ctx.textAlign='center';ctx.textBaseline='alphabetic';
    const headerFont=Math.max(v.minGroupLabelFontSize,v.groupLabelFontSize*scale);
    ctx.font=`${headerFont}px Arial,sans-serif`;
    for(let column=0;v.groupHeaderVisible&&column<v.panelGridCols;column++){
      const cell=cells[column],label=v.columnLabels[column];ctx.fillStyle=v[v.columnFamilies[column]+'Color'];
      const descent=ctx.measureText(label).actualBoundingBoxDescent??headerFont*0.25;
      ctx.fillText(label,cell.cx,cell.y-Math.max(v.minGroupHeaderGap,v.groupHeaderGap*scale)-descent);
    }
    ctx.restore();
  },draw(ctx,state){
    ctx.save();
    cells.forEach(({mode,cx,cy,radius})=>{
      const strain=modeStrain(mode,state,v),color=v[mode.family+'Color'];
      ctx.strokeStyle=color;ctx.fillStyle=color;
      ctx.globalAlpha=v.curveNeutralOpacity+(1-v.curveNeutralOpacity)*state.opacity;
      ctx.lineWidth=Math.max(v.minCurveLineWidth,v.deformedCurveLineWidth*scale);
      ctx.shadowColor=color;ctx.shadowBlur=v.curveGlowBlur*scale;
      ctx.beginPath();
      for(let j=0;j<=v.ringSamples;j++){
        const [u,w]=ringPoint(mode,j/v.ringSamples*2*Math.PI,strain);
        const x=cx+u*radius,y=cy-w*radius;
        if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.closePath();ctx.stroke();ctx.shadowBlur=0;
      for(let j=0;j<v.particleCount;j++){
        const [u,w]=ringPoint(mode,j/v.particleCount*2*Math.PI,strain);
        ctx.beginPath();ctx.arc(cx+u*radius,cy-w*radius,Math.max(v.minParticleRadius,v.particleRadius*scale),0,2*Math.PI);ctx.fill();
      }
    });
    ctx.restore();
  }};
}
