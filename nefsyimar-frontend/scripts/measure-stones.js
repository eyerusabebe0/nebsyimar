const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function luminance(r,g,b){
  return 0.2126*r + 0.7152*g + 0.0722*b;
}

function analyze(filePath){
  return new Promise((resolve, reject)=>{
    fs.createReadStream(filePath)
      .pipe(new PNG())
      .on('parsed', function(){
        const w = this.width, h = this.height;
        const data = this.data;
        // sample middle column for vertical edges
        const cx = Math.floor(w/2);
        const lum = new Array(h);
        for(let y=0;y<h;y++){
          const idx = (y*w + cx)*4;
          const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
          lum[y] = a<20 ? null : luminance(r,g,b);
        }
        // find first non-null from top
        let topNonNull = 0; while(topNonNull<h && lum[topNonNull]==null) topNonNull++;
        let bottomNonNull = h-1; while(bottomNonNull>=0 && lum[bottomNonNull]==null) bottomNonNull--;

        // compute variance in sliding window and find region of low variance (flat face)
        function variance(arr, i, win=7){
          let s=0, s2=0, n=0;
          for(let k=i-Math.floor(win/2);k<=i+Math.floor(win/2);k++){
            if(k<0||k>=arr.length) continue;
            if(arr[k]==null) continue;
            s += arr[k]; s2 += arr[k]*arr[k]; n++;
          }
          if(n<=1) return Infinity;
          return s2/n - (s/n)*(s/n);
        }

        let flatStart = null, flatEnd = null;
        for(let y=topNonNull+5; y<bottomNonNull-5; y++){
          const v = variance(lum,y,9);
          if(v<40){ // threshold tuned
            // find contiguous block
            if(flatStart===null) flatStart = y;
            flatEnd = y;
          } else {
            if(flatStart!==null) break;
          }
        }

        if(flatStart===null){
          // fallback: treat central area as flat
          flatStart = Math.floor(h*0.12);
          flatEnd = Math.floor(h*0.7);
        }

        // approximate circle diameter by scanning horizontal slices near top quarter of flat area
        const probeY = Math.max(topNonNull+Math.floor((flatStart-topNonNull)/2), Math.floor(h*0.18));
        // move down until this row has non-null
        let py = probeY; while(py<h && lum[py]==null) py++;
        // find left/right extents at that y where pixels differ from background (alpha>20)
        let left = null, right = null;
        for(let x=0;x<w;x++){
          const idx = (py*w + x)*4; if(data[idx+3]<20) continue; // transparent
          left = x; break;
        }
        for(let x=w-1;x>=0;x--){
          const idx = (py*w + x)*4; if(data[idx+3]<20) continue;
          right = x; break;
        }
        if(left===null || right===null){ left = Math.floor(w*0.25); right = Math.floor(w*0.75); }
        const faceWidth = right - left;
        // assume photo size is about 0.5*faceWidth or 0.5*image width
        const photoSizePx = Math.min(faceWidth*0.6, Math.floor(w*0.56));

        // determine top of carved recess: scan from topNonNull down to flatStart for region where curvature begins
        let recessTop = topNonNull;
        for(let y=topNonNull; y<flatStart; y++){
          const v = variance(lum,y,7);
          if(v<80){ recessTop = y; break; }
        }

        // determine inscription panel top: we take flatEnd + small margin
        const inscriptionTop = Math.max(flatEnd + Math.floor(h*0.02), Math.floor(h*0.55));
        const inscriptionBottom = bottomNonNull - Math.floor(h*0.05);
        const inscriptionHeight = Math.max( Math.floor((inscriptionBottom - inscriptionTop)), Math.floor(h*0.12));

        resolve({
          file: path.basename(filePath),
          width: w, height: h,
          photoTopPx: recessTop,
          photoSizePx,
          textPanelTopPx: inscriptionTop,
          textPanelHeightPx: inscriptionHeight,
          photoTopPct: +(recessTop/h*100).toFixed(2),
          photoSizePct: +(photoSizePx/w*100).toFixed(2),
          textPanelTopPct: +(inscriptionTop/h*100).toFixed(2),
          textPanelHeightPct: +(inscriptionHeight/h*100).toFixed(2),
        });
      })
      .on('error', reject);
  });
}

async function main(){
  const dir = path.join(__dirname,'..','public','STONES');
  const results = {};
  for(let i=1;i<=13;i++){
    const fname = `stone_${i}.png`;
    const p = path.join(dir,fname);
    if(!fs.existsSync(p)){
      console.error('Missing',fname); continue;
    }
    try{
      const r = await analyze(p);
      results[`stone_${i}`]=r;
      console.log(JSON.stringify(r));
    }catch(e){ console.error('err',fname,e); }
  }
  fs.writeFileSync(path.join(__dirname,'..','public','STONES','_measured_layouts.json'), JSON.stringify(results,null,2));
  console.log('Wrote measurements to public/STONES/_measured_layouts.json');
}

main().catch(e=>{console.error(e); process.exit(1);});
