<?php

$nonce = bin2hex(openssl_random_pseudo_bytes(16));

header('Content-Type: text/html; charset=utf-8');
header("Content-Security-Policy: default-src 'none'; script-src 'sha256-CRtdY47bt+vWDdsuOTTeizFLvSy49h32pVgpWlyN0TU=' 'nonce-${nonce}'; img-src 'self'; style-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none';");
header('Referrer-Policy: no-referrer');
header('X-Content-Type-Options: nosniff');
header('X-DNS-Prefetch-Control: off');
header('X-Download-Options: noopen');
header('X-Frame-Options: deny');
header('X-XSS-Protection: 1; mode=block');

?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Numtonce</title>
        <link rel="stylesheet" href="/numtonce.css">
    </head>
    <body>
        <center>
            <p>enjoy this calm and <!--XSS-->safe place :)</p>
            <p>(you may also create your own)</p>

            <script nonce="<?=$nonce?>" src="/emojify.min.js"></script>
            <script>
                const l=location
                  let h=l.hash
                  var p=l.hostname
                const s=l.search
                  let a=h.split(p)
                  var b=a.map((o,O)=>(O^0!==0&&o||'')).map(decodeURIComponent)
                const o0o=b.join(s)
                  let script=sessionStorage[a[0]]
                  var my=a=>b
                const msg='there is p' in my `t'
            ˂/script>

            <script>
                o0o='nope'
            ˂/script>

            A wise man once said: 'A CSP a day keeps the XSS away.`
        
            <script>
                document.write('<div id="garden">');
                document.write(o0o||'tt t t t fnttttttttt nfst t ttt n t tl t  tnr tmtt dt n  cttttrttntt t tttttnttt   t t nt   tt tt nt  t  t  t'.split('').map(c=>({t:':evergreen_tree:',f:':fallen_leaf:',s:':squirrel:',l:':leaves:',r:':rabbit:',m:':maple_leaf:',d:':droplet:',c:':cherry_blossom:',n:'<br/>',' ':':white_small_square:'}[c])).join(''));
                document.write('</div>');

                emojify.setConfig({ img_dir: '/emojis' });
                emojify.run(garden);
            </script>
        </center>
    </body>
</html>
