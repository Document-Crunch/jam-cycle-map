// Sanity check for index.html: embedded data parses, embedded template equals source, main script parses.
const fs=require('fs');
const h=fs.readFileSync('index.html','utf8');
const unesc=s=>s.replace(/<\\\//g,'</');
const get=(html,id)=>{const m=html.match(new RegExp('<script id="'+id+'" type="application/json">([\\s\\S]*?)</script>'));return JSON.parse(unesc(m[1]));};
const d=get(h,'data'), tpl=get(h,'tpl');
const tplEnd = h.indexOf('</script>', h.indexOf('<script id="tpl"')) + 9;
const js = h.slice(h.indexOf('<script>', tplEnd)+8, h.lastIndexOf('</script>'));
new Function(js);
console.log('ok:', d.meta.version, '| template embedded verbatim:', tpl===fs.readFileSync('template.html','utf8'), '| bytes', h.length);
