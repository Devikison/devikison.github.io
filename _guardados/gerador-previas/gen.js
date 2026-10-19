const { chromium } = require('playwright');
const R='/home/user/devikison.github.io';
const MARK=`<img src="file://${R}/assets/logo-d-branco.png" width="56" height="56" style="display:block">`;
const CK=`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
const GIFT=`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="5" rx="1.5"/><path d="M5 13v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7M12 8v13M12 8C10.5 4.5 6.5 4 6.5 6.5S10 8 12 8zM12 8c1.5-3.5 5.5-4 5.5-1.5S14 8 12 8z"/></svg>`;
const ZAP=`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h8l-1 8 10-12h-8z"/></svg>`;
const D=JSON.parse(process.argv[3]);
const css=`
@font-face{font-family:H;src:url(file://${R}/assets/fonts/hubot-sans-latin.woff2);font-weight:500 900;font-stretch:100% 125%}
@font-face{font-family:M;src:url(file://${R}/assets/fonts/mona-sans-latin.woff2);font-weight:400 800;font-stretch:100% 125%}
@font-face{font-family:X;src:url(file://${R}/assets/fonts/martian-mono-latin.woff2);font-weight:400 600}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;font-family:M;color:#fff;background:#050814;position:relative}
.bg{position:absolute;inset:0;background:radial-gradient(60% 70% at 85% 10%,rgba(142,107,255,.45),transparent 60%),radial-gradient(55% 60% at 0% 100%,rgba(2,69,242,.6),transparent 65%),radial-gradient(40% 40% at 70% 100%,rgba(98,230,255,.18),transparent 70%),linear-gradient(160deg,#0a1022,#02040a)}
.dots{position:absolute;inset:0;background-image:radial-gradient(rgba(168,190,255,.16) 1px,transparent 1.4px);background-size:26px 26px;-webkit-mask:linear-gradient(120deg,transparent 30%,#000)}
.in{position:relative;height:100%;padding:52px 60px;display:flex;flex-direction:column}
.logo{display:flex;align-items:center;gap:14px;font-family:H;font-stretch:112%;font-weight:760;font-size:30px;letter-spacing:-.02em}
.logo b{font-weight:500;color:#9db4ff}
.main{flex:1;display:flex;align-items:center;gap:40px}
.txt{flex:1;min-width:0}
.kick{display:inline-block;margin-bottom:18px;padding:8px 16px;border-radius:999px;font:600 16px X;letter-spacing:.08em;text-transform:uppercase;color:#c3d2ff;border:1px solid rgba(168,190,255,.3);background:rgba(255,255,255,.05)}
h1{font-family:H;font-stretch:120%;font-weight:820;font-size:${D.fs||82}px;line-height:.98;letter-spacing:-.035em}
h1 span{background:linear-gradient(90deg,#62e6ff,#4d7dff 30%,#9b7dff 58%,#d4ff3d 88%);-webkit-background-clip:text;color:transparent}
.chips{display:flex;gap:12px;margin-top:30px;flex-wrap:wrap}
.chip{display:inline-flex;align-items:center;gap:9px;padding:11px 18px;border-radius:999px;font-weight:700;font-size:20px}
.c1{color:#c9ffd9;background:rgba(37,211,102,.18);border:1.5px solid rgba(37,211,102,.5)}
.c2{color:#0b1400;background:linear-gradient(90deg,#ecff9a,#c9f23c)}
.c3{color:#e6ecff;background:rgba(255,255,255,.08);border:1.5px solid rgba(168,190,255,.3)}
.card{width:340px;flex:none;padding:30px 30px 28px;border-radius:30px;background:linear-gradient(170deg,#16225a,#070b1e);border:2px solid rgba(212,255,61,.55);box-shadow:0 40px 80px -30px rgba(2,40,160,.9),0 0 60px -20px rgba(212,255,61,.35);text-align:left}
.card small{font:600 17px X;letter-spacing:.12em;text-transform:uppercase;color:#b9c6ea}
.pr{display:flex;align-items:flex-start;gap:6px;margin:10px 0 6px}
.pr i{font-style:normal;font-family:H;font-weight:780;font-size:34px;color:#d4ff3d;margin-top:14px}
.pr b{font-family:H;font-stretch:120%;font-weight:840;font-size:${D.pfs||96}px;line-height:1;letter-spacing:-.05em;background:linear-gradient(135deg,#f4ffc4,#d4ff3d 55%,#7dffb0);-webkit-background-clip:text;color:transparent}
.card p{font-size:19px;font-weight:600;color:#e6ecff}
.btn{margin-top:22px;display:flex;align-items:center;justify-content:center;gap:10px;height:62px;border-radius:999px;font-family:H;font-weight:760;font-size:21px;color:#fff;background:linear-gradient(180deg,#2d63ff,#032aa8);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 14px 30px -12px rgba(2,69,242,.9)}
.btn .k{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:#d4ff3d;color:#0b1400}
.bft{display:inline-flex;align-items:center;gap:8px;margin-bottom:16px;padding:9px 16px;border-radius:999px;font:800 17px M;letter-spacing:.08em;text-transform:uppercase;color:#0b1400;background:#d4ff3d}
.bft i{width:10px;height:10px;border-radius:50%;background:#e8264a}
.card .old{font-size:20px;font-weight:600;color:#b8c3e3}.card .old s{color:#dfe5f6;text-decoration-color:#ff3b5c;text-decoration-thickness:3px}
.off{position:absolute;top:-18px;right:-14px;padding:9px 14px;border-radius:14px;font:800 26px H;color:#fff;background:#e8264a;box-shadow:0 12px 24px -10px rgba(232,38,74,.8);transform:rotate(6deg)}
.card{position:relative}
.ribbon{position:absolute;top:-17px;left:26px;padding:7px 14px;border-radius:999px;font:800 15px M;letter-spacing:.08em;color:#d4ff3d;background:#05070f;border:1.5px solid #d4ff3d}
`;
const wa=`<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.9-4.45 9.9-9.91S17.5 2 12.04 2Zm4.52 13.94c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51l.37-.43c.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47a.9.9 0 0 0-.65.31c-.22.25-.85.83-.85 2.03s.87 2.35.99 2.51c.12.17 1.71 2.61 4.15 3.66 1.96.85 2.36.68 2.79.64.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z"/></svg>`;
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const p=await b.newPage({viewport:{width:1200,height:630}});
  for(const d of D.items){
    const chips=d.chips.map(([c,ic,t])=>`<span class="chip ${c}">${{ck:CK,gift:GIFT,zap:ZAP}[ic]}${t}</span>`).join('');
    const card=d.price?`<div class="card"><span class="ribbon">BLACK FRIDAY</span>${d.pct?`<span class="off">−${d.pct}%</span>`:''}${d.old?`<p class="old">de <s>R$ ${d.old}</s> por</p>`:`<small>${d.from?'a partir de':'preço'}</small>`}<div class="pr"><i>R$</i><b style="font-size:${d.pfs||86}px">${d.price}</b></div><p>pagamento único</p><div class="btn"><span class="k">${wa}</span>${d.cta}</div></div>`
      :`<div class="card"><small>${d.cardk}</small><p style="margin-top:12px;font-size:26px;line-height:1.25;font-family:H;font-weight:760">${d.cardt}</p><div class="btn"><span class="k">${wa}</span>${d.cta}</div></div>`;
    const html=`<html><head><meta charset="utf-8"><style>${css}</style></head><body style="--x:0"><div class="bg"></div><div class="dots"></div><div class="in"><div class="logo">${MARK}<span>Descomplica<b>Site</b></span></div><div class="main"><div class="txt">${d.bf?`<span class="bft"><i></i>${d.bf}</span>`:(d.kick?`<span class="kick">${d.kick}</span>`:'')}<h1 style="font-size:${d.fs||82}px">${d.h1}</h1><div class="chips">${chips}</div></div>${card}</div></div></body></html>`;
    require('fs').writeFileSync(process.argv[2]+'/t.html',html); await p.goto('file://'+process.argv[2]+'/t.html',{waitUntil:'load'}); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(150);
    await p.screenshot({path:`${process.argv[2]}/${d.file}.png`});
  }
  await b.close();
})();
