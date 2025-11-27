import{dr as O,iF as Qe,ix as it,eu as me,fk as It,fw as K,fz as Ye,iv as kt,iu as He,dC as Ge,uo as Ut,fy as ee,dU as Ce,ek as Nt,dS as ae,e$ as Bt,i7 as Ht,at as Gt,hC as at,a7 as Jt,ew as qt,oO as Xt,r0 as Qt,dz as ve,kl as Ze,_ as Yt,jJ as st,x as P,cm as We,a5 as Tt,ls as Zt,uz as le,dq as ge,dA as nt,dV as Ve,ds as Kt,rl as ei,r4 as ti,aI as ii,dQ as Je,bW as ai,bw as si,ib as ni,vm as ri}from"./index-DQnV5lcp.js";import{t as oi}from"./orientedBoundingBox-pBmmCVC2.js";import{aY as li,aZ as ci,a_ as di,r as q,aG as pi,aL as hi,ax as $t,a$ as ui,c as he,b0 as rt,G as fi,a6 as Ke,aI as et,b as mi,L as De,ar as vi,H as gi,K as Si,D as bi,b1 as yi,ao as _i,aq as xi,I as Ti,J as $i,M as Pi,a2 as ce,a as Pt,j as wi,k as zi,b2 as Oi,O as ot,P as Ci,Q as lt,R as Te,T as Di,U as Ai,V as Li,W as Ri,X as fe,b3 as Ei,b4 as ct,b5 as Wi,b6 as Vi,b7 as dt,Y as Fi,x as w,A as Mi,b8 as ji,$ as Ii,b9 as pt,a0 as ki,a4 as Ui,a5 as Ni,ba as ht,m as Bi}from"./OutputColorHighlightOID.glsl-CITN7wbs.js";import{N as Hi,I as Gi,P as Ji}from"./sphere-rYaCXk4v.js";import{m as qi,w as $e,j as Ae,X as Y,k as ut}from"./plane-xWy0QVOh.js";import{s as Xi,n as Qi,t as Yi}from"./BufferView-D-d5lIrd.js";import{S as Zi}from"./Octree-CPhB3L_t.js";import{M as Ki,b as Fe,v as wt,B as ea}from"./lineSegment-DFSqmz6B.js";import{Q as ta}from"./InterleavedLayout-BuZrNePq.js";import{T as Pe,d as Me,r as ft}from"./renderState-CKc66y4x.js";import{f as ia}from"./computeTranslationToOriginAndRotation-DHkFCNuu.js";import{t as zt}from"./HUDMaterial.glsl-3tuj-khc.js";import{u as aa}from"./hydratedFeatures-DsPqmt82.js";import{t as c,n as j}from"./glsl-B5bJgrnA.js";import{s as sa}from"./ShaderBuilder-ClFkmn2E.js";function na(a){return a==="position"}function ra(a,e){return a==null&&(a=[]),a.push(e),a}function oa(a,e){if(a==null)return null;const t=a.filter(i=>i!==e);return t.length===0?null:t}function gs(a,e,t,i,s){we[0]=a.get(e,0),we[1]=a.get(e,1),we[2]=a.get(e,2),li(we,re,3),t.set(s,0,re[0]),i.set(s,0,re[1]),t.set(s,1,re[2]),i.set(s,1,re[3]),t.set(s,2,re[4]),i.set(s,2,re[5])}const we=O(),re=new Float32Array(6);let la=class{constructor(e={}){this.id=Qe(),this._highlightIds=new Set,this._shaderTransformation=null,this._visible=!0,this.castShadow=e.castShadow??!0,this.usesVerticalDistanceToGround=e.usesVerticalDistanceToGround??!1,this.graphicUid=e.graphicUid,this.layerViewUid=e.layerViewUid,e.isElevationSource&&(this.lastValidElevationBB=new Ot),this._geometries=e.geometries?Array.from(e.geometries):new Array}dispose(){this._geometries.length=0}get layer(){return this._layer}set layer(e){Xi(this._layer==null||e==null,"Object3D can only be added to a single Layer"),this._layer=e}addGeometry(e){e.visible=this._visible,this._geometries.push(e);for(const t of this._highlightIds)e.addHighlight(t);this._emit("geometryAdded",{object:this,geometry:e}),this._highlightIds.size&&this._emit("highlightChanged",this),this._invalidateBoundingVolume()}removeGeometry(e){const t=this._geometries.splice(e,1)[0];if(t){for(const i of this._highlightIds)t.removeHighlight(i);this._emit("geometryRemoved",{object:this,geometry:t}),this._highlightIds.size&&this._emit("highlightChanged",this),this._invalidateBoundingVolume()}}removeAllGeometries(){for(;this._geometries.length>0;)this.removeGeometry(0)}geometryVertexAttributeUpdated(e,t,i=!1){this._emit("attributesChanged",{object:this,geometry:e,attribute:t,sync:i}),na(t)&&this._invalidateBoundingVolume()}get visible(){return this._visible}set visible(e){if(this._visible!==e){this._visible=e;for(const t of this._geometries)t.visible=this._visible;this._emit("visibilityChanged",this)}}maskOccludee(){const e=new ci;for(const t of this._geometries)t.occludees=ra(t.occludees,e);return this._emit("occlusionChanged",this),e}removeOcclude(e){for(const t of this._geometries)t.occludees=oa(t.occludees,e);this._emit("occlusionChanged",this)}highlight(e){const t=new di(e);for(const i of this._geometries)i.addHighlight(t);return this._emit("highlightChanged",this),this._highlightIds.add(t),t}removeHighlight(e){this._highlightIds.delete(e);for(const t of this._geometries)t.removeHighlight(e);this._emit("highlightChanged",this)}removeStateID(e){e.channel===0?this.removeHighlight(e):this.removeOcclude(e)}getCombinedStaticTransformation(e,t){return it(t,this.transformation,e.transformation)}getCombinedShaderTransformation(e,t=me()){return it(t,this.effectiveTransformation,e.transformation)}get boundingVolumeWorldSpace(){return this._bvWorldSpace||(this._bvWorldSpace=this._bvWorldSpace||new mt,this._validateBoundingVolume(this._bvWorldSpace,0)),this._bvWorldSpace}get boundingVolumeObjectSpace(){return this._bvObjectSpace||(this._bvObjectSpace=this._bvObjectSpace||new mt,this._validateBoundingVolume(this._bvObjectSpace,1)),this._bvObjectSpace}_validateBoundingVolume(e,t){const i=t===1;for(const s of this._geometries){const n=s.boundingInfo;n&&ca(n,e,i?s.transformation:this.getCombinedShaderTransformation(s))}Hi(e.bounds,It(je,e.min,e.max,.5));for(const s of this._geometries){const n=s.boundingInfo;if(n==null)continue;const o=i?s.transformation:this.getCombinedShaderTransformation(s),l=qi(o);K(je,n.center,o);const r=Ye(je,Gi(e.bounds)),d=n.radius*l;e.bounds[3]=Math.max(e.bounds[3],r+d)}}_invalidateBoundingVolume(){const e=this._bvWorldSpace?.bounds;this._bvObjectSpace=this._bvWorldSpace=void 0,this.layer&&e&&this.layer.notifyObjectBBChanged(this,e)}_emit(e,t){this.layer?.events.emit(e,t)}get geometries(){return this._geometries}get transformation(){return this._transformation??kt}set transformation(e){this._transformation=He(this._transformation??me(),e),this._invalidateBoundingVolume(),this._emit("transformationChanged",this)}get shaderTransformation(){return this._shaderTransformation}set shaderTransformation(e){this._shaderTransformation=e?He(this._shaderTransformation??me(),e):null,this._invalidateBoundingVolume(),this._emit("shaderTransformationChanged",this)}get effectiveTransformation(){return this.shaderTransformation??this.transformation}get test(){}},Ot=class{constructor(){this._data=[Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE,-Number.MAX_VALUE,-Number.MAX_VALUE,-Number.MAX_VALUE]}get min(){return Ge(this._data[0],this._data[1],this._data[2])}get max(){return Ge(this._data[3],this._data[4],this._data[5])}minWith(e){const{_data:t}=this;t[0]=Math.min(t[0],e[0]),t[1]=Math.min(t[1],e[1]),t[2]=Math.min(t[2],e[2])}maxWith(e){const{_data:t}=this;t[3]=Math.max(t[3],e[0]),t[4]=Math.max(t[4],e[1]),t[5]=Math.max(t[5],e[2])}assignMinMax(e,t){for(let i=0;i<3;++i)this._data[0+i]=e[i],this._data[3+i]=t[i]}isEmpty(){return this._data[3]<this._data[0]&&this._data[4]<this._data[1]&&this._data[5]<this._data[2]}};class mt extends Ot{constructor(){super(...arguments),this.bounds=Ji()}}function ca(a,e,t){const i=a.bbMin,s=a.bbMax;if(Ut(t)){const n=ee(da,t[12],t[13],t[14]);return Ce(N,i,n),Ce(J,s,n),e.minWith(N),void e.maxWith(J)}if(K(N,i,t),Nt(i,s))return e.minWith(N),void e.maxWith(N);K(J,s,t),e.minWith(N),e.minWith(J),e.maxWith(N),e.maxWith(J);for(let n=0;n<3;++n)ae(N,i),ae(J,s),N[n]=s[n],J[n]=i[n],K(N,N,t),K(J,J,t),e.minWith(N),e.minWith(J),e.maxWith(N),e.maxWith(J)}const da=O(),N=O(),J=O(),je=O(),pa=["layerObjectAdded","layerObjectRemoved","layerObjectsAdded","layerObjectsRemoved","transformationChanged","shaderTransformationChanged","visibilityChanged","occlusionChanged","highlightChanged","geometryAdded","geometryRemoved","attributesChanged"];let ha=class{constructor(e,t,i=""){this.stage=e,this.apiLayerViewUid=i,this.id=Qe(),this.events=new Bt,this.visible=!0,this.sliceable=!1,this._objectsAdded=new Array,this._handles=new Ht,this._objects=new Map,this._pickable=!0,this.visible=t?.visible??!0,this._pickable=t?.pickable??!0,this.updatePolicy=t?.updatePolicy??0,e.addLayer(this);for(const s of pa)this._handles.add(this.events.on(s,n=>e.handleEvent(s,n)))}destroy(){this._handles.size&&(this._handles.destroy(),this.stage.removeLayer(this),this.invalidateSpatialQueryAccelerator())}get objects(){return this._objects}getObject(e){return Gt(this._objects.get(e))}set pickable(e){this._pickable=e}get pickable(){return this._pickable&&this.visible}add(e){this._objects.set(e.id,e),e.layer=this,this.events.emit("layerObjectAdded",e),this._octree!=null&&this._objectsAdded.push(e)}remove(e){this._objects.delete(e.id)&&(this.events.emit("layerObjectRemoved",e),e.layer=null,this._octree!=null&&(at(this._objectsAdded,e)||this._octree.remove([e])))}addMany(e){for(const t of e)this._objects.set(t.id,t),t.layer=this;this.events.emit("layerObjectsAdded",e),this._octree!=null&&this._objectsAdded.push(...e)}removeMany(e){const t=new Array;for(const i of e)this._objects.delete(i.id)&&t.push(i);if(t.length!==0&&(this.events.emit("layerObjectsRemoved",t),t.forEach(i=>i.layer=null),this._octree!=null)){for(let i=0;i<t.length;)at(this._objectsAdded,t[i])?(t[i]=t[t.length-1],t.length-=1):++i;this._octree.remove(t)}}commit(){this.stage.commitLayer(this)}sync(){this.updatePolicy!==1&&this.stage.syncLayer(this.id)}notifyObjectBBChanged(e,t){this._octree==null||this._objectsAdded.includes(e)||this._octree.update(e,t)}getSpatialQueryAccelerator(){return this._octree==null&&this._objects.size>50?(this._octree=new Zi(e=>e.boundingVolumeWorldSpace.bounds),this._octree.add(this._objects.values())):this._octree!=null&&this._objectsAdded.length>0&&(this._octree.add(this._objectsAdded),this._objectsAdded.length=0),this._octree}invalidateSpatialQueryAccelerator(){this._octree=Jt(this._octree),this._objectsAdded.length=0}get test(){}},ua=class{constructor(e,t){this.vec3=e,this.id=t}};function vt(a,e,t,i){return new ua(Ge(a,e,t),i)}const gt=8;function fa(a,e){const{vertex:t,attributes:i}=a;t.uniforms.add(new q("intrinsicWidth",o=>o.width));const{hasScreenSizePerspective:s,spherical:n}=e;s?(a.include(pi,e),hi(t),$t(t,e),t.uniforms.add(new ui("inverseViewMatrix",(o,l)=>qt(St,Xt(St,l.camera.viewMatrix,o.origin)))),t.code.add(c`
      float applyLineSizeScreenSizePerspective(float size, vec3 pos) {
        vec3 worldPos = (inverseViewMatrix * vec4(pos, 1)).xyz;
        vec3 groundUp = ${n?c`normalize(worldPos + localOrigin)`:c`vec3(0.0, 0.0, 1.0)`};
        float absCosAngle = abs(dot(groundUp, normalize(worldPos - cameraPosition)));

        return screenSizePerspectiveScaleFloat(size, absCosAngle, length(pos), screenSizePerspective);
      }
    `)):t.code.add(c`float applyLineSizeScreenSizePerspective(float size, vec3 pos) {
return size;
}`),e.hasVVSize?(i.add("sizeFeatureAttribute","float"),t.uniforms.add(new he("vvSizeMinSize",o=>o.vvSize.minSize),new he("vvSizeMaxSize",o=>o.vvSize.maxSize),new he("vvSizeOffset",o=>o.vvSize.offset),new he("vvSizeFactor",o=>o.vvSize.factor),new he("vvSizeFallback",o=>o.vvSize.fallback)),t.code.add(c`
    float getSize(${j(s,"vec3 pos")}) {
      float size = isnan(sizeFeatureAttribute)
        ? vvSizeFallback.x
        : intrinsicWidth * clamp(vvSizeOffset + sizeFeatureAttribute * vvSizeFactor, vvSizeMinSize, vvSizeMaxSize).x;

      return ${j(s,"applyLineSizeScreenSizePerspective(size, pos)","size")};
    }
    `)):(i.add("size","float"),t.code.add(c`
    float getSize(${j(s,"vec3 pos")}) {
      float fullSize = intrinsicWidth * size;
      return ${j(s,"applyLineSizeScreenSizePerspective(fullSize, pos)","fullSize")};
    }
    `)),e.hasVVOpacity?(i.add("opacityFeatureAttribute","float"),t.constants.add("vvOpacityNumber","int",8),t.uniforms.add(new rt("vvOpacityValues",o=>o.vvOpacity.values,gt),new rt("vvOpacityOpacities",o=>o.vvOpacity.opacityValues,gt),new q("vvOpacityFallback",o=>o.vvOpacity.fallback,{supportsNaN:!0})),t.code.add(c`
    float interpolateOpacity(float value) {
      if (value <= vvOpacityValues[0]) {
        return vvOpacityOpacities[0];
      }

      for (int i = 1; i < vvOpacityNumber; ++i) {
        if (vvOpacityValues[i] >= value) {
          float f = (value - vvOpacityValues[i-1]) / (vvOpacityValues[i] - vvOpacityValues[i-1]);
          return mix(vvOpacityOpacities[i-1], vvOpacityOpacities[i], f);
        }
      }

      return vvOpacityOpacities[vvOpacityNumber - 1];
    }

    vec4 applyOpacity(vec4 color) {
      if (isnan(opacityFeatureAttribute)) {
        // If there is a color vv then it will already have taken care of applying the fallback
        return ${j(e.hasVVColor,"color","vec4(color.rgb, vvOpacityFallback)")};
      }

      return vec4(color.rgb, interpolateOpacity(opacityFeatureAttribute));
    }
    `)):t.code.add(c`vec4 applyOpacity(vec4 color) {
return color;
}`),e.hasVVColor?(a.include(fi,e),i.add("colorFeatureAttribute","float"),t.code.add(c`vec4 getColor() {
vec4 color = interpolateVVColor(colorFeatureAttribute);
if (isnan(color.r)) {
return vec4(0);
}
return applyOpacity(color);
}`)):(i.add("color","vec4"),t.code.add(c`vec4 getColor() {
return applyOpacity(color);
}`))}const St=me();function ma(a){a.vertex.code.add("#define noPerspectiveWrite(x, w) (x * w)")}function qe(a){a.fragment.code.add("#define noPerspectiveRead(x) (x * gl_FragCoord.w)")}function va(a){return a.pattern.map(e=>Math.round(e*a.pixelRatio))}function ga(a){if(a==null)return 1;const e=va(a);return Math.floor(e.reduce((t,i)=>t+i))}function Sa(a){return a==null?Qt:a.length===4?a:ve(ba,a[0],a[1],a[2],1)}const ba=Ze();function ya(a,e){if(!e.stippleEnabled)return void a.fragment.code.add(c`float getStippleAlpha(float lineWidth) { return 1.0; }
void discardByStippleAlpha(float stippleAlpha, float threshold) {}
vec4 blendStipple(vec4 color, float stippleAlpha) { return color; }`);const t=!(e.draped&&e.stipplePreferContinuous),{vertex:i,fragment:s}=a;e.draped||($t(i,e),i.uniforms.add(new Ke("worldToScreenPerDistanceRatio",({camera:n})=>1/n.perScreenPixelRatio)).code.add(c`float computeWorldToScreenRatio(vec3 segmentCenter) {
float segmentDistanceToCamera = length(segmentCenter - cameraPosition);
return worldToScreenPerDistanceRatio / segmentDistanceToCamera;
}`)),a.varyings.add("vStippleDistance","float"),a.varyings.add("vStippleDistanceLimits","vec2"),a.varyings.add("vStipplePatternStretch","float"),i.code.add(c`
    float discretizeWorldToScreenRatio(float worldToScreenRatio) {
      float step = ${c.float(_a)};

      float discreteWorldToScreenRatio = log(worldToScreenRatio);
      discreteWorldToScreenRatio = ceil(discreteWorldToScreenRatio / step) * step;
      discreteWorldToScreenRatio = exp(discreteWorldToScreenRatio);
      return discreteWorldToScreenRatio;
    }
  `),et(i),i.code.add(c`
    vec2 computeStippleDistanceLimits(float startPseudoScreen, float segmentLengthPseudoScreen, float segmentLengthScreen, float patternLength) {

      // First check if the segment is long enough to support fully screen space patterns.
      // Force sparse mode for segments that are very large in screen space even if it is not allowed,
      // to avoid imprecision from calculating with large floats.
      if (segmentLengthPseudoScreen >= ${t?"patternLength":"1e4"}) {
        // Round the screen length to get an integer number of pattern repetitions (minimum 1).
        float repetitions = segmentLengthScreen / (patternLength * pixelRatio);
        float flooredRepetitions = max(1.0, floor(repetitions + 0.5));
        float segmentLengthScreenRounded = flooredRepetitions * patternLength;

        float stretch = repetitions / flooredRepetitions;

        // We need to impose a lower bound on the stretch factor to prevent the dots from merging together when there is only 1 repetition.
        // 0.75 is the lowest possible stretch value for flooredRepetitions > 1, so it makes sense as lower bound.
        vStipplePatternStretch = max(0.75, stretch);

        return vec2(0.0, segmentLengthScreenRounded);
      }
      return vec2(startPseudoScreen, startPseudoScreen + segmentLengthPseudoScreen);
    }
  `),s.uniforms.add(new mi("stipplePatternTexture",n=>n.stippleTexture),new q("stipplePatternPixelSizeInv",n=>1/Ct(n))),e.stippleOffColorEnabled&&s.uniforms.add(new De("stippleOffColor",n=>Sa(n.stippleOffColor))),a.include(qe),s.code.add(c`float getStippleSDF(out bool isClamped) {
float stippleDistanceClamped = noPerspectiveRead(clamp(vStippleDistance, vStippleDistanceLimits.x, vStippleDistanceLimits.y));
float lineSizeInv = noPerspectiveRead(vLineSizeInv);
vec2 aaCorrectedLimits = vStippleDistanceLimits + vec2(1.0, -1.0) / gl_FragCoord.w;
isClamped = vStippleDistance < aaCorrectedLimits.x || vStippleDistance > aaCorrectedLimits.y;
float u = stippleDistanceClamped * stipplePatternPixelSizeInv * lineSizeInv;
u = fract(u);
float sdf = texture(stipplePatternTexture, vec2(u, 0.5)).r;
return (sdf - 0.5) * vStipplePatternStretch + 0.5;
}
float getStippleSDF() {
bool ignored;
return getStippleSDF(ignored);
}
float getStippleAlpha(float lineWidth) {
bool isClamped;
float stippleSDF = getStippleSDF(isClamped);
float antiAliasedResult = clamp(stippleSDF * lineWidth + 0.5, 0.0, 1.0);
return isClamped ? floor(antiAliasedResult + 0.5) : antiAliasedResult;
}`),s.code.add(c`
    void discardByStippleAlpha(float stippleAlpha, float threshold) {
     ${j(!e.stippleOffColorEnabled,"if (stippleAlpha < threshold) { discard; }")}
    }

    vec4 blendStipple(vec4 color, float stippleAlpha) {
      return ${e.stippleOffColorEnabled?"mix(color, stippleOffColor, stippleAlpha)":"vec4(color.rgb, color.a * stippleAlpha)"};
    }
  `)}function Ct(a){const e=a.stipplePattern;return e?ga(a.stipplePattern)/e.pixelRatio:1}const _a=.4,Dt=64,xa=Dt/2,Ta=xa/5,$a=Dt/Ta,xs=.25;function Pa(a,e){const t=a.vertex,i=e.hasScreenSizePerspective;et(t),t.uniforms.get("markerScale")==null&&t.constants.add("markerScale","float",1),t.constants.add("markerSizePerLineWidth","float",$a).code.add(c`
  float getLineWidth(${j(i,"vec3 pos")}) {
     return max(getSize(${j(i,"pos")}), 1.0) * pixelRatio;
  }

  float getScreenMarkerSize(float lineWidth) {
    return markerScale * markerSizePerLineWidth * lineWidth;
  }
  `),e.space===2&&(t.constants.add("maxSegmentLengthFraction","float",.45),t.uniforms.add(new Ke("perRenderPixelRatio",s=>s.camera.perRenderPixelRatio)),t.code.add(c`
  bool areWorldMarkersHidden(vec3 pos, vec3 other) {
    vec3 midPoint = mix(pos, other, 0.5);
    float distanceToCamera = length(midPoint);
    float screenToWorldRatio = perRenderPixelRatio * distanceToCamera * 0.5;
    float worldMarkerSize = getScreenMarkerSize(getLineWidth(${j(i,"pos")})) * screenToWorldRatio;
    float segmentLen = length(pos - other);
    return worldMarkerSize > maxSegmentLengthFraction * segmentLen;
  }

  float getWorldMarkerSize(vec3 pos) {
    float distanceToCamera = length(pos);
    float screenToWorldRatio = perRenderPixelRatio * distanceToCamera * 0.5;
    return getScreenMarkerSize(getLineWidth(${j(i,"pos")})) * screenToWorldRatio;
  }
  `))}function wa(a,e){if(!e.hasAnimation)return;const{attributes:t,varyings:i,vertex:s,fragment:n}=a;t.add("timeStamps","vec4"),i.add("vTimeStamp","float"),i.add("vFirstTime","float"),i.add("vLastTime","float"),i.add("vTransitionType","float"),s.main.add(c`vTimeStamp = timeStamps.x;
vFirstTime = timeStamps.y;
vLastTime = timeStamps.z;
vTransitionType = timeStamps.w;`);const{animation:o}=e;o===3&&n.constants.add("decayRate","float",2.3),n.code.add(c`
    float getTrailOpacity(float x) {
      ${za(o)}
    }`),n.uniforms.add(new q("timeElapsed",l=>l.timeElapsed),new q("trailLength",l=>l.trailLength),new q("speed",l=>l.animationSpeed),new De("timingOptions",l=>ve(Oa,l.startTime,l.endTime,l.fadeInTime,l.fadeOutTime))),n.code.add(c`float fadeIn(float x) {
return smoothstep(0.0, timingOptions[2], x);
}
float fadeOut(float x) {
return isinf(timingOptions[3]) ? 1.0 : smoothstep(timingOptions[3], 0.0, x);
}`),n.code.add(c`vec4 animate(vec4 color) {
float startTime = timingOptions[0];
float endTime = timingOptions[1];
float totalTime = vLastTime - vFirstTime;
float actualEndTime = int(vTransitionType) == 2 ? min(endTime, startTime + vLastTime / speed) : endTime;
vec4 animatedColor = color;
if (speed == 0.0) {
animatedColor.a *= getTrailOpacity((totalTime - (vTimeStamp - vFirstTime)) / trailLength);
animatedColor.a *= isinf(actualEndTime) ? 1.0 : fadeOut(timeElapsed - actualEndTime);
animatedColor.a *= fadeIn(timeElapsed - startTime);
return animatedColor;
}
float relativeStartTime = mod(startTime, totalTime);
float vHeadRelativeToFirst = mod((timeElapsed - relativeStartTime) * speed - vFirstTime, totalTime);
float vRelativeToHead = vHeadRelativeToFirst + vFirstTime - vTimeStamp;
bool inPreviousCycle = vRelativeToHead < 0.0;
vRelativeToHead += inPreviousCycle ? totalTime : 0.0;
float vAbsoluteTime = timeElapsed - vRelativeToHead / speed;
if (vAbsoluteTime > actualEndTime) {
vRelativeToHead = (timeElapsed - relativeStartTime) * speed - vTimeStamp;
vAbsoluteTime = timeElapsed - vRelativeToHead / speed;
}
animatedColor *= step(startTime, vAbsoluteTime);
animatedColor *= step(vAbsoluteTime, actualEndTime);
animatedColor.a *= isinf(actualEndTime) ? 1.0 : fadeOut(timeElapsed - actualEndTime);
animatedColor.a *= inPreviousCycle ? fadeOut(vHeadRelativeToFirst / speed) : 1.0;
animatedColor.a *= getTrailOpacity(vRelativeToHead / trailLength);
animatedColor.a *= int(vTransitionType) == 0 ? fadeIn(vAbsoluteTime - startTime) : 1.0;
animatedColor.a *= fadeIn(vTimeStamp - vFirstTime);
return animatedColor;
}`)}function za(a){switch(a){case 2:return"return x >= 0.0 && x <= 1.0 ? 1.0 : 0.0;";case 3:return`float cutOff = exp(-decayRate);
        return (exp(-decayRate * x) - cutOff) / (1.0 - cutOff);`;default:return"return 1.0;"}}const Oa=Ze(),Se=1;function At(a){const e=new sa,{attributes:t,varyings:i,vertex:s,fragment:n}=e,{applyMarkerOffset:o,draped:l,output:r,capType:d,stippleEnabled:p,falloffEnabled:g,roundJoins:m,wireframe:u,innerColorEnabled:f,hasAnimation:y,hasScreenSizePerspective:b}=a;n.include(vi),e.include(fa,a),e.include(ya,a),e.include(gi,a),e.include(Si,a),e.include(wa,a);const G=o&&!l;G&&(s.uniforms.add(new q("markerScale",v=>v.markerScale)),e.include(Pa,{space:2,hasScreenSizePerspective:b})),bi(s,a),s.uniforms.add(new yi("inverseProjectionMatrix",v=>v.camera.inverseProjectionMatrix),new _i("nearFar",v=>v.camera.nearFar),new q("miterLimit",v=>v.join!=="miter"?0:v.miterLimit),new xi("viewport",v=>v.camera.fullViewport)),s.constants.add("LARGE_HALF_FLOAT","float",65500),t.add("position","vec3"),t.add("previousDelta","vec4"),t.add("nextDelta","vec4"),t.add("lineParameters","vec2"),t.add("u0","float"),i.add("vColor","vec4"),i.add("vpos","vec3",{invariant:!0}),i.add("vLineDistance","float"),i.add("vLineWidth","float");const X=p;X&&i.add("vLineSizeInv","float");const h=d===2,A=p&&h,L=g||A;L&&i.add("vLineDistanceNorm","float"),h&&(i.add("vSegmentSDF","float"),i.add("vReverseSegmentSDF","float")),s.code.add(c`vec2 perpendicular(vec2 v) {
return vec2(v.y, -v.x);
}
float interp(float ncp, vec4 a, vec4 b) {
return (-ncp - a.z) / (b.z - a.z);
}
vec2 rotate(vec2 v, float a) {
float s = sin(a);
float c = cos(a);
mat2 m = mat2(c, -s, s, c);
return m * v;
}`),s.code.add(c`vec4 projectAndScale(vec4 pos) {
vec4 posNdc = proj * pos;
posNdc.xy *= viewport.zw / posNdc.w;
return posNdc;
}`),s.code.add(c`void clip(
inout vec4 pos,
inout vec4 prev,
inout vec4 next,
bool isStartVertex
) {
float vnp = nearFar[0] * 0.99;
if (pos.z > -nearFar[0]) {
if (!isStartVertex) {
if (prev.z < -nearFar[0]) {
pos = mix(prev, pos, interp(vnp, prev, pos));
next = pos;
} else {
pos = vec4(0.0, 0.0, 0.0, 1.0);
}
} else {
if (next.z < -nearFar[0]) {
pos = mix(pos, next, interp(vnp, pos, next));
prev = pos;
} else {
pos = vec4(0.0, 0.0, 0.0, 1.0);
}
}
} else {
if (prev.z > -nearFar[0]) {
prev = mix(pos, prev, interp(vnp, pos, prev));
}
if (next.z > -nearFar[0]) {
next = mix(next, pos, interp(vnp, next, pos));
}
}
}`),et(s),s.constants.add("aaWidth","float",p?0:1).main.add(c`bool isStartVertex = abs(abs(lineParameters.y) - 3.0) == 1.0;
vec3 prevPosition = position + previousDelta.xyz * previousDelta.w;
vec3 nextPosition = position + nextDelta.xyz * nextDelta.w;
float coverage = 1.0;
if (lineParameters.y == 0.0) {
gl_Position = vec4(1e038, 1e038, 1e038, 1.0);
}
else {
vec4 pos  = view * vec4(position, 1.0);
vec4 prev = view * vec4(prevPosition, 1.0);
vec4 next = view * vec4(nextPosition, 1.0);
bool isJoin = abs(lineParameters.y) < 3.0;`),G&&s.main.add(c`vec4 other = isStartVertex ? next : prev;
bool markersHidden = areWorldMarkersHidden(pos.xyz, other.xyz);
if (!isJoin && !markersHidden) {
pos.xyz += normalize(other.xyz - pos.xyz) * getWorldMarkerSize(pos.xyz) * 0.5;
}`),e.include(ma),s.main.add(c`
      clip(pos, prev, next, isStartVertex);

      vec3 clippedPos = pos.xyz;
      vec3 clippedCenter = mix(pos.xyz, isStartVertex ? next.xyz : prev.xyz, 0.5);

      forwardViewPosDepth(pos.xyz);

      pos = projectAndScale(pos);
      next = projectAndScale(next);
      prev = projectAndScale(prev);

      vec2 left = (pos.xy - prev.xy);
      vec2 right = (next.xy - pos.xy);

      float leftLen = length(left);
      float rightLen = length(right);

      float lineSize = getSize(${j(b,"clippedPos")});
      ${j(p&&b,"float patternLineSize = getSize(clippedCenter);")}
      ${j(p&&!b,"float patternLineSize = lineSize;")}

      if (lineSize < 1.0) {
        coverage = lineSize; // convert sub-pixel coverage to alpha
        lineSize = 1.0;
      }
      lineSize += aaWidth;

      float lineWidth = lineSize * pixelRatio;
      vLineWidth = noPerspectiveWrite(lineWidth, pos.w);
      ${X?c`vLineSizeInv = noPerspectiveWrite(1.0 / lineSize, pos.w);`:""}
  `),(p||h)&&s.main.add(c`
      float isEndVertex = float(!isStartVertex);
      vec2 segmentOrigin = mix(pos.xy, prev.xy, isEndVertex);
      vec2 segment = mix(right, left, isEndVertex);
      ${h?c`vec2 segmentEnd = mix(next.xy, pos.xy, isEndVertex);`:""}
    `),s.main.add(c`left = (leftLen > 0.001) ? left/leftLen : vec2(0.0, 0.0);
right = (rightLen > 0.001) ? right/rightLen : vec2(0.0, 0.0);
vec2 capDisplacementDir = vec2(0, 0);
vec2 joinDisplacementDir = vec2(0, 0);
float displacementLen = lineWidth;
if (isJoin) {
bool isOutside = (left.x * right.y - left.y * right.x) * lineParameters.y > 0.0;
joinDisplacementDir = normalize(left + right);
joinDisplacementDir = perpendicular(joinDisplacementDir);
if (leftLen > 0.001 && rightLen > 0.001) {
float nDotSeg = dot(joinDisplacementDir, left);
displacementLen /= length(nDotSeg * left - joinDisplacementDir);
if (!isOutside) {
displacementLen = min(displacementLen, min(leftLen, rightLen)/abs(nDotSeg));
}
}
float subdivisionFactor = lineParameters.x;
if (isOutside && (displacementLen > miterLimit * lineWidth)) {`),m?s.main.add(c`
        vec2 startDir = leftLen < 0.001 ? right : left;
        startDir = perpendicular(startDir);

        vec2 endDir = rightLen < 0.001 ? left : right;
        endDir = perpendicular(endDir);

        float factor = ${p?c`min(1.0, subdivisionFactor * ${c.float((Se+2)/(Se+1))})`:c`subdivisionFactor`};

        float rotationAngle = acos(clamp(dot(startDir, endDir), -1.0, 1.0));
        joinDisplacementDir = rotate(startDir, -sign(lineParameters.y) * factor * rotationAngle);
      `):s.main.add(c`if (leftLen < 0.001) {
joinDisplacementDir = right;
}
else if (rightLen < 0.001) {
joinDisplacementDir = left;
}
else {
joinDisplacementDir = (isStartVertex || subdivisionFactor > 0.0) ? right : left;
}
joinDisplacementDir = perpendicular(joinDisplacementDir);`);const R=d!==0;return s.main.add(c`
        displacementLen = lineWidth;
      }
    } else {
      // CAP handling ---------------------------------------------------
      joinDisplacementDir = isStartVertex ? right : left;
      joinDisplacementDir = perpendicular(joinDisplacementDir);

      ${R?c`capDisplacementDir = isStartVertex ? -right : left;`:""}
    }
  `),s.main.add(c`
    // Displacement (in pixels) caused by join/or cap
    vec2 dpos = joinDisplacementDir * sign(lineParameters.y) * displacementLen + capDisplacementDir * displacementLen;
    float lineDistNorm = noPerspectiveWrite(sign(lineParameters.y), pos.w);

    vLineDistance = lineWidth * lineDistNorm;
    ${L?c`vLineDistanceNorm = lineDistNorm;`:""}

    pos.xy += dpos;
  `),h&&s.main.add(c`vec2 segmentDir = normalize(segment);
vSegmentSDF = noPerspectiveWrite((isJoin && isStartVertex) ? LARGE_HALF_FLOAT : (dot(pos.xy - segmentOrigin, segmentDir)), pos.w);
vReverseSegmentSDF = noPerspectiveWrite((isJoin && !isStartVertex) ? LARGE_HALF_FLOAT : (dot(pos.xy - segmentEnd, -segmentDir)), pos.w);`),p&&(l?s.uniforms.add(new Ke("worldToScreenRatio",v=>1/v.screenToPCSRatio)):s.main.add(c`vec3 segmentCenter = mix((nextPosition + position) * 0.5, (position + prevPosition) * 0.5, isEndVertex);
float worldToScreenRatio = computeWorldToScreenRatio(segmentCenter);`),s.main.add(c`float segmentLengthScreenDouble = length(segment);
float segmentLengthScreen = segmentLengthScreenDouble * 0.5;
float discreteWorldToScreenRatio = discretizeWorldToScreenRatio(worldToScreenRatio);
float segmentLengthRender = length(mix(nextPosition - position, position - prevPosition, isEndVertex));
vStipplePatternStretch = worldToScreenRatio / discreteWorldToScreenRatio;`),l?s.main.add(c`float segmentLengthPseudoScreen = segmentLengthScreen / pixelRatio * discreteWorldToScreenRatio / worldToScreenRatio;
float startPseudoScreen = u0 * discreteWorldToScreenRatio - mix(0.0, segmentLengthPseudoScreen, isEndVertex);`):s.main.add(c`float startPseudoScreen = mix(u0, u0 - segmentLengthRender, isEndVertex) * discreteWorldToScreenRatio;
float segmentLengthPseudoScreen = segmentLengthRender * discreteWorldToScreenRatio;`),s.uniforms.add(new q("stipplePatternPixelSize",v=>Ct(v))),s.main.add(c`float patternLength = patternLineSize * stipplePatternPixelSize;
vStippleDistanceLimits = computeStippleDistanceLimits(startPseudoScreen, segmentLengthPseudoScreen, segmentLengthScreen, patternLength);
vStippleDistance = mix(vStippleDistanceLimits.x, vStippleDistanceLimits.y, isEndVertex);
if (segmentLengthScreenDouble >= 0.001) {
vec2 stippleDisplacement = pos.xy - segmentOrigin;
float stippleDisplacementFactor = dot(segment, stippleDisplacement) / (segmentLengthScreenDouble * segmentLengthScreenDouble);
vStippleDistance += (stippleDisplacementFactor - isEndVertex) * (vStippleDistanceLimits.y - vStippleDistanceLimits.x);
}
vStippleDistanceLimits = noPerspectiveWrite(vStippleDistanceLimits, pos.w);
vStippleDistance = noPerspectiveWrite(vStippleDistance, pos.w);
vStippleDistanceLimits = isJoin ?
vStippleDistanceLimits :
isStartVertex ?
vec2(-1e34, vStippleDistanceLimits.y) :
vec2(vStippleDistanceLimits.x, 1e34);`)),s.main.add(c`
      // Convert back into NDC
      pos.xy = (pos.xy / viewport.zw) * pos.w;

      vColor = getColor();
      vColor.a = noPerspectiveWrite(vColor.a * coverage, pos.w);

      ${u&&!l?"pos.z -= 0.001 * pos.w;":""}

      // transform final position to camera space for slicing
      vpos = (inverseProjectionMatrix * pos).xyz;
      gl_Position = pos;
      forwardObjectAndLayerIdColor();
    }`),e.fragment.include(Ti,a),e.include($i,a),n.include(Pi),n.main.add(c`discardBySlice(vpos);
discardByTerrainDepth();`),e.include(qe),n.main.add(c`
    float lineWidth = noPerspectiveRead(vLineWidth);
    float lineDistance = noPerspectiveRead(vLineDistance);
    ${j(L,c`float lineDistanceNorm = noPerspectiveRead(vLineDistanceNorm);`)}
  `),u?n.main.add(c`vec4 finalColor = vec4(1.0, 0.0, 1.0, 1.0);`):(h&&n.main.add(c`
        float sdf = noPerspectiveRead(min(vSegmentSDF, vReverseSegmentSDF));
        vec2 fragmentPosition = vec2(min(sdf, 0.0), lineDistance);

        float fragmentRadius = length(fragmentPosition);
        float fragmentCapSDF = (fragmentRadius - lineWidth) * 0.5; // Divide by 2 to transform from double pixel scale
        float capCoverage = clamp(0.5 - fragmentCapSDF, 0.0, 1.0);

        if (capCoverage < ${c.float(ce)}) {
          discard;
        }
      `),A?n.main.add(c`
      vec2 stipplePosition = vec2(
        min(getStippleSDF() * 2.0 - 1.0, 0.0),
        lineDistanceNorm
      );
      float stippleRadius = length(stipplePosition * lineWidth);
      float stippleCapSDF = (stippleRadius - lineWidth) * 0.5; // Divide by 2 to transform from double pixel scale
      float stippleCoverage = clamp(0.5 - stippleCapSDF, 0.0, 1.0);
      float stippleAlpha = step(${c.float(ce)}, stippleCoverage);
      `):n.main.add(c`float stippleAlpha = getStippleAlpha(lineWidth);`),r!==10&&n.main.add(c`discardByStippleAlpha(stippleAlpha, ${c.float(ce)});`),e.include(qe),n.uniforms.add(new De("intrinsicColor",v=>v.color)).main.add(c`vec4 color = intrinsicColor * vColor;
color.a = noPerspectiveRead(color.a);`),f&&n.uniforms.add(new De("innerColor",v=>v.innerColor??v.color),new q("innerWidth",(v,$)=>v.innerWidth*$.camera.pixelRatio)).main.add(c`float distToInner = abs(lineDistance) - innerWidth;
float innerAA = clamp(0.5 - distToInner, 0.0, 1.0);
float innerAlpha = innerColor.a + color.a * (1.0 - innerColor.a);
color = mix(color, vec4(innerColor.rgb, innerAlpha), innerAA);`),n.main.add(c`vec4 finalColor = blendStipple(color, stippleAlpha);`),g&&(n.uniforms.add(new q("falloff",v=>v.falloff)),n.main.add(c`finalColor.a *= pow(max(0.0, 1.0 - abs(lineDistanceNorm)), falloff);`)),p||n.main.add(c`float featherStartDistance = max(lineWidth - 2.0, 0.0);
float value = abs(lineDistance);
float feather = (value - featherStartDistance) / (lineWidth - featherStartDistance);
finalColor.a *= 1.0 - clamp(feather, 0.0, 1.0);`),y&&n.main.add(c`
        finalColor = animate(finalColor);

        ${j(r!==10,c`
            if (finalColor.a <= ${c.float(ce)}) {
              discard;
            }`)}
      `)),n.main.add(c`outputColorHighlightOID(finalColor, vpos, finalColor.rgb);`),e}const Ca=Object.freeze(Object.defineProperty({__proto__:null,build:At,ribbonlineNumRoundJoinSubdivisions:Se},Symbol.toStringTag,{value:"Module"}));class Da extends wi{constructor(e,t){super(e,t,new zi(Ca,()=>Yt(()=>Promise.resolve().then(()=>ts),void 0)),Lt(t).locations),this.primitiveType=t.wireframe?st.LINES:st.TRIANGLE_STRIP}_makePipelineState(e,t){const{oitPass:i,output:s,hasOccludees:n,hasPolygonOffset:o}=e,l=i===0,r=i===2;return Pe({blending:fe(s)?Li(i):null,depthTest:{func:Ai(i)},depthWrite:Di(e),drawBuffers:Te(s,Ri(i,s)),colorWrite:Me,stencilWrite:n?lt:null,stencilTest:n?t?ot:Ci:null,polygonOffset:l||r?o?bt:null:Oi})}initializePipeline(e){if(e.occluder){const t=e.hasPolygonOffset?bt:null,{output:i,hasOccludees:s}=e;this._occluderPipelineTransparent=Pe({blending:ft,polygonOffset:t,depthTest:ct,depthWrite:null,colorWrite:Me,stencilWrite:null,stencilTest:s?Ei:null,drawBuffers:Te(i)}),this._occluderPipelineOpaque=Pe({blending:ft,polygonOffset:t,depthTest:s?ct:dt,depthWrite:null,colorWrite:Me,stencilWrite:s?Vi:null,stencilTest:s?Wi:null,drawBuffers:Te(i)}),this._occluderPipelineMaskWrite=Pe({blending:null,polygonOffset:t,depthTest:dt,depthWrite:null,colorWrite:null,stencilWrite:s?lt:null,stencilTest:s?ot:null,drawBuffers:Te(i)})}return this._occludeePipeline=this._makePipelineState(e,!0),this._makePipelineState(e,!1)}getPipeline(e,t){if(e)return this._occludeePipeline;switch(t){case 11:return this._occluderPipelineTransparent??super.getPipeline();case 10:return this._occluderPipelineOpaque??super.getPipeline();default:return this._occluderPipelineMaskWrite??super.getPipeline()}}}const bt={factor:0,units:-4};function Lt(a){const e=ta().vec3f("position").vec4f16("previousDelta").vec4f16("nextDelta").f32("u0").vec2f16("lineParameters");return a.hasVVColor?e.f32("colorFeatureAttribute"):e.vec4u8("color",{glNormalized:!0}),a.hasVVSize?e.f32("sizeFeatureAttribute"):e.f32("size"),a.hasVVOpacity&&e.f32("opacityFeatureAttribute"),Pt()&&e.vec4u8("olidColor"),a.hasAnimation&&e.vec4f16("timeStamps"),e}let T=class extends Fi{constructor(e){super(),this.spherical=e,this.capType=0,this.emissionSource=0,this.hasPolygonOffset=!1,this.writeDepth=!1,this.draped=!1,this.stippleEnabled=!1,this.stippleOffColorEnabled=!1,this.stipplePreferContinuous=!0,this.roundJoins=!1,this.applyMarkerOffset=!1,this.hasVVSize=!1,this.hasVVColor=!1,this.hasVVOpacity=!1,this.falloffEnabled=!1,this.innerColorEnabled=!1,this.hasOccludees=!1,this.occluder=!1,this.terrainDepthTest=!1,this.cullAboveTerrain=!1,this.wireframe=!1,this.discardInvisibleFragments=!1,this.animation=2,this.hasScreenSizePerspective=!1,this.textureCoordinateType=0,this.occlusionPass=!1,this.hasVVInstancing=!1,this.hasSliceTranslatedView=!0,this.overlayEnabled=!1,this.snowCover=!1}get hasAnimation(){return this.animation!==0}};P([w({count:3})],T.prototype,"capType",void 0),P([w({count:8})],T.prototype,"emissionSource",void 0),P([w()],T.prototype,"hasPolygonOffset",void 0),P([w()],T.prototype,"writeDepth",void 0),P([w()],T.prototype,"draped",void 0),P([w()],T.prototype,"stippleEnabled",void 0),P([w()],T.prototype,"stippleOffColorEnabled",void 0),P([w()],T.prototype,"stipplePreferContinuous",void 0),P([w()],T.prototype,"roundJoins",void 0),P([w()],T.prototype,"applyMarkerOffset",void 0),P([w()],T.prototype,"hasVVSize",void 0),P([w()],T.prototype,"hasVVColor",void 0),P([w()],T.prototype,"hasVVOpacity",void 0),P([w()],T.prototype,"falloffEnabled",void 0),P([w()],T.prototype,"innerColorEnabled",void 0),P([w()],T.prototype,"hasOccludees",void 0),P([w()],T.prototype,"occluder",void 0),P([w()],T.prototype,"terrainDepthTest",void 0),P([w()],T.prototype,"cullAboveTerrain",void 0),P([w()],T.prototype,"wireframe",void 0),P([w()],T.prototype,"discardInvisibleFragments",void 0),P([w({count:4})],T.prototype,"animation",void 0),P([w()],T.prototype,"hasScreenSizePerspective",void 0);class Aa extends Mi{constructor(e,t){super(e,Ra),this.produces=new Map([[2,i=>ji(i)||fe(i)&&this.parameters.renderOccluded===8],[3,i=>Ii(i)],[10,i=>pt(i)&&this.parameters.renderOccluded===8],[11,i=>pt(i)&&this.parameters.renderOccluded===8],[4,i=>fe(i)&&this.parameters.writeDepth&&this.parameters.renderOccluded!==8],[8,i=>fe(i)&&!this.parameters.writeDepth&&this.parameters.renderOccluded!==8],[18,i=>ki(i)]]),this._configuration=new T(t)}getConfiguration(e,t){super.getConfiguration(e,t,this._configuration),this._configuration.oitPass=t.oitPass,this._configuration.draped=t.slot===18;const i=this.parameters.stipplePattern!=null&&e!==9;return this._configuration.stippleEnabled=i,this._configuration.stippleOffColorEnabled=i&&this.parameters.stippleOffColor!=null,this._configuration.stipplePreferContinuous=i&&this.parameters.stipplePreferContinuous,this._configuration.hasSlicePlane=this.parameters.hasSlicePlane,this._configuration.roundJoins=this.parameters.join==="round",this._configuration.capType=this.parameters.cap,this._configuration.applyMarkerOffset=this.parameters.markerParameters!=null&&Wa(this.parameters.markerParameters),this._configuration.hasPolygonOffset=this.parameters.hasPolygonOffset,this._configuration.writeDepth=this.parameters.writeDepth,this._configuration.hasVVSize=this.parameters.hasVVSize,this._configuration.hasVVColor=this.parameters.hasVVColor,this._configuration.hasVVOpacity=this.parameters.hasVVOpacity,this._configuration.innerColorEnabled=this.parameters.innerWidth>0&&this.parameters.innerColor!=null,this._configuration.falloffEnabled=this.parameters.falloff>0,this._configuration.hasOccludees=t.hasOccludees,this._configuration.occluder=this.parameters.renderOccluded===8,this._configuration.terrainDepthTest=t.terrainDepthTest&&fe(e),this._configuration.cullAboveTerrain=t.cullAboveTerrain,this._configuration.wireframe=this.parameters.wireframe,this._configuration.animation=this.parameters.animation,this._configuration.emissionSource=this.hasEmissions?1:0,this._configuration.hasScreenSizePerspective=!!this.parameters.screenSizePerspective,this._configuration}get visible(){return this.parameters.color[3]>=ce||this.parameters.stipplePattern!=null&&(this.parameters.stippleOffColor?.[3]??0)>ce}setParameters(e,t){e.animation=this.parameters.animation,super.setParameters(e,t)}intersectDraped({attributes:e,screenToWorldRatio:t},i,s,n,o){if(!i.options.selectionMode)return;const l=e.get("size");let r=this.parameters.width;if(this.parameters.vvSize){const b=e.get("sizeFeatureAttribute").data[0];Number.isNaN(b)?r*=this.parameters.vvSize.fallback[0]:r*=We(this.parameters.vvSize.offset[0]+b*this.parameters.vvSize.factor[0],this.parameters.vvSize.minSize[0],this.parameters.vvSize.maxSize[0])}else l&&(r*=l.data[0]);const d=s[0],p=s[1],g=(r/2+4)*t;let m=Number.MAX_VALUE,u=0;const f=e.get("position").data,y=Xe(this.parameters,e)?f.length-2:f.length-5;for(let b=0;b<y;b+=3){const G=f[b],X=f[b+1],h=(b+3)%f.length,A=d-G,L=p-X,R=f[h]-G,v=f[h+1]-X,$=We((R*A+v*L)/(R*R+v*v),0,1),E=R*$-A,W=v*$-L,Q=E*E+W*W;Q<m&&(m=Q,u=b/3)}m<g*g&&n(o.distance,o.normal,u)}intersect(e,t,i,s,n,o){const{options:l,camera:r,rayBegin:d,rayEnd:p}=i;if(!l.selectionMode||!e.visible||!r)return;if(!Qi(t))return void Tt.getLogger("esri.views.3d.webgl-engine.materials.RibbonLineMaterial").error("intersection assumes a translation-only matrix");const g=e.attributes,m=g.get("position").data;let u=this.parameters.width;if(this.parameters.vvSize){const h=g.get("sizeFeatureAttribute").data[0];Number.isNaN(h)||(u*=We(this.parameters.vvSize.offset[0]+h*this.parameters.vvSize.factor[0],this.parameters.vvSize.minSize[0],this.parameters.vvSize.maxSize[0]))}else g.has("size")&&(u*=g.get("size").data[0]);const f=Va;Zt(f,i.point);const y=u*r.pixelRatio/2+4*r.pixelRatio;ee(ue[0],f[0]-y,f[1]+y,0),ee(ue[1],f[0]+y,f[1]+y,0),ee(ue[2],f[0]+y,f[1]-y,0),ee(ue[3],f[0]-y,f[1]-y,0);for(let h=0;h<4;h++)if(!r.unprojectFromRenderScreen(ue[h],ie[h]))return;$e(r.eye,ie[0],ie[1],ke),$e(r.eye,ie[1],ie[2],Ue),$e(r.eye,ie[2],ie[3],Ne),$e(r.eye,ie[3],ie[0],Be);let b=Number.MAX_VALUE,G=0;const X=Xe(this.parameters,g)?m.length-2:m.length-5;for(let h=0;h<X;h+=3){V[0]=m[h]+t[12],V[1]=m[h+1]+t[13],V[2]=m[h+2]+t[14];const A=(h+3)%m.length;if(F[0]=m[A]+t[12],F[1]=m[A+1]+t[13],F[2]=m[A+2]+t[14],Y(ke,V)<0&&Y(ke,F)<0||Y(Ue,V)<0&&Y(Ue,F)<0||Y(Ne,V)<0&&Y(Ne,F)<0||Y(Be,V)<0&&Y(Be,F)<0)continue;const L=r.projectToRenderScreen(V,Fa),R=r.projectToRenderScreen(F,Ma);if(L==null||R==null)continue;if(L[2]<0&&R[2]>0){ge(Z,V,F);const $=r.frustum,E=-Y($[4],V)/nt(Z,ut($[4]));if(Ve(Z,Z,E),Ce(V,V,Z),!r.projectToRenderScreen(V,L))continue}else if(L[2]>0&&R[2]<0){ge(Z,F,V);const $=r.frustum,E=-Y($[4],F)/nt(Z,ut($[4]));if(Ve(Z,Z,E),Ce(F,F,Z),!r.projectToRenderScreen(F,R))continue}else if(L[2]<0&&R[2]<0)continue;L[2]=0,R[2]=0;const v=Ki(Fe(L,R,xt),f);v<b&&(b=v,ae(yt,V),ae(_t,F),G=h/3)}if(b<y*y){let h=Number.MAX_VALUE;if(ea(Fe(yt,_t,xt),Fe(d,p,ja),oe)){ge(oe,oe,d);const A=Kt(oe);Ve(oe,oe,1/A),h=A/Ye(d,p)}o(h,oe,G)}}get hasEmissions(){return this.parameters.emissiveStrength>0}createBufferWriter(){return new Ea(Lt(this.parameters),this.parameters)}createGLMaterial(e){return new La(e)}validateParameters(e){e.join!=="miter"&&(e.miterLimit=0),e.markerParameters!=null&&(e.markerScale=e.markerParameters.width/e.width)}update(e){const{hasAnimation:t}=this.parameters;return!!t&&(this.setParameters({timeElapsed:ei(e.time)},!1),e.dt!==0)}}class La extends Ni{constructor(){super(...arguments),this._stipplePattern=null}dispose(){super.dispose(),this._stippleTextures?.release(this._stipplePattern),this._stipplePattern=null}beginSlot(e){const t=this._material.parameters.stipplePattern;return this._stipplePattern!==t&&(this._material.setParameters({stippleTexture:this._stippleTextures.swap(t,this._stipplePattern)}),this._stipplePattern=t),this.getTechnique(Da,e)}}class Ra extends Ui{constructor(){super(...arguments),this.width=0,this.color=ti,this.join="miter",this.cap=0,this.miterLimit=5,this.writeDepth=!0,this.hasPolygonOffset=!1,this.stippleTexture=null,this.stipplePreferContinuous=!0,this.markerParameters=null,this.markerScale=1,this.hasSlicePlane=!1,this.vvFastUpdate=!1,this.isClosed=!1,this.falloff=0,this.innerWidth=0,this.wireframe=!1,this.timeElapsed=0,this.animation=0,this.animationSpeed=1,this.trailLength=1,this.startTime=0,this.endTime=1/0,this.fadeInTime=0,this.fadeOutTime=1/0,this.emissiveStrength=0}get transparent(){return this.color[3]<1||this.hasAnimation||this.stipplePattern!=null&&(this.stippleOffColor?.[3]??0)<1}get hasAnimation(){return this.animation!==0}}class Ea{constructor(e,t){this.layout=e,this._parameters=t;const i=t.stipplePattern?1:0;switch(this._parameters.join){case"miter":case"bevel":this.numJoinSubdivisions=i;break;case"round":this.numJoinSubdivisions=Se+i}}_isClosed(e){return Xe(this._parameters,e)}allocate(e){return this.layout.createBuffer(e)}elementCount(e){const i=e.get("position").indices.length/2+1,s=this._isClosed(e);let n=s?2:4;return n+=((s?i:i-1)-(s?0:1))*(2*this.numJoinSubdivisions+4),n+=2,this._parameters.wireframe&&(n=2+4*(n-2)),n}write(e,t,i,s,n,o){const l=this.layout,r=i.get("position"),d=r.indices,p=r.data.length/3,g=i.get("distanceToStart")?.data;d&&d.length!==2*(p-1)&&console.warn("RibbonLineMaterial does not support indices");const m=l.fields.has("sizeFeatureAttribute");let u=1,f=null;if(m){const S=i.get("sizeFeatureAttribute");S.data.length===1?u=S.data[0]:f=S.data}else u=i.get("size")?.data[0]??1;let y=[1,1,1,1],b=0,G=null;const X=l.fields.has("colorFeatureAttribute");if(X){const S=i.get("colorFeatureAttribute");S.data.length===1?b=S.data[0]:G=S.data}else y=i.get("color")?.data??y;const h=i.get("timeStamps")?.data,A=h&&l.fields.has("timeStamps"),L=l.fields.has("opacityFeatureAttribute");let R=0,v=null;if(L){const S=i.get("opacityFeatureAttribute");S.data.length===1?R=S.data[0]:v=S.data}const $=new Float32Array(n.buffer),E=Yi(n.buffer),W=new Uint8Array(n.buffer),Q=l.stride/4;let x=o*Q;const Le=x;let I=0;const Re=g?(S,H,ne)=>I=g[ne]:(S,H,ne)=>I+=Ye(S,H),se=$.BYTES_PER_ELEMENT/E.BYTES_PER_ELEMENT,tt=4/se,Ft=Pt(),B=(S,H,ne,U,ye,Mt,_e,jt)=>{$[x++]=H[0],$[x++]=H[1],$[x++]=H[2],ht(S,H,E,x*se),x+=tt,ht(ne,H,E,x*se),x+=tt,$[x++]=jt;let te=x*se;if(E[te++]=ye,E[te++]=Mt,x=Math.ceil(te/se),X)$[x]=G?.[_e]??b;else{const k=Math.min(4*_e,y.length-4),xe=4*x;W[xe]=255*y[k],W[xe+1]=255*y[k+1],W[xe+2]=255*y[k+2],W[xe+3]=255*y[k+3]}if(x++,$[x++]=f?.[_e]??u,L&&($[x++]=v?.[_e]??R),Ft){let k=4*x;s?(W[k++]=s[0],W[k++]=s[1],W[k++]=s[2],W[k++]=s[3]):(W[k++]=0,W[k++]=0,W[k++]=0,W[k++]=0),x=Math.ceil(.25*k)}A&&(te=x*se,E[te++]=U[0],E[te++]=U[1],E[te++]=U[2],E[te++]=U[3],x=Math.ceil(te/se))};x+=Q,ee(_,r.data[0],r.data[1],r.data[2]),A&&ve(M,h[0],h[1],h[2],h[3]),e&&K(_,_,e);const be=this._isClosed(i);if(be){const S=r.data.length-3;ee(D,r.data[S],r.data[S+1],r.data[S+2]),e&&K(D,D,e)}else ee(z,r.data[3],r.data[4],r.data[5]),e&&K(z,z,e),B(_,_,z,M,1,-4,0,0),B(_,_,z,M,1,4,0,0),ae(D,_),ae(_,z),A&&ve(M,h[4],h[5],h[6],h[7]);const Ee=be?0:1,pe=be?p:p-1;for(let S=Ee;S<pe;S++){const H=(S+1)%p*3;ee(z,r.data[H],r.data[H+1],r.data[H+2]),e&&K(z,z,e),Re(D,_,S),B(D,_,z,M,0,-1,S,I),B(D,_,z,M,0,1,S,I);const ne=this.numJoinSubdivisions;for(let U=0;U<ne;++U){const ye=(U+1)/(ne+1);B(D,_,z,M,ye,-1,S,I),B(D,_,z,M,ye,1,S,I)}if(B(D,_,z,M,1,-2,S,I),B(D,_,z,M,1,2,S,I),ae(D,_),ae(_,z),A){const U=(S+1)%p*4;ve(M,h[U],h[U+1],h[U+2],h[U+3])}}return be?(ee(z,r.data[3],r.data[4],r.data[5]),e&&K(z,z,e),I=Re(D,_,pe),B(D,_,z,M,0,-1,Ee,I),B(D,_,z,M,0,1,Ee,I)):(I=Re(D,_,pe),B(D,_,_,M,0,-5,pe,I),B(D,_,_,M,0,5,pe,I)),Ie($,Le+Q,$,Le,Q),x=Ie($,x-Q,$,x,Q),this._parameters.wireframe&&this._addWireframeVertices(n,Le,x,Q),null}_addWireframeVertices(e,t,i,s){const n=new Float32Array(e.buffer,i*Float32Array.BYTES_PER_ELEMENT),o=new Float32Array(e.buffer,t*Float32Array.BYTES_PER_ELEMENT,i-t);let l=0;const r=d=>l=Ie(o,d,n,l,s);for(let d=0;d<o.length-1;d+=2*s)r(d),r(d+2*s),r(d+1*s),r(d+2*s),r(d+1*s),r(d+3*s)}}function Ie(a,e,t,i,s){for(let n=0;n<s;n++)t[i++]=a[e++];return i}function Xe(a,e){return a.isClosed?e.get("position").indices.length>2:!1}function Wa(a){return a.anchor===1&&a.hideOnShortSegments&&a.placement==="begin-end"&&a.worldSpace}const V=O(),F=O(),Z=O(),oe=O(),Va=O(),Fa=le(),Ma=le(),yt=O(),_t=O(),xt=wt(),ja=wt(),D=O(),_=O(),z=O(),M=Ze(),ue=[le(),le(),le(),le()],ie=[O(),O(),O(),O()],ke=Ae(),Ue=Ae(),Ne=Ae(),Be=Ae();let $s=class{constructor(e){this._originSR=e,this._rootOriginId="root/"+Qe(),this._origins=new Map,this._objects=new Map,this._gridSize=5e5}getOrigin(e){const t=this._origins.get(this._rootOriginId);if(t==null){const p=vt(e[0]+Math.random()-.5,e[1]+Math.random()-.5,e[2]+Math.random()-.5,this._rootOriginId);return this._origins.set(this._rootOriginId,p),p}const i=this._gridSize,s=Math.round(e[0]/i),n=Math.round(e[1]/i),o=Math.round(e[2]/i),l=`${s}/${n}/${o}`;let r=this._origins.get(l);const d=.5*i;if(ge(C,e,t.vec3),C[0]=Math.abs(C[0]),C[1]=Math.abs(C[1]),C[2]=Math.abs(C[2]),C[0]<d&&C[1]<d&&C[2]<d){if(r){const p=Math.max(...C);if(ge(C,e,r.vec3),C[0]=Math.abs(C[0]),C[1]=Math.abs(C[1]),C[2]=Math.abs(C[2]),Math.max(...C)<p)return r}return t}return r||(r=vt(s*i,n*i,o*i,l),this._origins.set(l,r)),r}_drawOriginBox(e,t=ii(1,1,0,1)){const i=window.view,s=i.stage,n=t.toString();if(!this._objects.has(n)){this._material=new Aa({width:2,color:t},!1);const u=new ha(s,{pickable:!1}),f=new la({castShadow:!1});u.add(f),this._objects.set(n,f)}const o=this._objects.get(n),l=[0,1,5,4,0,2,1,7,6,2,0,1,3,7,5,4,6,2,0],r=l.length,d=new Array(3*r),p=new Array,g=.5*this._gridSize;for(let u=0;u<r;u++)d[3*u]=e[0]+(1&l[u]?g:-g),d[3*u+1]=e[1]+(2&l[u]?g:-g),d[3*u+2]=e[2]+(4&l[u]?g:-g),u>0&&p.push(u-1,u);Je(d,this._originSR,0,d,i.renderSpatialReference,0,r);const m=new Bi(this._material,[["position",new oi(d,p,3,!0)]],null,2);o.addGeometry(m)}get test(){}};const C=O();class ws{constructor(e,t=null,i=0){this.array=e,this.spatialReference=t,this.offset=i}}function Rt(a){return"array"in a}function ze(a,e,t="ground"){if(zt(e))return a.getElevation(e.x,e.y,e.z||0,e.spatialReference,t);if(Rt(e)){let i=e.offset;return a.getElevation(e.array[i++],e.array[i++],e.array[i]||0,e.spatialReference??a.spatialReference,t)}return a.getElevation(e[0],e[1],e[2]||0,a.spatialReference,t)}function zs(a,e,t,i,s,n,o,l,r,d,p){const g=Ja[p.mode];let m,u,f=0;if(Je(a,e,t,i,r.spatialReference,s,l))return g?.requiresAlignment(p)?(f=g.applyElevationAlignmentBuffer(i,s,n,o,l,r,d,p),m=n,u=o):(m=i,u=s),Je(m,r.spatialReference,u,n,d.spatialReference,o,l)?f:void 0}function Et(a,e,t,i,s){const n=(zt(a)?a.z:Rt(a)?a.array[a.offset+2]:a[2])||0;switch(t.mode){case"on-the-ground":{const o=ze(e,a,"ground")??0;return s.verticalDistanceToGround=0,s.sampledElevation=o,void(s.z=o)}case"relative-to-ground":{const o=ze(e,a,"ground")??0,l=t.geometryZWithOffset(n,i);return s.verticalDistanceToGround=l,s.sampledElevation=o,void(s.z=l+o)}case"relative-to-scene":{const o=ze(e,a,"scene")??0,l=t.geometryZWithOffset(n,i);return s.verticalDistanceToGround=l,s.sampledElevation=o,void(s.z=l+o)}case"absolute-height":{const o=t.geometryZWithOffset(n,i),l=ze(e,a,"ground")??0;return s.verticalDistanceToGround=o-l,s.sampledElevation=l,void(s.z=o)}default:return void(s.z=0)}}function Os(a,e,t,i){return Et(a,e,t,i,de),de.z}function Cs(a,e,t){return e==="on-the-ground"&&t==="on-the-ground"?a.staysOnTheGround:e===t||e!=="on-the-ground"&&t!=="on-the-ground"?e==null||t==null?a.definedChanged:1:a.onTheGroundChanged}function Ds(a){return a==="relative-to-ground"||a==="relative-to-scene"}function As(a){return a!=="absolute-height"}function Ls(a,e,t,i,s){Et(e,t,s,i,de),Ia(a,de.verticalDistanceToGround);const n=de.sampledElevation,o=He(qa,a.transformation);return Oe[0]=e.x,Oe[1]=e.y,Oe[2]=de.z,ia(e.spatialReference,Oe,o,i.spatialReference)?a.transformation=o:console.warn("Could not locate symbol object properly, it might be misplaced"),n}function Ia(a,e){for(let t=0;t<a.geometries.length;++t){const i=a.geometries[t].getMutableAttribute("centerOffsetAndDistance");i&&i.data[3]!==e&&(i.data[3]=e,a.geometryVertexAttributeUpdated(a.geometries[t],"centerOffsetAndDistance"))}}function ka(a,e,t,i,s,n){let o=0;const l=n.spatialReference;e*=3,i*=3;for(let r=0;r<s;++r){const d=a[e],p=a[e+1],g=a[e+2],m=n.getElevation(d,p,g,l,"ground")??0;o+=m,t[i]=d,t[i+1]=p,t[i+2]=m,e+=3,i+=3}return o/s}function Ua(a,e,t,i,s,n,o,l){let r=0;const d=l.calculateOffsetRenderUnits(o),p=l.featureExpressionInfoContext,g=n.spatialReference;e*=3,i*=3;for(let m=0;m<s;++m){const u=a[e],f=a[e+1],y=a[e+2],b=n.getElevation(u,f,y,g,"ground")??0;r+=b,t[i]=u,t[i+1]=f,t[i+2]=p==null?y+b+d:b+d,e+=3,i+=3}return r/s}function Na(a,e,t,i,s,n,o,l){let r=0;const d=l.calculateOffsetRenderUnits(o),p=l.featureExpressionInfoContext,g=n.spatialReference;e*=3,i*=3;for(let m=0;m<s;++m){const u=a[e],f=a[e+1],y=a[e+2],b=n.getElevation(u,f,y,g,"scene")??0;r+=b,t[i]=u,t[i+1]=f,t[i+2]=p==null?y+b+d:b+d,e+=3,i+=3}return r/s}function Ba(a){const e=a.meterUnitOffset,t=a.featureExpressionInfoContext;return e!==0||t!=null}function Ha(a,e,t,i,s,n,o,l){const r=l.calculateOffsetRenderUnits(o),d=l.featureExpressionInfoContext;e*=3,i*=3;for(let p=0;p<s;++p){const g=a[e],m=a[e+1],u=a[e+2];t[i]=g,t[i+1]=m,t[i+2]=d==null?u+r:r,e+=3,i+=3}return 0}class Ga{constructor(){this.verticalDistanceToGround=0,this.sampledElevation=0,this.z=0}}const Ja={"absolute-height":{applyElevationAlignmentBuffer:Ha,requiresAlignment:Ba},"on-the-ground":{applyElevationAlignmentBuffer:ka,requiresAlignment:()=>!0},"relative-to-ground":{applyElevationAlignmentBuffer:Ua,requiresAlignment:()=>!0},"relative-to-scene":{applyElevationAlignmentBuffer:Na,requiresAlignment:()=>!0}},qa=me(),de=new Ga,Oe=O(),Xa=()=>Tt.getLogger("esri.views.3d.layers.graphics.featureExpressionInfoUtils");function Qa(a){return{cachedResult:a.cachedResult,arcade:a.arcade?{func:a.arcade.func,context:a.arcade.modules.arcadeUtils.createExecContext(null,{sr:a.arcade.context.spatialReference}),modules:a.arcade.modules}:null}}async function Rs(a,e,t,i){const s=a?.expression;if(typeof s!="string")return null;const n=es(s);if(n!=null)return{cachedResult:n};const o=await ai();si(t);const l=o.arcadeUtils,r=l.createSyntaxTree(s);return l.dependsOnView(r)?(i?.error("Expressions containing '$view' are not supported on ElevationInfo"),{cachedResult:0}):{arcade:{func:l.createFunction(r),context:l.createExecContext(null,{sr:e}),modules:o}}}function Ya(a,e,t){return a.arcadeUtils.createFeature(e.attributes,e.geometry,t)}function Za(a,e){if(a!=null&&!Wt(a)){if(!e||!a.arcade)return void Xa().errorOncePerTick("Arcade support required but not provided");const t=e;t._geometry&&(t._geometry=aa(t._geometry)),a.arcade.modules.arcadeUtils.updateExecContext(a.arcade.context,e)}}function Ka(a){if(a!=null){if(Wt(a))return a.cachedResult;const e=a.arcade;let t=e?.modules.arcadeUtils.executeFunction(e.func,e.context);return typeof t!="number"&&(a.cachedResult=0,t=0),t}return 0}function Es(a,e=!1){let t=a?.featureExpressionInfo;const i=t?.expression;return e||i==="0"||(t=null),t??null}const Ws={cachedResult:0};function Wt(a){return a.cachedResult!=null}function es(a){return a==="0"?0:null}class Vt{constructor(){this._meterUnitOffset=0,this._renderUnitOffset=0,this._unit="meters",this._metersPerElevationInfoUnit=1,this._featureExpressionInfoContext=null,this.mode=null,this.centerInElevationSR=null}get featureExpressionInfoContext(){return this._featureExpressionInfoContext}get meterUnitOffset(){return this._meterUnitOffset}get unit(){return this._unit}set unit(e){this._unit=e,this._metersPerElevationInfoUnit=ni(e)}get requiresSampledElevationInfo(){return this.mode!=="absolute-height"}reset(){this.mode=null,this._meterUnitOffset=0,this._renderUnitOffset=0,this._featureExpressionInfoContext=null,this.unit="meters"}set offsetMeters(e){this._meterUnitOffset=e,this._renderUnitOffset=0}set offsetElevationInfoUnits(e){this._meterUnitOffset=e*this._metersPerElevationInfoUnit,this._renderUnitOffset=0}addOffsetRenderUnits(e){this._renderUnitOffset+=e}geometryZWithOffset(e,t){const i=this.calculateOffsetRenderUnits(t);return this.featureExpressionInfoContext!=null?i:e+i}calculateOffsetRenderUnits(e){let t=this._meterUnitOffset;const i=this.featureExpressionInfoContext;return i!=null&&(t+=Ka(i)*this._metersPerElevationInfoUnit),t/e.unitInMeters+this._renderUnitOffset}setFromElevationInfo(e){this.mode=e.mode,this.unit=ri(e.unit)?e.unit:"meters",this.offsetElevationInfoUnits=e.offset??0}setFeatureExpressionInfoContext(e){this._featureExpressionInfoContext=e}updateFeatureExpressionInfoContextForGraphic(e,t,i){e.arcade?(this._featureExpressionInfoContext=Qa(e),this.updateFeatureExpressionFeature(t,i)):this._featureExpressionInfoContext=e}updateFeatureExpressionFeature(e,t){const i=this.featureExpressionInfoContext;i?.arcade&&(i.cachedResult=void 0,Za(this._featureExpressionInfoContext,e.geometry?Ya(i.arcade.modules,e,t):null))}static fromElevationInfo(e){const t=new Vt;return e!=null&&t.setFromElevationInfo(e),t}}const ts=Object.freeze(Object.defineProperty({__proto__:null,build:At,ribbonlineNumRoundJoinSubdivisions:Se},Symbol.toStringTag,{value:"Module"}));export{ze as A,Aa as J,la as W,Rs as a,Ws as b,Et as c,Es as d,Cs as e,$s as f,Ls as g,Ds as h,ha as i,fa as j,Pa as k,zs as l,As as m,na as n,Vt as o,Ia as p,ma as q,ws as r,Dt as s,vt as t,qe as u,xa as v,xs as w,Ga as x,gs as y,Os as z};
