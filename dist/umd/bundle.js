!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).Pico8Reader={})}(this,(function(e){"use strict";let t=[],n=0;function o(e,t){const n=Math.ceil(t/e.length);return e.repeat(n).slice(0,t)}function r(){const e=t[n];return n+=1,e}function s(e){const o=t.slice(n,n+e).reverse().join("");return n+=e,o}function i(e,t){const n=t.length;if(e.length<n)return!1;for(let o=0;o<n;o++)if(e[o]!==t[o])return!1;return!0}function c(e){const c=e.slice(17152,32768),f=i(c,new Uint8Array([0,112,120,97]));i(c,new Uint8Array([58,99,58,0]));const l=c.slice(4);if(f){return function(e){const i=e[0]<<8|e[1],c=[];for(let e=0;e<256;e++)c.push(e);const f=e.slice(4);t=[];for(let e=0;e<f.length;e++){const n=f[e].toString(2).padStart(8,"0").split("").reverse();t.push(...n)}let l="";for(n=0;l.length<i;)if("1"===r()){let e=0;for(;"1"===r();)e+=1;const t=(1<<e)-1,n=s(e+4),o=parseInt(n,2)+(t<<4);l+=String.fromCharCode(c[o]);const i=c.splice(o,1);c.unshift(i[0])}else{let e;e="1"===r()?"1"===r()?5:10:15;const t=s(e),n=parseInt(t,2)+1;let i=3;for(;;){const e=s(3),t=parseInt(e,2);if(i+=t,7!==t)break}if(n>l.length)throw console.warn("offset 大于 code 长度",n,l.length,l),new Error("offset 大于 code 长度");let c="";c=i>=n?l.slice(-n):l.slice(-n,-n+i),i>n&&(c+=o(c,i-n)),l+=c}return l}(l)}}e.readP8=async function(e){var t;return{asset:undefined,code:c(function(e){const t=new Uint8Array(e.length/4);for(let n=0;n<e.length;n+=4){const o=3&e[n],r=3&e[n+1],s=3&e[n+2],i=(3&e[n+3])<<6|o<<4|r<<2|s;t[n/4]=i}return t}(await(t=e,new Promise(((e,n)=>{const o=new Image;o.onload=()=>{const t=document.createElement("canvas"),n=t.getContext("2d");t.width=o.width,t.height=o.height,n.drawImage(o,0,0);const r=n.getImageData(0,0,t.width,t.height).data;e(r)},o.onerror=()=>{n(new Error("无法加载图片"))},o.src=t})))))}}}));
